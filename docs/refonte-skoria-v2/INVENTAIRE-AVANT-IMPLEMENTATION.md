# Refonte Skoria V2 — inventaire avant implémentation

Date de l'audit : 8 septembre 2026

Référence validée : `CLIENTS/_standalone/skoria/outputs/design/template-refonte-2026-09/v2`
Périmètre : application Next.js dans `/Users/nicolas/PBN_AUTO/COMPTABLE/numeris`

Ce document fige ce qui doit changer avant la migration. La refonte conserve les textes SEO et les données métier côté serveur, puis ajoute une couche de présentation versionnée, des gabarits adaptés à chaque intention et des interactions ciblées. Skoria reste présenté comme un comparateur indépendant : il ne réalise pas les prestations comptables et aucun avis, prix, client ou résultat ne doit être inventé.

## 1. Ce qui reste la source de vérité

- `page_sections` conserve la prose SEO, les FAQ, tableaux, listes, sources et modules déjà produits.
- `seo_overrides` conserve `meta_title`, `meta_description`, `h1`, les points clés et les compléments JSON-LD.
- `page_meta` conserve le statut de publication, les dates et les informations de revue.
- Les tables annuaire restent la source des cabinets, établissements, villes, statuts et enrichissements.
- Les catalogues TypeScript existants restent compatibles pendant la migration.
- Les brouillons restent des brouillons. La refonte ne publie automatiquement aucune URL.

La couche V2 ajoute un modèle de présentation dans le dépôt. Elle ne duplique pas les milliers de paragraphes dans des composants React et n'impose pas une migration destructive de Supabase.

### Correctif préalable de publication

`page_meta.publish_status` est actuellement chargé mais ne bloque pas le rendu. Une URL `draft`, `review` ou `archived` peut donc rester accessible directement, y compris pour les familles commerciales avec `dynamicParams=true`. Le premier correctif doit ajouter un garde-fou partagé :

- `published` : rendu et indexation autorisés ;
- `draft` et `review` : rendu de prévisualisation interne seulement, sinon 404 ou `noindex` selon le contexte ;
- `archived` : 404 ou redirection éditorialement définie ;
- sitemaps et listes publiques : uniquement `published`.

Ce contrôle précède tout backfill de contenu.

## 2. Configurations JSON à créer

Les fichiers sont importés au build et validés par TypeScript dans `src/libs/skoria-v2/config.ts`.

### `src/data/skoria-v2/navigation.json`

Contient :

- les cinq entrées principales `Cabinets`, `Métiers`, `Services`, `Ressources`, `Comparer` ;
- les liens de chaque méga-menu, leur description courte et leur route ;
- le CTA global d'ouverture du brief ;
- les raccourcis de reprise de parcours ;
- les groupes du footer, liens légaux et mention de comparateur indépendant ;
- les libellés mobile et les états accessibles.

À retirer du shell actuel : toute promesse non démontrée, notamment « Avis vérifiés post-mission ».

### `src/data/skoria-v2/templates.json`

Registre des 24 gabarits avec :

- `templateKey` ;
- matcher de route ou famille ;
- type de hero et identifiant média ;
- thème de couleur ;
- ancres affichées ;
- modules de décision attendus ;
- CTA et point d'entrée du brief ;
- règles de placement des sections SEO ;
- variante de données structurées ;
- profondeur minimale de contenu utile.

Le registre permet de changer une composition sans réécrire le contenu Supabase.

### `src/data/skoria-v2/pages.json`

Overrides éditoriaux pour les pages représentatives et les hubs :

- accroche, eyebrow, lede et libellés d'action ;
- bénéfices, étapes, critères de choix et textes de liaison propres à l'UX ;
- configuration des builders métier, secteur et mission ;
- entrées de parcours et maillage prioritaire ;
- médias choisis par page ou par famille ;
- exemples validés : médecin, restauration, comptabilité, comptabilité × restauration, LMNP, amortissement et pages commerciales.

Ce fichier n'accueille que les textes d'interface et de composition. La longue prose SEO reste en base.

### `src/data/skoria-v2/hubs.json`

Décrit les hubs Professions, Secteurs, Services, Ressources, Guides, Comparatifs, Avis, Offres, Outils, Documents et Géographie :

- titre, introduction longue et chapô de section ;
- catégories, filtres et ordre d'affichage ;
- cartes vedettes et listes de longue traîne ;
- liens vers l'étape suivante du parcours ;
- état vide utile pour les collections encore en brouillon ;
- contenu SEO inférieur au catalogue, FAQ et sources.

### `src/data/skoria-v2/media.json`

Manifeste unique de tous les médias, avec :

- `id`, `src`, `width`, `height`, `format` ;
- `alt`, `caption`, `credit` et `disclaimer` ;
- `generated`, `peopleFictional`, prompt exact, date et mode de génération ;
- point focal desktop/mobile ;
- usages autorisés et tailles `sizes` ;
- statut `ready`, `to-generate` ou `documentary`.

Les JSON de page référencent un identifiant média, jamais un chemin libre.

### `src/data/skoria-v2/content-contract.json`

Contrat de migration des sections existantes :

- correspondance de chaque `section_type` vers un composant V2 ;
- rôle sémantique (`proof`, `explanation`, `decision`, `action`, `source`) ;
- largeur (`prose`, `wide`, `full`) ;
- thème de fond autorisé ;
- règle de regroupement de sections successives ;
- comportement de repli si un type est inconnu ;
- types interdits tant que les données ne sont pas prouvées, notamment témoignages fictifs et tarification présentée comme une offre Skoria.

## 3. Évolution ultérieure de `page_meta`

La première livraison peut fonctionner sans migration SQL grâce au registre JSON. Les champs suivants sont néanmoins à prévoir dans Supabase pour rendre le pilotage éditorial autonome :

- `template_key`
- `theme_key`
- `hero_media_id`
- `hero_variant`
- `journey_entry`
- `reading_time`
- `source_status`
- `content_version`
- `reviewed_at` fiable

Ils seront ajoutés par une migration séparée et rétrocompatible. Aucun champ existant n'est supprimé.

## 4. Inventaire des 24 gabarits

| Gabarit V2 | Routes actuelles | Cible d'implémentation |
|---|---|---|
| Accueil | `/` | `HomePageV2` + sélecteur de parcours |
| LP profession | `/professions/[profession]` | `ProfessionLandingPage` + builder métier |
| LP service | `/expertises/[service]` | `ServiceLandingPage` + builder de mission |
| Service × activité | `/expertises/[service]/[dimension]` | `CrossLandingPage`, variantes métier/secteur/ville |
| LP secteur | `/secteurs/[secteur]` | `SectorLandingPage` + sélecteur de situation |
| Annuaire national | `/annuaire/experts-comptables` | `DirectoryLandingPage` + recherche orientée besoin |
| Annuaire ville | `/expert-comptable/[ville]`, `/villes/[ville]` | `DirectoryCityPage` + exploration et sélection |
| Fiche cabinet | `/expert-comptable/[ville]/[cabinet]` | `DirectoryProfilePage` + préparation du contact |
| Hub guide | `/guides/[...slug]`, profondeur 1 | `GuideHubPage` |
| Sous-hub | `/guides/[...slug]`, profondeur 2 | `GuideSubHubPage` |
| Article | `/guides/[...slug]`, profondeur 3+ | `EditorialArticlePage` + sommaire/progression |
| Comparatif | `/comparatifs/[slug]` | `ComparisonLandingPage` + matrice de décision |
| Avis | `/avis/[program]` | `ReviewLandingPage` + scénarios de coût |
| Offre | `/codes-parrainage/[program]` | `OfferLandingPage` + conditions vérifiables |
| Hub professions | `/professions` | `ProfessionsHubPage` + filtre par contexte |
| Hub secteurs | `/secteurs` | `SectorsHubPage` + sélecteur d'usage |
| Hub services | `/expertises` | `ServicesHubPage` + sélecteur de mission |
| Bibliothèque | `/ressources` | `GuidesLibraryPage` + catalogue filtrable |
| Hub comparatifs | `/comparatifs` | `ComparisonsHubPage` |
| Hub avis | `/avis` | `ReviewsHubPage` |
| Hub offres | `/codes-parrainage` | `OffersHubPage` |
| Hub outils | `/simulateurs` | `ToolsHubPage` + aide au choix |
| Hub documents | `/documents` | `DocumentsHubPage` + aperçu/téléchargement |
| Hub géographique | `/villes`, `/departements`, `/departements/[dept]` | `GeoHubPage`, modes villes/départements/département |

Deux détails non maquettés réutilisent le shell éditorial : `/simulateurs/[outil]` devient `ToolDetailPage` et `/documents/[slug]` devient `DocumentDetailPage`.

## 5. Contenu à corriger avant publication

L'instantané local contient 7 817 sections pour 994 pages, ainsi que 340 pages commerciales toutes en brouillon. La migration visuelle doit rendre tous les types existants, mais la publication reste contrôlée famille par famille.

| Famille | Sections locales | Pages locales | Statut dominant | Travail éditorial |
|---|---:|---:|---|---|
| Professions | 1 501 | 114 | brouillon | posture comparateur, LP de décision, supprimer offres Skoria |
| Secteurs | 56 | 5 | brouillon | compléter les situations métier et les croisements service |
| Expertises | 377 | 37 | brouillon | responsabilités, livrables, limites et critères de choix |
| Guides | 1 270 | 103 | brouillon | appliquer hub/sous-hub/article et vérifier les sources |
| Ressources | 1 632 | 378 | 355 publiées | préserver le trafic, améliorer navigation et maillage |
| Comparatifs | 1 440 | 186 | brouillon | méthode, tableau, hypothèses, sources officielles |
| Avis | 693 | 77 | brouillon | analyse factuelle, coût, limites, aucune note inventée |
| Codes / offres | 539 | 77 | brouillon | conditions datées, éligibilité, disclosure affiliée |
| Simulateurs | 98 | 14 | publiées | conserver les calculs, expliquer hypothèses et résultat |
| Villes | 211 | 20 | brouillon | contenu local, données cabinet et conformité explicites |

Données structurantes disponibles : 6 services, 8 secteurs, 114 professions, 14 catégories, 48 relations service × secteur, 684 relations service × profession, 60 relations service × ville, 2 000 villes officielles, 27 307 cabinets et 32 508 établissements. Seuls trois cabinets sont publiés dans l'instantané ; les autres restent en revue.

Lacunes à traiter dans les exemples validés :

- `professions/medecins` possède un contenu riche, mais plusieurs passages attribuent à tort la prestation à Skoria ;
- `expertises/comptabilite` et `expertises/comptabilite__secteur__restauration` n'ont aucune section DB et nécessitent un backfill depuis la maquette validée ;
- le secteur restauration contient des FAQ redondantes ;
- les hubs et articles LMNP existent mais sont encore en brouillon.

Contrôles transversaux :

- remplacer toute phrase où Skoria semble tenir la comptabilité ou vendre une mission ;
- ne jamais afficher de tarif Skoria issu des anciens blocs `PricingTeaser` ;
- masquer les témoignages fictifs et les scripts qui les alimentent ;
- calculer le temps de lecture au lieu d'afficher « 3 min » partout ;
- conserver des dates de revue réelles ;
- associer chaque chiffre sensible à une source ;
- indiquer les relations d'affiliation sur les pages commerciales ;
- afficher clairement les états de conformité et la provenance des données annuaire ;
- ne pas présenter les photos générées comme des clients, experts ou membres de l'équipe.

## 6. Rendu des sections SEO

`DynamicSection.tsx` reste le chemin de compatibilité, mais les nouvelles pages utilisent un `SectionRenderer` plus court et typé. Les sections sont distribuées dans des bandes de fond distinctes afin de conserver une page longue sans donner l'apparence d'un blog continu.

Répartition cible :

- `Hero`, `EditoIntro`, `DefinitionBox` → hero et ouverture ;
- `KeyTakeaways`, `StatHighlight`, `StatsBand` → repères rapides ;
- `ContentSection`, `RichTable`, `ComparisonTable` → lecture et décision ;
- `BenefitsGrid`, `ProcessSteps`, `NumberedSteps`, `Checklist`, `ProsCons` → modules d'action ;
- `Calculator`, `SimulatorTeaser` → outils ;
- `FAQSection_PAA`, `Faq` → accordéons et JSON-LD ;
- `InternalLinks`, `RelatedArticles` → suite de parcours ;
- `AlertBox`, `QuoteBlock`, `ExpertQuote` → preuve ou vigilance ;
- `PricingTeaser`, `TestimonialSlider` → rendus seulement si la provenance est explicite et validée.

Les paragraphes restent dans le HTML initial. Les interactions enrichissent la décision sans masquer le texte aux moteurs ni le rendre dépendant du JavaScript.

### Défauts du renderer actuel à corriger

- `ComparisonTable` attend des chaînes alors que la base contient aussi des objets ou `{headers, rows}` ; certaines matrices disparaissent.
- `InternalLinks` transforme des objets en texte sans rendre les liens cliquables.
- certains sommaires stockent déjà `#` et le composant ajoute un second dièse.
- `TestimonialSlider` retourne actuellement `null` ; il ne doit pas être réactivé avec des témoignages fictifs.
- `LocalProvidersMap` et `OpeningHoursTable` passent dans le fallback inconnu.
- `SubHubGrid`, `DecisionRouter`, `MethodologyBlock`, `DisclosureBlock` et `ConversionBlock` sont prévus par la bibliothèque éditoriale mais n'ont pas encore de renderer.
- plusieurs LP émettent un schema `Article` ou `ProfessionalService` inadapté. Les hubs et LP doivent utiliser `WebPage`, `CollectionPage` ou `ItemList`; `Article` reste réservé aux vrais articles.
- `ServiceJsonLd` présente actuellement Skoria comme fournisseur de prestations comptables et doit être retiré des pages comparateur.

Les dates de publication et de modification doivent utiliser respectivement `published_at` et `reviewed_at`. Une seule FAQ normalisée doit produire `FAQPage`, et `json_ld_extra` doit passer par une validation sémantique.

## 7. Composants et interactions à construire

Fondations : `Section`, `EditorialHero`, `AnchorNav`, `ReadingProgress`, `MediaFigure`, `SectionHeading`, `SourceList`, `FaqAccordion` et cinq shells `Landing`, `Hub`, `Article`, `Commercial`, `Directory`.

Parcours :

- brief global en trois étapes, téléchargeable et repris localement ;
- sélecteur d'activité et de mission sur l'accueil ;
- builders de périmètre pour métier, secteur, service et croisement ;
- filtres de catalogues sur tous les hubs ;
- sélection de trois établissements, comparaison et export dans l'annuaire ;
- sommaire actif et progression de lecture ;
- matrices, calculateurs et vérificateurs de conditions sur les pages commerciales ;
- aperçu des documents et choix guidé des simulateurs.

Clés de stockage :

- `skoria:brief:v2`
- `skoria:journey:v2`
- `skoria:directory-selection:v2`
- `skoria:reading:v2:<pathname>`

Les anciennes clés `skoria-brief-v2` et `skoria-brief-fields-v2` sont migrées ou nettoyées de façon défensive.

## 8. Images à intégrer et à générer

### Sept masters validés à intégrer

Tous font 1 536 × 1 024 px au format PNG et pèsent 15,2 Mo au total. Ils seront conservés comme masters hors livraison web, puis servis via `next/image` en AVIF/WebP.

| ID | Usage principal | Alt utile |
|---|---|---|
| `doctor` | accueil santé, LP médecin | Médecin préparant ses documents dans son cabinet |
| `restaurant` | restauration, secteur et croisement | Restaurateur préparant son activité au comptoir |
| `workspace` | accueil, service comptabilité | Bureau avec ordinateur et documents de travail |
| `atelier` | indépendants, hub professions | Architecte travaillant sur une maquette dans son atelier |
| `apartment` | hub LMNP et ressources immobilières | Appartement meublé lumineux avec table et carnet |
| `objects` | outils et guides | Nature morte de documents et objets de calcul |
| `cityscape` | hubs géographiques | Maquette abstraite d'un quartier français |

Les captures cabinet déjà présentes dans `public/images/directory-previews` restent les seules images documentaires de fiches. Elles ne sont pas recopiées. La photo `team/helene-marchand.jpg` n'est pas réutilisée sans provenance explicite.

### Trois masters P0 à générer

1. `fintech-tools` pour séparer comparatifs, avis et offres de la nature morte générique.
2. `accounting-flow` pour les hubs Services et Documents.
3. `lmnp-dossier` pour éviter de répéter le même appartement sur le hub, le sous-hub et l'article.

Prompts exacts :

**fintech-tools** — `Use case: photorealistic-concept. Premium editorial still life for an independent French business-banking comparison site: one completely unbranded matte navy payment card with no numbers, a small card reader, a blank-screen smartphone, plain receipts with no legible text and a cobalt notebook, on a pale lilac surface with one terracotta accent, hard directional daylight and expressive shadows, sophisticated design-magazine styling, landscape 3:2, no logos, brand colors, product UI, currency amounts, hands, people or watermark.`

**accounting-flow** — `Use case: stylized-concept. Tactile overhead editorial composition explaining an accounting workflow: three stacks of off-white papers connected by cobalt tabs, a closed navy ledger, a simple unbranded calculator with blank keys and one orange archive tray, clean warm paper background, precise shadows, landscape 3:2 with generous negative space, no text, numbers, logos, screens, people or watermark.`

**lmnp-dossier** — `Use case: photorealistic-natural. Editorial flat lay for a French furnished-rental accounting guide: brass keys, material samples, a simplified architectural floor plan with no readable writing, plain purchase folder and small furniture inventory objects on an oak table, diagonal late-afternoon sunlight, cobalt and terracotta accents, landscape 3:2, no people, addresses, prices, logos, text or watermark.`

### Banque mutualisée P1 pour la longue traîne

Il ne faut pas générer une image par URL. Les 114 professions et les services héritent d'un média de famille. Six scènes couvrent les familles manquantes : commerce/e-commerce, transport/logistique, agriculture/environnement, culture/éducation, droit/chiffre et association/non-marchand. Deux scènes service optionnelles couvrent social/paie et création d'entreprise.

Patron de prompt : `Photorealistic editorial scene for the [FAMILY] activity of an independent comparison website; show [OBJECTS/WORKPLACE] in use without identifiable people; candid French small-business environment; warm cream, cobalt, navy and one orange accent; subject offset for text-safe crop; landscape 3:2; no logos, brands, legible documents, customer data, uniforms implying a real company, testimonials or watermark.`

## 9. Performance et accessibilité image

- Ajouter `images.formats: ['image/avif', 'image/webp']` dans `next.config.ts`.
- Utiliser `next/image`, `fill` et `sizes` sur les nouveaux médias.
- Réserver `priority` à l'unique image LCP d'une page.
- Utiliser des crops CSS depuis les masters 3:2 ; ne pas dupliquer les fichiers pour chaque ratio.
- Ajouter un `figcaption` de transparence lorsqu'une personne fictive est visible.
- Utiliser un alt vide pour un emploi purement décoratif.
- Garder les cartes Leaflet et l'attribution OpenStreetMap ; un fallback statique reste secondaire.

## 10. Ordre d'implémentation

1. Créer les JSON, leur validateur et le manifeste médias.
2. Intégrer les sept masters, générer les trois P0 et activer l'optimisation Next.
3. Installer les tokens, Instrument Serif local, le header, le footer et le brief global.
4. Livrer l'accueil et les hubs afin que la nouvelle navigation soit cohérente immédiatement.
5. Livrer les LP profession, service, secteur et croisement avec 13 sections utiles.
6. Livrer annuaire national, ville et fiche avec sélection persistante.
7. Livrer guides, articles, comparatifs, avis et offres.
8. Appliquer les shells aux détails simulateur et document.
9. Valider les JSON, le rendu serveur, le clavier, le stockage local et les calculs.
10. Exécuter les tests existants, TypeScript, le build et des captures 1 440/390 px.

## 11. Garde-fous de livraison

- Préserver tous les fichiers non suivis déjà présents dans le dépôt.
- Ne pas ajouter une requête Supabase par section ou par carte.
- Ne pas hydrater l'annuaire national complet côté client.
- Conserver les metadata, canonicals, breadcrumbs et JSON-LD côté serveur.
- Conserver les anciens alias Tailwind pendant la migration.
- Utiliser une police locale pour Instrument Serif afin que le build ne dépende pas du réseau.
- Ne pas considérer la longueur brute comme une garantie SEO ; chaque section doit répondre à une intention.
- Tester en premier les contenus publiés et les pages représentatives validées.

## 12. Vérification attendue

Après installation des dépendances :

- validations métier existantes pour profession, expertises et annuaire ;
- `npx tsx scripts/check-commercial.ts` et checks simulateurs ;
- validation de tous les nouveaux JSON et références médias ;
- `./node_modules/.bin/tsc --noEmit` ;
- `npm run build` ;
- smoke test des 24 gabarits ;
- captures desktop 1 440 px et mobile 390 px ;
- contrôle des images absentes, overflows, focus clavier et contrastes.

Cet inventaire constitue la checklist d'implémentation. Les migrations de publication et les modifications Supabase restent séparées des changements de rendu afin de pouvoir relire chaque famille de contenu avant sa mise en ligne.
