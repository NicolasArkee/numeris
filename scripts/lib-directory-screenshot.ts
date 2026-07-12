/**
 * scripts/lib-directory-screenshot.ts
 *
 * Capture d'écran du site officiel d'un cabinet (Chrome headless CLI — aucune
 * dépendance npm) + upload vers Supabase Storage (bucket public
 * `directory-previews`) → URL publique à stocker en fact
 * `source_preview_image` (rendue par DirectoryProfileV2 / RelatedCabinets).
 *
 * Consommé par generate-directory-fiche-genai.ts (piste A) et
 * backfill-directory-screenshots.ts. Tolérant aux échecs : renvoie null.
 */
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BUCKET = "directory-previews";
const VIEWPORT = "1280,800";
const CAPTURE_TIMEOUT_MS = 25_000;

let supa: SupabaseClient | null = null;
let bucketReady = false;

// Sémaphore : borne le nombre de Chrome headless simultanés quel que soit le
// niveau de concurrence du batch appelant.
const MAX_CONCURRENT_CHROME = 3;
let activeChrome = 0;
const chromeQueue: (() => void)[] = [];
async function acquireChromeSlot(): Promise<void> {
  if (activeChrome < MAX_CONCURRENT_CHROME) { activeChrome++; return; }
  await new Promise<void>((resolve) => chromeQueue.push(resolve));
  activeChrome++;
}
function releaseChromeSlot(): void {
  activeChrome--;
  chromeQueue.shift()?.();
}

function getSupabase(): SupabaseClient | null {
  if (supa) return supa;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supa = createClient(url, key, { auth: { persistSession: false } });
  return supa;
}

export function isScreenshotCapable(): boolean {
  return fs.existsSync(CHROME_BIN) && !!getSupabase();
}

async function ensureBucket(client: SupabaseClient): Promise<void> {
  if (bucketReady) return;
  const { data } = await client.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await client.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: "2MB",
      allowedMimeTypes: ["image/png", "image/jpeg"],
    });
    if (error && !/already exists/iu.test(error.message)) throw error;
  }
  bucketReady = true;
}

/** PNG Chrome (~250-400 Ko) → JPEG (~60-100 Ko) via sips (natif macOS) —
 *  ~3 000 captures attendues, le PNG brut menacerait le quota Storage. */
function convertToJpeg(pngPath: string): Promise<string | null> {
  const jpgPath = pngPath.replace(/\.png$/u, ".jpg");
  return new Promise((resolve) => {
    execFile(
      "sips",
      ["-s", "format", "jpeg", "-s", "formatOptions", "78", pngPath, "--out", jpgPath],
      { timeout: 15_000 },
      (error) => resolve(!error && fs.existsSync(jpgPath) ? jpgPath : null),
    );
  });
}

function chromeScreenshot(url: string, outPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = execFile(
      CHROME_BIN,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--disable-extensions",
        "--mute-audio",
        `--window-size=${VIEWPORT}`,
        "--hide-scrollbars",
        // Laisse le JS/lazy-load se poser avant la capture.
        "--virtual-time-budget=9000",
        `--screenshot=${outPath}`,
        url,
      ],
      { timeout: CAPTURE_TIMEOUT_MS },
      (error) => resolve(!error && fs.existsSync(outPath) && fs.statSync(outPath).size > 8_000),
    );
    child.on("error", () => resolve(false));
  });
}

/**
 * Capture le site et l'upload. Renvoie l'URL publique Supabase Storage,
 * ou null (Chrome absent, site injoignable, page vide, upload KO).
 */
export async function captureWebsiteScreenshot(
  websiteUrl: string,
  siret: string,
): Promise<string | null> {
  const client = getSupabase();
  if (!client || !fs.existsSync(CHROME_BIN)) return null;
  const tmp = path.join(os.tmpdir(), `skoria-preview-${siret}.png`);
  let jpg: string | null = null;
  await acquireChromeSlot();
  let ok: boolean;
  try {
    ok = await chromeScreenshot(websiteUrl, tmp);
  } finally {
    releaseChromeSlot();
  }
  try {
    if (!ok) return null;
    await ensureBucket(client);
    jpg = await convertToJpeg(tmp);
    const objectPath = jpg ? `${siret}-website.jpg` : `${siret}-website.png`;
    const { error } = await client.storage
      .from(BUCKET)
      .upload(objectPath, fs.readFileSync(jpg ?? tmp), {
        contentType: jpg ? "image/jpeg" : "image/png",
        upsert: true,
      });
    if (error) return null;
    const { data } = client.storage.from(BUCKET).getPublicUrl(objectPath);
    return data.publicUrl ?? null;
  } catch {
    return null;
  } finally {
    fs.rmSync(tmp, { force: true });
    if (jpg) fs.rmSync(jpg, { force: true });
  }
}
