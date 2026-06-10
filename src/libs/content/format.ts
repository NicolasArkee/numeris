// ─── Formatage display partagé ───

/** Formate une date (ISO 8601 ou "YYYY-MM-DD HH:MM:SS" SQLite) en français
 *  long ("10 juin 2026"). Fallback : date du jour si absente/invalide. */
export function formatDateFr(raw?: string | null): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  if (raw) {
    const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("fr-FR", opts);
    }
  }
  return new Date().toLocaleDateString("fr-FR", opts);
}

/** Nettoie un prix "from" pour PricingTeaser : la donnée (DB ou Gemini) peut
 *  contenir "À partir de 99€ HT/mois" alors que le composant rend déjà ses
 *  propres affixes ("à partir de" + "HT/mois"). */
export function normalizeFromPrice(raw: string): string {
  return raw
    .replace(/^\s*à\s+partir\s+de\s+/i, "")
    .replace(/\s*HT\s*\/\s*mois\s*$/i, "")
    .trim();
}
