#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate the corporate headshot for the OEC persona Hélène Marchand
(Numeris Expertise — Wave 2 / Phase P1d).

Pipeline:
    1. Load OPENAI_API_KEY from ARKEE_ORG/.env (with fallback to local .env).
    2. Call OpenAI Images API (`gpt-image-2`, fallback `gpt-image-1`) with the
       corporate-headshot prompt.
    3. Decode base64/url response, save as JPEG into
       public/images/team/helene-marchand.jpg (1024x1024).
    4. Log MD5 + file size + reverse-search reminder.

Used by ExpertAuthorBox + PersonJsonLd (presidentPhotoUrl in
src/data/legal-entity.ts → "/images/team/helene-marchand.jpg").

Reference pattern: teams/content/tools/keobiz_pipeline/07_generate_images.py
+ teams/content/tools/image_gen/generate_image.py (ARKEE_ORG).

Usage:
    python scripts/generate-helene-photo.py
    python scripts/generate-helene-photo.py --dry-run
    python scripts/generate-helene-photo.py --force          # overwrite existing
    python scripts/generate-helene-photo.py --model gpt-image-1
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import io
import os
import sys
import time
import urllib.request
from pathlib import Path


# ──────────────────────────────────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parents[1]  # numeris/
OUTPUT_DIR = REPO_ROOT / "public" / "images" / "team"
OUTPUT_PATH = OUTPUT_DIR / "helene-marchand.jpg"

ARKEE_ENV = Path("/Users/nicolas/ARKEE_ORG/.env")
LOCAL_ENV = REPO_ROOT / ".env"


# ──────────────────────────────────────────────────────────────────────────
# Prompt (synthetic OEC persona — sober historical cabinet positioning)
# ──────────────────────────────────────────────────────────────────────────

PROMPT = (
    "Professional corporate headshot, French chartered accountant woman age 48, "
    "short bob hair brown with subtle highlights, light natural makeup, "
    "rimmed reading glasses, dark navy blazer over cream silk blouse, "
    "soft natural office lighting from window, blurred background of modern "
    "professional office with bookshelves and tasteful framed diplomas visible "
    "out of focus, confident warm professional smile, looking directly at camera, "
    "photorealistic, business portrait quality, neutral elegant color palette, "
    "no logos or text visible"
)

SIZE = "1024x1024"
# gpt-image-2 and gpt-image-1 share the same quality vocabulary:
# 'low' | 'medium' | 'high' | 'auto'. 'hd' (DALL·E 3 vintage) is rejected.
QUALITY = "high"
MODEL_PRIMARY = "gpt-image-2"
MODEL_FALLBACK = "gpt-image-1"


# ──────────────────────────────────────────────────────────────────────────
# Env loading (no python-dotenv dependency — minimal parser)
# ──────────────────────────────────────────────────────────────────────────

def _load_env_file(path: Path) -> dict[str, str]:
    if not path.is_file():
        return {}
    out: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key:
            out[key] = val
    return out


def load_openai_key() -> str:
    # Order: existing env var, ARKEE_ORG .env, local .env
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key
    for env_path in (ARKEE_ENV, LOCAL_ENV):
        data = _load_env_file(env_path)
        if data.get("OPENAI_API_KEY"):
            return data["OPENAI_API_KEY"]
    raise SystemExit(
        "ERROR: OPENAI_API_KEY missing. Set it in env, "
        f"in {ARKEE_ENV}, or in {LOCAL_ENV}."
    )


# ──────────────────────────────────────────────────────────────────────────
# OpenAI image generation
# ──────────────────────────────────────────────────────────────────────────

def call_openai_images(api_key: str, model: str) -> bytes:
    """Call OpenAI Images API; return raw image bytes (PNG)."""
    try:
        from openai import OpenAI
    except ImportError as e:
        raise SystemExit(
            "ERROR: openai SDK missing. Install via "
            "`pip install openai` (project may use venv at numeris/.venv)."
        ) from e

    client = OpenAI(api_key=api_key)
    kwargs = dict(model=model, prompt=PROMPT, size=SIZE, n=1, quality=QUALITY)

    print(f"[gen] Calling OpenAI images.generate(model={model}, size={SIZE}, quality={kwargs.get('quality')})")
    response = client.images.generate(**kwargs)

    img = response.data[0]
    b64 = getattr(img, "b64_json", None)
    if b64:
        return base64.b64decode(b64)
    url = getattr(img, "url", None)
    if url:
        print(f"[gen] Got URL response, downloading {url[:60]}...")
        with urllib.request.urlopen(url) as r:
            return r.read()
    raise RuntimeError("OpenAI response had neither b64_json nor url")


def generate_with_fallback(api_key: str, force_model: str | None) -> tuple[bytes, str]:
    """Try primary model, fallback once on rate limit / model unavailable."""
    models = [force_model] if force_model else [MODEL_PRIMARY, MODEL_FALLBACK]
    last_err: Exception | None = None
    for attempt, model in enumerate(models, 1):
        try:
            return call_openai_images(api_key, model), model
        except Exception as e:
            last_err = e
            msg = str(e).lower()
            # If model is not found / not supported → try fallback immediately.
            if any(token in msg for token in ("model_not_found", "does not exist", "unsupported", "invalid_model")):
                print(f"[gen] Model {model} unavailable ({e}); trying next.")
                continue
            # If rate limit → retry the SAME model once with backoff.
            if "rate" in msg or "429" in msg:
                print(f"[gen] Rate limited on {model}; sleeping 8s and retrying once.")
                time.sleep(8)
                try:
                    return call_openai_images(api_key, model), model
                except Exception as e2:
                    last_err = e2
                    print(f"[gen] Retry failed on {model}: {e2}")
                    continue
            # Quota / billing → fail fast with clear hint.
            if "insufficient_quota" in msg or "billing" in msg or "quota" in msg:
                raise SystemExit(
                    f"ERROR: OpenAI quota exhausted on {model}: {e}\n"
                    "Suggestion: top-up OpenAI billing, or fallback to Flux / Midjourney "
                    "and hand-pick a 1024x1024 corporate headshot, then drop it into "
                    f"{OUTPUT_PATH}."
                ) from e
            # Anything else → bubble up.
            raise
    raise SystemExit(f"ERROR: All models failed. Last error: {last_err}")


# ──────────────────────────────────────────────────────────────────────────
# Image conversion → JPEG 1024
# ──────────────────────────────────────────────────────────────────────────

def save_as_jpeg(png_bytes: bytes, output_path: Path) -> Path:
    """Convert PNG bytes → JPEG (RGB) at the configured path. Returns path."""
    try:
        from PIL import Image
    except ImportError as e:
        raise SystemExit(
            "ERROR: Pillow required. `pip install Pillow`."
        ) from e

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    # Keep 1024 — matches ExpertAuthorBox crop and Next/Image sizing.
    if img.width != 1024 or img.height != 1024:
        img = img.resize((1024, 1024), Image.LANCZOS)
    img.save(output_path, "JPEG", quality=88, optimize=True, progressive=True)
    return output_path


# ──────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────

def main() -> int:
    p = argparse.ArgumentParser(description="Generate Hélène Marchand corporate headshot.")
    p.add_argument("--dry-run", action="store_true", help="Print prompt + path, don't call API.")
    p.add_argument("--force", action="store_true", help="Overwrite existing file.")
    p.add_argument(
        "--model",
        default=None,
        help=f"Force model id (default: try {MODEL_PRIMARY} then {MODEL_FALLBACK}).",
    )
    args = p.parse_args()

    print(f"[helene-photo] Output target: {OUTPUT_PATH}")
    print(f"[helene-photo] Prompt ({len(PROMPT)} chars):\n  {PROMPT}\n")

    if OUTPUT_PATH.exists() and not args.force and not args.dry_run:
        print(
            f"[helene-photo] {OUTPUT_PATH} already exists. "
            "Pass --force to regenerate. Aborting."
        )
        return 0

    if args.dry_run:
        print("[helene-photo] --dry-run: skipping API call.")
        return 0

    api_key = load_openai_key()
    print(f"[helene-photo] API key loaded (len={len(api_key)}, prefix={api_key[:7]}…)")

    png_bytes, used_model = generate_with_fallback(api_key, args.model)
    print(f"[helene-photo] Got {len(png_bytes):,} bytes from model={used_model}")

    saved_path = save_as_jpeg(png_bytes, OUTPUT_PATH)
    file_size = saved_path.stat().st_size
    md5 = hashlib.md5(saved_path.read_bytes()).hexdigest()

    print("")
    print("[helene-photo] DONE.")
    print(f"  path:   {saved_path}")
    print(f"  size:   {file_size:,} bytes ({file_size / 1024:.1f} KB)")
    print(f"  md5:    {md5}")
    print(f"  model:  {used_model}")
    print("")
    print("[reverse-search] Manual verification recommended:")
    print("  - Open https://tineye.com/search and upload the JPEG, or")
    print("  - Use Google Images > 'Search by image' with the local file.")
    print("  - Confirm 0 match >0.7 similarity (synthetic identity, must not")
    print("    correspond to a real public person).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
