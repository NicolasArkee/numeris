import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { SCHEMA } from "../src/libs/db/schema";

type ImportResult = {
  imported: number;
  results: Array<{ siret: string; score: number; canPublish: boolean }>;
};

function runImporter(args: string[]): ImportResult {
  const output = execFileSync("npx", ["tsx", "scripts/import-directory-enrichment.ts", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return JSON.parse(output) as ImportResult;
}

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
    const result = runImporter([
      "--file=data/directory-enrichment-pilot.sample.json",
      `--db=${tempDbPath}`,
      "--apply-publication=true",
    ]);
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

function writeReplacementPayload(
  filePath: string,
  sourceUrl: string,
  facts: Array<{ fact_type: string; label: string; value: string; confidence: number; is_displayable: boolean }>,
): void {
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      [
        {
          siret: "44110142500037",
          source: {
            source_key: "replacement-regression",
            source_type: "manual",
            source_url: sourceUrl,
            retrieved_at: "2026-06-28T08:00:00.000Z",
            legal_basis: "Regression check",
            raw_excerpt: "Regression check",
          },
          matches: {
            professional_status: "manual_verified",
            matched_registry: true,
            matched_website: true,
            matched_address: true,
            matched_siren_or_siret: true,
            has_website_contact_page: true,
          },
          facts,
        },
      ],
      null,
      2,
    ),
  );
}

function runSourceReplacementCase(): void {
  const caseName = "source-url-replacement";
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "numeris-enrichment-import-"));
  const tempDbPath = path.join(tempDir, "numeris.db");
  const firstPayloadPath = path.join(tempDir, "replacement-first.json");
  const secondPayloadPath = path.join(tempDir, "replacement-second.json");

  const db = new Database(tempDbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);

  const cabinet = db.prepare(
    `INSERT INTO directory_cabinets
       (siren, legal_name, naf_code, is_active, oec_status, confidence_score, publish_status)
     VALUES
       ('441101425', 'Replacement pilot cabinet', '69.20Z', 1, 'unverified', 0, 'draft')
     RETURNING id`,
  ).get() as { id: number };

  const establishment = db.prepare(
    `INSERT INTO directory_establishments
       (cabinet_id, siret, is_active)
     VALUES
       (?, '44110142500037', 1)
     RETURNING id`,
  ).get(cabinet.id) as { id: number };

  const unrelatedSource = db.prepare(
    `INSERT INTO directory_enrichment_sources
       (cabinet_id, establishment_id, source_key, source_type, source_url, legal_basis)
     VALUES
       (?, ?, 'unrelated-regression', 'manual', 'https://unrelated.example.test', 'Regression check')
     RETURNING id`,
  ).get(cabinet.id, establishment.id) as { id: number };

  db.prepare(
    `INSERT INTO directory_profile_facts
       (cabinet_id, establishment_id, fact_type, label, value, source_id, confidence, is_displayable)
     VALUES
       (?, ?, 'team_signal', 'Unrelated signal', 'Unrelated team signal', ?, 50, 1)`,
  ).run(cabinet.id, establishment.id, unrelatedSource.id);
  db.close();

  writeReplacementPayload(firstPayloadPath, "https://old-source.example.test", [
    {
      fact_type: "website",
      label: "Old website",
      value: "https://old-source.example.test",
      confidence: 90,
      is_displayable: true,
    },
    {
      fact_type: "service",
      label: "Old service",
      value: "Legacy advisory",
      confidence: 80,
      is_displayable: true,
    },
  ]);

  writeReplacementPayload(secondPayloadPath, "https://new-source.example.test", [
    {
      fact_type: "website",
      label: "New website",
      value: "https://new-source.example.test",
      confidence: 95,
      is_displayable: true,
    },
    {
      fact_type: "service",
      label: "New service",
      value: "Current payroll",
      confidence: 90,
      is_displayable: true,
    },
  ]);

  try {
    assert.equal(
      runImporter([`--file=${firstPayloadPath}`, `--db=${tempDbPath}`]).imported,
      1,
      caseName,
    );
    assert.equal(
      runImporter([`--file=${secondPayloadPath}`, `--db=${tempDbPath}`]).imported,
      1,
      caseName,
    );

    const verifyDb = new Database(tempDbPath, { readonly: true });
    try {
      const replacementFacts = verifyDb.prepare(
        `SELECT f.fact_type, f.value, s.source_url
         FROM directory_profile_facts f
         JOIN directory_enrichment_sources s ON s.id = f.source_id
         WHERE f.cabinet_id = ?
           AND f.establishment_id = ?
           AND s.source_key = 'replacement-regression'
         ORDER BY f.fact_type, f.value`,
      ).all(cabinet.id, establishment.id) as Array<{
        fact_type: string;
        value: string;
        source_url: string | null;
      }>;

      assert.deepEqual(
        replacementFacts.map((fact) => ({ fact_type: fact.fact_type, value: fact.value })),
        [
          { fact_type: "service", value: "Current payroll" },
          { fact_type: "website", value: "https://new-source.example.test" },
        ],
        caseName,
      );
      assert.ok(
        replacementFacts.every((fact) => fact.source_url === "https://new-source.example.test"),
        caseName,
      );

      const unrelatedFact = verifyDb.prepare(
        `SELECT f.value, f.is_displayable
         FROM directory_profile_facts f
         JOIN directory_enrichment_sources s ON s.id = f.source_id
         WHERE f.cabinet_id = ?
           AND f.establishment_id = ?
           AND s.source_key = 'unrelated-regression'`,
      ).get(cabinet.id, establishment.id) as { value: string; is_displayable: number } | undefined;
      assert.deepEqual(
        unrelatedFact,
        { value: "Unrelated team signal", is_displayable: 1 },
        caseName,
      );

      const snapshot = verifyDb.prepare(
        `SELECT snapshot_json
         FROM directory_qualification_snapshots
         WHERE cabinet_id = ?
           AND establishment_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 1`,
      ).get(cabinet.id, establishment.id) as { snapshot_json: string };
      const snapshotJson = JSON.parse(snapshot.snapshot_json) as {
        service_count?: number;
        useful_fact_count?: number;
      };
      assert.equal(snapshotJson.service_count, 1, caseName);
      assert.equal(snapshotJson.useful_fact_count, 3, caseName);
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

runSourceReplacementCase();

console.log("Directory enrichment import checks OK");
