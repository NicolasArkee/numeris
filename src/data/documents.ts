// Silo « Modèles & documents expliqués » — source de vérité du routing/labels.
// La prose des pages vit dans page_sections (générée) ; ce registre porte le
// slug/label/catégorie/chassis et l'existence d'un spécimen PDF (public/specimens/{slug}.fr.pdf).
// Miroir de ARKEE_ORG/CLIENTS/_standalone/skoria/arborescence/documents-registry.json.

export interface DocCategory {
  key: string;
  label: string;
}

export interface DocEntry {
  slug: string;
  label: string;
  categorie: string;
  chassis: string;
  priorite: number;
}

export const DOC_ROUTE = "documents";

export const DOC_CATEGORIES: DocCategory[] = [
  { key: "facturation", label: "Facturation & ventes" },
  { key: "creation", label: "Création de société" },
  { key: "juridique-annuel", label: "Vie juridique annuelle" },
  { key: "comptabilite", label: "États comptables" },
  { key: "fiscal", label: "Déclarations fiscales" },
  { key: "social", label: "Social & paie" },
  { key: "gestion", label: "Gestion & pièces courantes" },
];

export const DOCUMENTS: DocEntry[] = [
  { slug: "facture", label: "Facture (mentions obligatoires)", categorie: "facturation", chassis: "facture", priorite: 1 },
  { slug: "facture-auto-entrepreneur", label: "Facture auto-entrepreneur", categorie: "facturation", chassis: "facture", priorite: 1 },
  { slug: "facture-electronique", label: "Facture électronique (réforme 2026)", categorie: "facturation", chassis: "facture", priorite: 1 },
  { slug: "facture-sans-tva", label: "Facture micro-entreprise sans TVA", categorie: "facturation", chassis: "facture", priorite: 1 },
  { slug: "devis", label: "Devis", categorie: "facturation", chassis: "facture", priorite: 1 },
  { slug: "facture-acompte", label: "Facture d'acompte", categorie: "facturation", chassis: "facture", priorite: 2 },
  { slug: "facture-avoir", label: "Facture d'avoir", categorie: "facturation", chassis: "facture", priorite: 2 },
  { slug: "relance-facture-impayee", label: "Lettre de relance facture impayée", categorie: "facturation", chassis: "lettre", priorite: 2 },
  { slug: "statuts-sasu", label: "Statuts de SASU", categorie: "creation", chassis: "statuts", priorite: 1 },
  { slug: "statuts-sarl", label: "Statuts de SARL", categorie: "creation", chassis: "statuts", priorite: 1 },
  { slug: "statuts-eurl", label: "Statuts d'EURL", categorie: "creation", chassis: "statuts", priorite: 2 },
  { slug: "statuts-sci", label: "Statuts de SCI", categorie: "creation", chassis: "statuts", priorite: 1 },
  { slug: "attestation-depot-capital", label: "Attestation de dépôt de capital", categorie: "creation", chassis: "lettre", priorite: 3 },
  { slug: "extrait-kbis", label: "Extrait Kbis", categorie: "creation", chassis: "formulaire", priorite: 2 },
  { slug: "registre-beneficiaires-effectifs", label: "Registre des bénéficiaires effectifs", categorie: "creation", chassis: "registre", priorite: 3 },
  { slug: "pv-assemblee-generale", label: "PV d'assemblée générale", categorie: "juridique-annuel", chassis: "statuts", priorite: 1 },
  { slug: "pv-approbation-comptes", label: "PV d'approbation des comptes", categorie: "juridique-annuel", chassis: "statuts", priorite: 2 },
  { slug: "depot-comptes-annuels", label: "Dépôt des comptes annuels", categorie: "juridique-annuel", chassis: "formulaire", priorite: 2 },
  { slug: "convention-compte-courant-associe", label: "Convention de compte courant d'associé", categorie: "juridique-annuel", chassis: "statuts", priorite: 3 },
  { slug: "lettre-de-mission", label: "Lettre de mission expert-comptable", categorie: "gestion", chassis: "lettre", priorite: 1 },
  { slug: "bilan-comptable", label: "Bilan comptable", categorie: "comptabilite", chassis: "etat-comptable", priorite: 1 },
  { slug: "compte-de-resultat", label: "Compte de résultat", categorie: "comptabilite", chassis: "etat-comptable", priorite: 1 },
  { slug: "balance-comptable", label: "Balance comptable", categorie: "comptabilite", chassis: "etat-comptable", priorite: 2 },
  { slug: "grand-livre", label: "Grand livre comptable", categorie: "comptabilite", chassis: "registre", priorite: 2 },
  { slug: "journal-comptable", label: "Journal comptable", categorie: "comptabilite", chassis: "registre", priorite: 2 },
  { slug: "tableau-amortissement", label: "Tableau d'amortissement", categorie: "comptabilite", chassis: "etat-comptable", priorite: 2 },
  { slug: "plan-comptable-general", label: "Plan comptable général (extrait)", categorie: "comptabilite", chassis: "registre", priorite: 2 },
  { slug: "liasse-fiscale-2050", label: "Liasse fiscale 2050 (bilan)", categorie: "fiscal", chassis: "formulaire", priorite: 1 },
  { slug: "declaration-2035", label: "Déclaration 2035 (BNC)", categorie: "fiscal", chassis: "formulaire", priorite: 2 },
  { slug: "declaration-tva-ca3", label: "Déclaration de TVA CA3", categorie: "fiscal", chassis: "formulaire", priorite: 1 },
  { slug: "declaration-tva-ca12", label: "Déclaration de TVA CA12", categorie: "fiscal", chassis: "formulaire", priorite: 2 },
  { slug: "cerfa-2042-c-pro", label: "Cerfa 2042-C-PRO", categorie: "fiscal", chassis: "formulaire", priorite: 2 },
  { slug: "fiche-de-paie", label: "Fiche de paie (bulletin simplifié)", categorie: "social", chassis: "formulaire", priorite: 1 },
  { slug: "solde-de-tout-compte", label: "Reçu pour solde de tout compte", categorie: "social", chassis: "lettre", priorite: 2 },
  { slug: "attestation-vigilance", label: "Attestation de vigilance URSSAF", categorie: "social", chassis: "lettre", priorite: 2 },
  { slug: "bulletin-paie-mentions", label: "Bulletin de paie : mentions obligatoires", categorie: "social", chassis: "formulaire", priorite: 2 },
  { slug: "contrat-prestation-services", label: "Contrat de prestation de services", categorie: "gestion", chassis: "statuts", priorite: 2 },
  { slug: "note-de-frais", label: "Note de frais", categorie: "gestion", chassis: "registre", priorite: 1 },
  { slug: "livre-recettes", label: "Livre des recettes (micro-entreprise)", categorie: "gestion", chassis: "registre", priorite: 2 },
  { slug: "registre-achats", label: "Registre des achats (micro-entreprise)", categorie: "gestion", chassis: "registre", priorite: 3 },
];

export const DOC_BY_SLUG: Record<string, DocEntry> = Object.fromEntries(
  DOCUMENTS.map((d) => [d.slug, d]),
);

export const documentUrl = (slug: string) => `/documents/${slug}`;
export const specimenPdfPath = (slug: string) => `/specimens/${slug}.fr.pdf`;

/** Slugs qui disposent d'un spécimen PDF construit (public/specimens/*.fr.pdf). */
export const DOCS_WITH_SPECIMEN = new Set<string>([
  "facture",
  "lettre-de-mission",
]);
