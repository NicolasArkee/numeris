// ─── Moteur jours ouvrés / ouvrables — France métropolitaine ───
// Fonctions pures sur Date.UTC exclusivement (jamais de date locale :
// bugs DST/fuseaux). Fériés légaux métropole : 8 fixes + 3 mobiles
// calculés par computus (pas de table à maintenir). L'Alsace-Moselle
// et l'outre-mer ont des fériés supplémentaires — hors périmètre.

export interface JourFerie {
  dateISO: string; // YYYY-MM-DD
  nom: string;
}

/** Dimanche de Pâques — algorithme de Meeus/Jones/Butcher (grégorien). */
export function datePaques(annee: number): { mois: number; jour: number } {
  const a = annee % 19;
  const b = Math.floor(annee / 100);
  const c = annee % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31); // 3 = mars, 4 = avril
  const jour = ((h + l - 7 * m + 114) % 31) + 1;
  return { mois, jour };
}

const iso = (utcMs: number): string => new Date(utcMs).toISOString().slice(0, 10);
const JOUR_MS = 86_400_000;

/** Les 11 jours fériés légaux de métropole pour une année. */
export function joursFeries(annee: number): JourFerie[] {
  const paques = datePaques(annee);
  const paquesMs = Date.UTC(annee, paques.mois - 1, paques.jour);
  const fixes: [number, number, string][] = [
    [1, 1, "Jour de l'an"],
    [5, 1, "Fête du Travail"],
    [5, 8, "Victoire 1945"],
    [7, 14, "Fête nationale"],
    [8, 15, "Assomption"],
    [11, 1, "Toussaint"],
    [11, 11, "Armistice 1918"],
    [12, 25, "Noël"],
  ];
  const feries: JourFerie[] = fixes.map(([m, j, nom]) => ({
    dateISO: iso(Date.UTC(annee, m - 1, j)),
    nom,
  }));
  feries.push(
    { dateISO: iso(paquesMs + 1 * JOUR_MS), nom: "Lundi de Pâques" },
    { dateISO: iso(paquesMs + 39 * JOUR_MS), nom: "Ascension" },
    { dateISO: iso(paquesMs + 50 * JOUR_MS), nom: "Lundi de Pentecôte" },
  );
  return feries.sort((x, y) => x.dateISO.localeCompare(y.dateISO));
}

export interface CompteJoursResult {
  calendaires: number;
  ouvrables: number; // lun-sam hors fériés
  ouvres: number; // lun-ven hors fériés
  feriesEnSemaine: number;
  listeFeries: JourFerie[]; // fériés de la période (tous jours confondus)
  inverse: boolean; // bornes inversées silencieusement
}

const MAX_ANNEES = 10;

/** Compte les jours entre deux dates ISO (YYYY-MM-DD), bornes INCLUSES.
 *  fin < début → inversion silencieuse ; période plafonnée à 10 ans. */
export function compterJours(debutISO: string, finISO: string): CompteJoursResult {
  const parse = (s: string): number => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  };
  let debut = parse(debutISO);
  let fin = parse(finISO);
  const inverse = fin < debut;
  if (inverse) [debut, fin] = [fin, debut];
  fin = Math.min(fin, debut + MAX_ANNEES * 366 * JOUR_MS);

  const feriesSet = new Map<string, string>();
  const anneeDebut = new Date(debut).getUTCFullYear();
  const anneeFin = new Date(fin).getUTCFullYear();
  for (let a = anneeDebut; a <= anneeFin; a++) {
    for (const f of joursFeries(a)) feriesSet.set(f.dateISO, f.nom);
  }

  let calendaires = 0;
  let ouvrables = 0;
  let ouvres = 0;
  let feriesEnSemaine = 0;
  const listeFeries: JourFerie[] = [];
  for (let t = debut; t <= fin; t += JOUR_MS) {
    calendaires++;
    const jourSemaine = new Date(t).getUTCDay(); // 0 = dimanche, 6 = samedi
    const dateISO = iso(t);
    const ferie = feriesSet.get(dateISO);
    if (ferie) listeFeries.push({ dateISO, nom: ferie });
    if (jourSemaine === 0) continue;
    if (ferie) {
      if (jourSemaine >= 1 && jourSemaine <= 5) feriesEnSemaine++;
      continue;
    }
    ouvrables++;
    if (jourSemaine <= 5) ouvres++;
  }
  return { calendaires, ouvrables, ouvres, feriesEnSemaine, listeFeries, inverse };
}
