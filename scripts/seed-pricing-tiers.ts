/**
 * scripts/seed-pricing-tiers.ts
 *
 * Wave 3a / Phase P4b — Seed `pricing_tiers` table with 3 fictional but
 * market-coherent tiers backing the V2 PricingTeaser component.
 *
 *   - Essential €59 HT/mois — TPE solo, micro-entreprise
 *   - Pro       €99 HT/mois — TPE/PME 1-10 salariés (highlighted "Best value")
 *   - Premium  €159 HT/mois — PME 10-50 salariés, holdings
 *
 * Idempotent:
 *   - DELETE FROM pricing_tiers, then INSERT 3 rows (clean re-seed).
 *   - Table DDL ensured upstream by SCHEMA / migrate-pricing-testimonials.ts.
 *
 * Run: npm run db:seed-pricing-tiers
 */
import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";

const DB_PATH = path.join(process.cwd(), "numeris.db");

interface TierSeed {
  slug: string;
  name: string;
  from_price: string;
  price_value: number;
  features: string[];
  highlighted: number;
  cta_label: string;
  order_index: number;
  description: string;
  target_audience: string;
}

const TIERS: TierSeed[] = [
  {
    slug: "essential",
    name: "Essential",
    from_price: "À partir de 59€ HT/mois",
    price_value: 59,
    features: [
      "Tenue comptable mensuelle",
      "Déclarations TVA trimestrielles",
      "Liasse fiscale annuelle (BIC/BNC)",
      "Bilan annuel et compte de résultat",
      "Accès tableau de bord en ligne",
      "Réponses par email sous 48h",
      "1 RDV cadrage annuel avec l'EC",
    ],
    highlighted: 0,
    cta_label: "Choisir Essential",
    order_index: 1,
    description:
      "Tenue et déclarations de base, pour entrepreneurs autonomes",
    target_audience: "TPE solo, micro-entreprise au RSI ou IS simplifié",
  },
  {
    slug: "pro",
    name: "Pro",
    from_price: "À partir de 99€ HT/mois",
    price_value: 99,
    features: [
      "Tout Essential, plus :",
      "Gestion paie jusqu'à 10 salariés (multi-conventions)",
      "Déclarations TVA mensuelles",
      "Conseil fiscal trimestriel avec un expert OEC",
      "Optimisation rémunération dirigeant (IS/IR)",
      "Accompagnement DSN et URSSAF",
      "Réponses prioritaires sous 24h (chat + tel)",
      "Tableau de bord mensuel commenté",
      "1 audit fiscal annuel inclus",
    ],
    highlighted: 1,
    cta_label: "Choisir Pro",
    order_index: 2,
    description: "Pilotage fiscal et social complet, conseil mensuel",
    target_audience: "TPE/PME 1-10 salariés, professions libérales établies",
  },
  {
    slug: "premium",
    name: "Premium",
    from_price: "À partir de 159€ HT/mois",
    price_value: 159,
    features: [
      "Tout Pro, plus :",
      "Direction financière externalisée (5h/mois inclus)",
      "Tableau de bord hebdomadaire personnalisé",
      "Conseil M&A, BSPCE, AGA, levée de fonds",
      "Optimisation CIR / CICE / JEI",
      "Audit RGPD et anti-blanchiment LCB-FT inclus",
      "Accompagnement contrôle fiscal (forfait inclus)",
      "EC dédié + interlocuteur unique",
      "Réponse sous 4h ouvrées",
    ],
    highlighted: 0,
    cta_label: "Demander un devis",
    order_index: 3,
    description:
      "Direction financière externalisée + commissariat aux comptes optionnel",
    target_audience: "PME 10-50 salariés, sociétés holding, projets de croissance",
  },
];

function main(): void {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  console.log(`[seed-pricing-tiers] DB: ${DB_PATH}`);
  console.log(`[seed-pricing-tiers] Ensuring SCHEMA (idempotent)…`);
  db.exec(SCHEMA);

  // ─── 1. Verify pricing_tiers table exists ───
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='pricing_tiers'",
    )
    .get() as { name: string } | undefined;

  if (!tableExists) {
    console.error(
      "[seed-pricing-tiers] FATAL: pricing_tiers table missing. Run db:migrate-pricing-testimonials first.",
    );
    db.close();
    process.exit(1);
  }

  // ─── 2. Idempotent clean re-seed ───
  const beforeCount = (
    db.prepare("SELECT COUNT(*) AS n FROM pricing_tiers").get() as { n: number }
  ).n;
  console.log(`[seed-pricing-tiers] Existing rows: ${beforeCount} (will be replaced)`);

  const tx = db.transaction(() => {
    db.exec("DELETE FROM pricing_tiers");

    const insertPricing = db.prepare(`
      INSERT INTO pricing_tiers (slug, name, from_price, price_value, features, highlighted, cta_label, order_index, description, target_audience)
      VALUES (@slug, @name, @from_price, @price_value, @features, @highlighted, @cta_label, @order_index, @description, @target_audience)
    `);

    for (const tier of TIERS) {
      insertPricing.run({
        slug: tier.slug,
        name: tier.name,
        from_price: tier.from_price,
        price_value: tier.price_value,
        features: JSON.stringify(tier.features),
        highlighted: tier.highlighted,
        cta_label: tier.cta_label,
        order_index: tier.order_index,
        description: tier.description,
        target_audience: tier.target_audience,
      });
    }
  });

  tx();

  // ─── 3. Post-seed verification ───
  const afterCount = (
    db.prepare("SELECT COUNT(*) AS n FROM pricing_tiers").get() as { n: number }
  ).n;
  console.log(`[seed-pricing-tiers] After seed: ${afterCount} row(s)`);

  // Tabular preview
  const rows = db
    .prepare(
      "SELECT slug, name, price_value, highlighted, order_index, target_audience FROM pricing_tiers ORDER BY order_index",
    )
    .all() as Array<{
      slug: string;
      name: string;
      price_value: number;
      highlighted: number;
      order_index: number;
      target_audience: string;
    }>;

  console.log("\n[seed-pricing-tiers] Preview:");
  console.log(
    "  ┌─────────────┬────────────┬──────┬────────┬───────┬──────────────────────────────────────────────────┐",
  );
  console.log(
    "  │ slug        │ name       │ €/mo │ hilite │ order │ target_audience                                  │",
  );
  console.log(
    "  ├─────────────┼────────────┼──────┼────────┼───────┼──────────────────────────────────────────────────┤",
  );
  for (const r of rows) {
    console.log(
      `  │ ${r.slug.padEnd(11)} │ ${r.name.padEnd(10)} │ ${String(r.price_value).padStart(4)} │ ${String(r.highlighted).padStart(6)} │ ${String(r.order_index).padStart(5)} │ ${r.target_audience.slice(0, 48).padEnd(48)} │`,
    );
  }
  console.log(
    "  └─────────────┴────────────┴──────┴────────┴───────┴──────────────────────────────────────────────────┘",
  );

  // Quick sanity check on JSON features for the "pro" tier
  const proRow = db
    .prepare("SELECT features FROM pricing_tiers WHERE slug = 'pro'")
    .get() as { features: string } | undefined;
  if (proRow) {
    try {
      const parsed = JSON.parse(proRow.features) as string[];
      console.log(
        `\n[seed-pricing-tiers]   pro.features JSON parse: OK (${parsed.length} items)`,
      );
    } catch (e) {
      console.error(
        `[seed-pricing-tiers]   pro.features JSON parse FAILED: ${(e as Error).message}`,
      );
    }
  }

  db.close();
  console.log(`\n[seed-pricing-tiers] OK — 3 tiers seeded.`);
}

main();
