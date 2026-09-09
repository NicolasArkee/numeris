import { parseExtraJsonLd, serializeJsonLdForHtml } from "@/libs/content/extra-json-ld";

// Émet uniquement les schémas additionnels autorisés et structurellement
// valides. Les entités de cabinet/prestataire restent réservées aux fiches
// annuaire sourcées et ne peuvent pas être injectées depuis un override SEO.

export function ExtraJsonLd({ raw }: { raw: string | null }) {
  const { entries } = parseExtraJsonLd(raw);
  if (entries.length === 0) return null;
  return (
    <>
      {entries.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLdForHtml(entry) }}
        />
      ))}
    </>
  );
}
