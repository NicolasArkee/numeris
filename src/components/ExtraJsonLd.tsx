// ─── ExtraJsonLd ───
// Émet le JSON-LD additionnel stocké en DB (seo_overrides.json_ld_extra).
// La pipeline peut stocker un ou plusieurs objets @graph (Article,
// ProfessionalService...) sous forme de tableau JSON-encodé. Chaque entrée
// sort dans son propre <script> pour coexister proprement avec les schémas
// breadcrumb/FAQ déjà rendus par ClusterPage.

export function ExtraJsonLd({ raw }: { raw: string | null }) {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  const valid = entries.filter(
    (e): e is Record<string, unknown> =>
      e !== null && typeof e === "object" && Object.keys(e as object).length > 0,
  );
  if (valid.length === 0) return null;
  return (
    <>
      {valid.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}
