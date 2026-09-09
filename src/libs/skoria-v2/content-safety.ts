const CURRENCY_AMOUNT = /\b\d{1,3}(?:[ .\u202f]\d{3})*(?:[,.]\d+)?\s*(?:€|euros?)(?:\s*(?:HT|TTC))?(?:\s*(?:\/|par)\s*(?:mois|an|année))?/iu;
const CURRENCY_AMOUNT_GLOBAL = /(?:\b(?:dès|à\s+partir\s+de|entre|de)\s+)?\b\d{1,3}(?:[ .\u202f]\d{3})*(?:[,.]\d+)?\s*(?:€|euros?)(?:\s*(?:HT|TTC))?(?:\s*(?:\/|par)\s*(?:mois|an|année))?/giu;
const FULL_CURRENCY_AMOUNT = /^\s*(?:dès|à\s+partir\s+de|entre|de)?\s*\d{1,3}(?:[ .\u202f]\d{3})*(?:[,.]\d+)?\s*(?:€|euros?)(?:\s*(?:HT|TTC))?(?:\s*(?:\/|par)\s*(?:mois|an|année))?\s*$/iu;
const STALE_TAX_BENEFIT = /(?:organisme de gestion agr[ée][ée]|\bOGA\b).*(?:r[ée]duction d[’']imp[ôo]t|majoration)|(?:r[ée]duction d[’']imp[ôo]t|majoration).*(?:organisme de gestion agr[ée][ée]|\bOGA\b)|r[ée]duction d[’']imp[ôo]t.*frais de comptabilit[ée]/iu;
const ABSOLUTE_PROVIDER_PROMISE = /(?:garanti(?:t|ssent|e|es)|assure(?:nt)?)\b.*(?:conformit[ée] totale|tous les d[ée]lais|z[ée]ro erreur)/iu;
const SKORIA_SERVICE_CLAIM = /(?:chez\s+skoria|skoria[^.!?]{0,320}\b(?:aide|accompagne|facilite|permet|apporte|propose|agit|intervient|oriente|simplifie|centralise|agr[èe]ge|r[ée]f[ée]rence|compare|identifie|[ée]value|exploite|utilise|s[’']appuie|se\s+positionne)\b|(?:comparateur[^.!?]{0,100}\bcomme|via|sur|avec|gr[âa]ce\s+[àa])\s+skoria|notre\s+(?:cabinet|p[ôo]le|[ée]quipe)|nos\s+(?:experts|clients|partenaires)|en\s+choisissant\s+skoria|nous\s+(?:assurons|g[ée]rons|r[ée]alisons|[ée]tablissons|prenons\s+en\s+charge|mettons\s+en\s+place|conseillons|accompagnons|analysons|fournissons|proposons|aidons|d[ée]chargeons|chargeons|orientons|s[ée]curisons|optimisons|exploitons|centralisons|r[ée]f[ée]ren[çc]ons)|vous\s+b[ée]n[ée]ficiez\s+d[’']un\s+(?:interlocuteur|accompagnement|partenaire))/iu;
const PLATFORM_OVERCLAIM = /(?:notre\s+plateforme|notre\s+outil|notre\s+comparateur|notre\s+mission|base\s+de\s+donn[ée]es\s+exhaustive|sources?\s+administratives?\s+publiques?\s+exclusivement|exclusivement\s+sur\s+des\s+sources?\s+administratives?\s+publiques?|neutralit[ée]\s+absolue|transparence\s+totale|sans\s+(?:aucun\s+)?biais\s+commercial|tiers\s+de\s+confiance)/iu;

function replacementForSensitiveSentence(sentence: string): string {
  if (STALE_TAX_BENEFIT.test(sentence)) {
    return "Les règles liées aux organismes de gestion et aux avantages fiscaux évoluent ; vérifiez les conditions en vigueur auprès d’une source officielle.";
  }
  if (ABSOLUTE_PROVIDER_PROMISE.test(sentence)) {
    return "Le professionnel retenu doit préciser les contrôles inclus, leurs limites et les responsabilités prévues dans la lettre de mission.";
  }
  if (SKORIA_SERVICE_CLAIM.test(sentence)) {
    return "Skoria aide à préparer la comparaison ; chaque professionnel confirme directement son expérience, son périmètre, ses outils, ses honoraires et ses engagements.";
  }
  if (PLATFORM_OVERCLAIM.test(sentence)) {
    return "Le comparateur organise les critères disponibles ; chaque information doit être relue avec sa source, son statut et sa date lorsqu’ils sont affichés.";
  }
  if (CURRENCY_AMOUNT.test(sentence)) {
    return "Les honoraires et conditions doivent être confirmés directement auprès du professionnel et comparés à périmètre équivalent.";
  }
  return sentence;
}

/**
 * Défense de rendu pour l'ancien corpus : retire les montants commerciaux et
 * engagements absolus dépourvus d'un statut de fait daté. Les contenus V2
 * validés utilisent des composants structurés et ne dépendent pas de ce repli.
 */
export function sanitizeLegacyPublicText(text: string): string {
  if (FULL_CURRENCY_AMOUNT.test(text)) return "À confirmer";
  const parts = text.split(/((?<=[.!?])\s+)/u);
  const sanitized: string[] = [];
  let previousSentence: string | undefined;
  for (let index = 0; index < parts.length; index += 2) {
    const sentence = replacementForSensitiveSentence(parts[index] ?? "");
    const separator = parts[index + 1] ?? "";
    if (sentence && sentence !== previousSentence) {
      sanitized.push(sentence, separator);
      previousSentence = sentence;
    }
  }
  return sanitized
    .join("")
    .replaceAll(
      /(?:de|depuis)\s+l[’']offre\s+Essential\s+[àa]\s+l[’']offre\s+(?:Pro|Premium)\b/giu,
      "selon un périmètre de mission à confirmer",
    )
    .replaceAll(/\bl[’'](?:offre|formule)\s+(?:Essential|Pro|Premium)\b/giu, "le périmètre de mission à confirmer")
    .replaceAll(/\b(?:offre|formule)\s+(?:Essential|Pro|Premium)\b/giu, "périmètre de mission à confirmer")
    .replaceAll(/\bdevient indispensable pour optimiser\b/giu, "peut être utile pour analyser")
    .replaceAll(/\b(?:nos|vos)\s+experts-comptables\b/giu, "les professionnels comparés")
    .replaceAll(/\bnos\s+experts\b/giu, "les professionnels comparés")
    .replaceAll(/\bnotre\s+plateforme\b/giu, "le comparateur")
    .replaceAll(/\bnotre\s+outil\b/giu, "l’outil de comparaison")
    .replaceAll(
      /\bconformit[ée]\s+totale\b/giu,
      "conformité à vérifier selon le cadre applicable",
    )
    .trim();
}

/** Sanitize copy nested in the JSON-text columns used by page_sections while
 * preserving a valid JSON payload for the existing defensive renderers. */
export function sanitizeLegacyPublicJsonText(text: string | null): string | null {
  if (!text) return text;
  try {
    return JSON.stringify(sanitizeLegacyPublicValue(JSON.parse(text) as unknown));
  } catch {
    return sanitizeLegacyPublicText(text);
  }
}

/** Conserve le sujet d'un titre ou d'une meta description tout en neutralisant
 * les montants historiques qui ne disposent pas d'une preuve commerciale datée. */
export function sanitizeLegacyPublicSeoText(text: string): string {
  const withoutPrices = text
    .replaceAll(CURRENCY_AMOUNT_GLOBAL, "des honoraires à confirmer")
    .replaceAll(/\bcomparatif et tarifs?\s+20\d{2}\b/giu, "comparatif des honoraires")
    .replaceAll(/\btarifs?\s+20\d{2}\b/giu, "honoraires à comparer")
    .replaceAll(/\bgrille tarifaire\b/giu, "critères tarifaires")
    .replaceAll(/\bordres? de prix\b/giu, "critères de prix")
    .replaceAll(/\btarifs? indicatifs?\b/giu, "honoraires à confirmer")
    .replaceAll(/\b(?:offre|formule)\s+(?:Essential|Pro|Premium)\b/giu, "périmètre à confirmer")
    .replaceAll(/critères de prix\s*\(des honoraires à confirmer\)/giu, "critères de prix à confirmer")
    .replaceAll(/\(des honoraires à confirmer\)/giu, "(honoraires à confirmer)");
  return sanitizeLegacyPublicText(withoutPrices);
}

export function sanitizeLegacyPublicValue(value: unknown): unknown {
  if (typeof value === "string") return sanitizeLegacyPublicText(value);
  if (Array.isArray(value)) return value.map(sanitizeLegacyPublicValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        sanitizeLegacyPublicValue(entry),
      ]),
    );
  }
  return value;
}
