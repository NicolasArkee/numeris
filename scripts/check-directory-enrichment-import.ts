import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { SCHEMA } from "../src/libs/db/schema";

function runSuppressionImportCase(
  caseName: string,
  options: {
    cabinetSiren: string | null;
    suppressionSiren: string | null;
    suppressionSiret: string | null;
  },
): void {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "numeris-enrichment-import-"));
  const tempDbPath = path.join(tempDir, "numeris.db");

  const db = new Database(tempDbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);

  const cabinet = db.prepare(
    `INSERT INTO directory_cabinets
       (siren, legal_name, naf_code, is_active, oec_status, confidence_score, publish_status)
     VALUES
       (@siren, @legal_name, '69.20Z', 1, 'unverified', 0, 'draft')
     RETURNING id`,
  ).get({
    siren: options.cabinetSiren,
    legal_name: `Suppressed pilot cabinet ${caseName}`,
  }) as { id: number };

  const establishment = db.prepare(
    `INSERT INTO directory_establishments
       (cabinet_id, siret, is_active)
     VALUES
       (?, '44110142500037', 1)
     RETURNING id`,
  ).get(cabinet.id) as { id: number };

  db.prepare(
    `INSERT INTO privacy_suppression_requests
       (siren, siret, requester_hash, reason, status)
     VALUES
       (@siren, @siret, @requester_hash, 'Regression check', 'active')`,
  ).run({
    siren: options.suppressionSiren,
    siret: options.suppressionSiret,
    requester_hash: `check-directory-enrichment-import-${caseName}`,
  });
  db.close();

  try {
    const output = execFileSync(
      "npx",
      [
        "tsx",
        "scripts/import-directory-enrichment.ts",
        "--file=data/directory-enrichment-pilot.sample.json",
        `--db=${tempDbPath}`,
        "--apply-publication=true",
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    const result = JSON.parse(output) as {
      imported: number;
      results: Array<{ siret: string; score: number; canPublish: boolean }>;
    };
    assert.equal(result.imported, 1, caseName);
    assert.equal(result.results[0]?.canPublish, false, caseName);

    const verifyDb = new Database(tempDbPath, { readonly: true });
    try {
      const cabinetAfterImport = verifyDb.prepare(
        `SELECT publish_status, confidence_score, oec_status
         FROM directory_cabinets
         WHERE id = ?`,
      ).get(cabinet.id) as {
        publish_status: string;
        confidence_score: number;
        oec_status: string;
      };
      assert.equal(cabinetAfterImport.publish_status, "draft", caseName);
      assert.equal(cabinetAfterImport.confidence_score, 0, caseName);
      assert.equal(cabinetAfterImport.oec_status, "unverified", caseName);

      const snapshot = verifyDb.prepare(
        `SELECT blocking_reason, snapshot_json
         FROM directory_qualification_snapshots
         WHERE cabinet_id = ?
           AND establishment_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 1`,
      ).get(cabinet.id, establishment.id) as {
        blocking_reason: string | null;
        snapshot_json: string;
      };
      assert.equal(snapshot.blocking_reason, "active_suppression_request", caseName);

      const snapshotJson = JSON.parse(snapshot.snapshot_json) as {
        has_active_suppression?: boolean;
      };
      assert.equal(snapshotJson.has_active_suppression, true, caseName);
    } finally {
      verifyDb.close();
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

runSuppressionImportCase("siret-only", {
  cabinetSiren: null,
  suppressionSiren: null,
  suppressionSiret: "44110142500037",
});

runSuppressionImportCase("siren-only", {
  cabinetSiren: "441101425",
  suppressionSiren: "441101425",
  suppressionSiret: null,
});

console.log("Directory enrichment import suppression OK");
