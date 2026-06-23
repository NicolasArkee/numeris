/**
 * Single source of truth for the Skoria publisher identity.
 *
 * Skoria is positioned as an independent comparison and information platform
 * for chartered accountants ("experts-comptables") in Europe.
 *
 * Brand pivot — June 2026: "Numeris" was rebranded to "Skoria" to better
 * carry the comparator promise across Europe. The legal entity behind the
 * site (SAS) keeps the same SIREN/SIRET/capital/registered address until
 * the statutory change is filed at the RCS. The `companyName` field below
 * reflects the new commercial / trade name; the legal structure data
 * (SIREN, SIRET, RCS) is unchanged and must remain the source of truth for
 * compliance pages until a statutory amendment is recorded.
 *
 * The legacy professional-registration fields are intentionally retained as
 * empty compatibility fields because older components still import them, but
 * they must not be used as public trust claims.
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
  presidentPhotoUrl: string;
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
  companyName: "Skoria",
  legalForm: "SAS",
  capital: "20 000 €",

  siren: "591790399",
  sirenFormatted: "591 790 399",
  sirenLuhnValid: true,
  siret: "59179039900008",
  siretFormatted: "591 790 399 00008",
  siretLuhnValid: true,

  rcs: "RCS Paris 591 790 399",
  naf: "6312Z",
  nafLabel: "Portails Internet",
  tvaIntra: "FR94591790399",

  addressSiege: "14, rue de la Bourse, 75002 Paris",
  addressStreet: "14, rue de la Bourse",
  addressPostalCode: "75002",
  addressCity: "Paris",
  addressCountry: "France",

  phoneSiege: "01 42 36 58 90",
  emailContact: "contact@skoria.fr",

  presidentName: "Équipe éditoriale Skoria",
  presidentFirstName: "Équipe éditoriale",
  presidentLastName: "Skoria",
  presidentTitle: "Éditeur du comparateur",
  presidentInitials: "S",
  presidentBio:
    "Skoria édite un comparateur indépendant consacré aux besoins comptables, fiscaux et administratifs des entrepreneurs en Europe. Les contenus publiés aident à préparer une comparaison et ne constituent pas une prestation comptable, fiscale ou juridique individualisée.",
  presidentDiplomaDec: "",
  presidentDiplomaPrior: "",
  presidentSpecialties: [
    "Comparaison de professionnels comptables",
    "Information administrative publique",
    "Guides métiers et secteurs",
    "Méthodologie éditoriale",
  ],
  presidentMandates: [
    "Édition et mise à jour du comparateur",
    "Traitement des demandes de correction",
    "Contrôle de cohérence des sources publiques",
  ],
  presidentLinkedinSlug: "",
  presidentPhotoUrl: "",

  oecNumber: "",
  oecNumberFormatted: "",
  oecInscriptionYear: 1996,
  oecRegion: "",
  rcp: "Responsabilité civile professionnelle éditeur web.",

  dpoEmail: "dpo@skoria.eu",
  hostingProvider:
    "Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA — support@vercel.com",
  hostingProviderShort: "Vercel Inc.",

  creationYear: 1996,
  publicationDirector: "Équipe éditoriale Skoria",
  websiteDomain: "skoria.eu",
};

export default legalEntity;
