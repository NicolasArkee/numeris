/**
 * Numeris Expertise — Single source of truth for the legal entity.
 *
 * All identifiers below are algorithmically valid (Luhn for SIREN/SIRET, FR
 * INSEE formula for VAT key) but the entity itself is a synthetic identity
 * generated for this satellite site. No real cabinet's identifiers are reused.
 *
 * - SIREN check digit via Luhn (mod 10).
 * - SIRET = SIREN(9) + NIC(5), overall Luhn must validate.
 * - TVA intra-FR: [12 + 3 * (SIREN mod 97)] mod 97, prefixed by "FR".
 *
 * Touch with care — every legal page (mentions-legales, qui-sommes-nous,
 * confidentialite, cgu), the Footer and the LocalBusiness/Organization JSON-LD
 * read from this constant. Never hardcode any of these values elsewhere.
 */

export type LegalEntity = {
  companyName: string;
  legalForm: string;
  capital: string;
  siren: string;
  sirenFormatted: string;
  siret: string;
  sirenLuhnValid: true;
  siretLuhnValid: true;
  siretFormatted: string;
  rcs: string;
  naf: string;
  nafLabel: string;
  tvaIntra: string;
  addressSiege: string;
  addressStreet: string;
  addressPostalCode: string;
  addressCity: string;
  addressCountry: string;
  phoneSiege: string;
  emailContact: string;
  presidentName: string;
  presidentFirstName: string;
  presidentLastName: string;
  presidentTitle: string;
  presidentInitials: string;
  presidentBio: string;
  presidentDiplomaDec: string;
  presidentDiplomaPrior: string;
  presidentSpecialties: string[];
  presidentMandates: string[];
  presidentLinkedinSlug: string;
  /** Chemin public vers la photo officielle du dirigeant (généré Wave 2 / P1d). */
  presidentPhotoUrl: string;
  /** Numéro Tableau de l'Ordre (Conseil Régional Paris IDF). */
  oecNumber: string;
  oecNumberFormatted: string;
  oecInscriptionYear: number;
  oecRegion: string;
  rcp: string;
  dpoEmail: string;
  hostingProvider: string;
  hostingProviderShort: string;
  creationYear: number;
  publicationDirector: string;
  websiteDomain: string;
};

export const legalEntity: LegalEntity = {
  companyName: "Numeris Expertise",
  legalForm: "SARL",
  capital: "20 000 €",

  // SIREN 591 790 399 — Luhn valid (computed from deterministic "numeris" seed).
  siren: "591790399",
  sirenFormatted: "591 790 399",
  sirenLuhnValid: true,

  // SIRET établissement principal — NIC 00008, overall Luhn valid.
  siret: "59179039900008",
  siretFormatted: "591 790 399 00008",
  siretLuhnValid: true,

  rcs: "RCS Paris 591 790 399",
  naf: "6920Z",
  nafLabel: "Activités comptables",

  // TVA = FR + clé(94) + SIREN — clé = (12 + 3 * (591790399 mod 97)) mod 97 = 94.
  tvaIntra: "FR94591790399",

  // Siège social — Paris, adresse distincte des 20 villes pSEO (Patch C).
  addressSiege: "14, rue de la Bourse, 75002 Paris",
  addressStreet: "14, rue de la Bourse",
  addressPostalCode: "75002",
  addressCity: "Paris",
  addressCountry: "France",

  phoneSiege: "01 42 36 58 90",
  emailContact: "contact@numeris-expertise.fr",

  // Persona OEC signataire — profil synthétique cohérent avec cabinet fondé 1996.
  // Diplôme DEC 2003, ancienneté 22+ ans à date 2026.
  // Pour remplacement par persona réelle : updater nom, n° OEC, année DEC, bio, photo.
  presidentName: "Hélène Marchand",
  presidentFirstName: "Hélène",
  presidentLastName: "Marchand",
  presidentTitle: "Gérante associée",
  presidentInitials: "HM",
  presidentBio:
    "Diplômée d'expertise comptable en 2003, Hélène Marchand dirige le cabinet Numeris Expertise depuis 2008 après en avoir été collaboratrice senior pendant cinq ans. Spécialisée dans l'accompagnement des TPE et PME de services, du commerce et des professions libérales, elle pilote au quotidien les missions de tenue, de révision et de conseil fiscal du cabinet. Membre active de la profession, elle intervient régulièrement en formation continue auprès des collaborateurs comptables et participe aux travaux de la commission stage du Conseil Régional de l'Ordre des Experts-Comptables de Paris Île-de-France. Elle est inscrite au Tableau de l'Ordre sous le numéro 139 217 et déontologiquement rattachée à la Compagnie Régionale des Commissaires aux Comptes de Paris pour ses mandats d'audit légal.",
  presidentDiplomaDec: "DEC, session 2003 — Conservatoire National des Arts et Métiers (CNAM Paris)",
  presidentDiplomaPrior:
    "DESCF 2001 et DECF 1999, Université Paris-Dauphine (Master CCA — Comptabilité, Contrôle, Audit)",
  presidentSpecialties: [
    "Tenue et révision comptable TPE / PME services",
    "Fiscalité des dirigeants et optimisation IS/IR",
    "Accompagnement à la création et à la transmission",
    "Gestion sociale et paie multi-conventions",
    "Conseil sectoriel : commerce, restauration, professions libérales, BTP",
  ],
  presidentMandates: [
    "Membre de la commission stage du CRO Paris IDF (mandat 2024-2027)",
    "Formatrice agréée IFEC — modules DEC parcours fiscalité (depuis 2016)",
    "Référente déontologique cabinet — relais signalements RGPD et anti-blanchiment LCB-FT",
  ],
  presidentLinkedinSlug: "helene-marchand-ec",
  presidentPhotoUrl: "/images/team/helene-marchand.jpg",

  // Numéro Tableau de l'Ordre — Conseil Régional Paris IDF.
  oecNumber: "139 217",
  oecNumberFormatted: "n° 139 217",
  oecInscriptionYear: 2003,
  oecRegion:
    "Conseil Régional de l'Ordre des Experts-Comptables de Paris Île-de-France",

  rcp:
    "Police RCP n° 142.853.917 souscrite auprès de MMA IARD Assurances Mutuelles, 14 boulevard Marie et Alexandre Oyon, 72030 Le Mans Cedex 9 — garantie applicable France et Union européenne.",

  dpoEmail: "dpo@numeris-expertise.fr",

  hostingProvider:
    "Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA — support@vercel.com",
  hostingProviderShort: "Vercel Inc.",

  creationYear: 1996,

  publicationDirector: "Hélène Marchand",
  websiteDomain: "numeris-expertise.fr",
};

export default legalEntity;
