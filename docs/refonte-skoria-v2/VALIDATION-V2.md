# Validation de la refonte Skoria V2

Contrôle local du 9 septembre 2026, sur le site Next.js servi à `http://127.0.0.1:3100`, avec l’adaptateur SQLite.

## Périmètre couvert

Les familles de templates publics utilisent la présentation V2 : accueil, hubs, professions, secteurs, expertises et croisements, villes et départements, annuaire et fiches cabinet, ressources et guides, comparatifs/avis/parrainages, documents, simulateurs et pages institutionnelles.

La migration inclut les composants partagés qui restaient visibles dans les contenus de la base : définitions, points clés, textes, sources, étapes, tableaux, comparaisons, FAQ, liens connexes et encarts auteur. Les titres utilisent une graisse homogène et aucune italique.

Les variantes sans contenu éditorial publié disposent également d’une présentation V2. Les statuts de publication restent respectés : cette migration ne publie aucun brouillon. Les guides et fiches commerciales non publiés conservent leurs redirections ou restrictions existantes.

## Pages d’outils

- Les 14 outils disposent d’un contenu dédié dans `src/data/skoria-v2/tools-seo.json` : titre, H1, description, champs, résultats affichés, méthode et liens vers des outils complémentaires.
- Le formulaire suit désormais un en-tête compact et son sommaire. Les compteurs et appels secondaires qui retardaient l’accès au calcul ont été retirés de cette zone.
- Chaque page expose un graphe avec une `WebPage` dont l’entité principale est la `WebApplication`, reliée au site, à l’éditeur, au fil d’Ariane et à la FAQ. Les fonctions déclarées apparaissent aussi dans le contenu visible.
- Canonical, OpenGraph et Twitter pointent vers l’outil et décrivent sa fonction. Le contenu éditorial en brouillon ne peut pas remplacer les métadonnées publiques.
- Le hub `/simulateurs` dispose de ses propres métadonnées et d’une `CollectionPage` reliée à une `ItemList` de 14 outils, sans classement de qualité implicite.
- Les illustrations restent des images éditoriales, sans être déclarées comme captures de l’application. Aucune note, aucun avis, aucune version logicielle et aucune date de validation du calcul ne sont fabriqués.
- Le cadre `ToolEditorialContent` uniformise les marges, les largeurs et l’espacement des 98 sections des outils. Les sources sont alignées sur le texte, les ancres de navigation sont conservées et les définitions n’affichent plus deux fois le même intitulé de source.

`WebApplication` est le sous-type Schema.org adapté à une application accessible dans le navigateur. [Schema.org — WebApplication](https://schema.org/WebApplication)

Le balisage décrit les outils réels. L’éligibilité au résultat enrichi « logiciel » de Google demande notamment un avis ou une note authentique ; ces données n’existent pas ici et ne sont pas ajoutées. La validité du graphe ne signifie donc pas que ce résultat enrichi est disponible. [Google — Software application structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)

La FAQ structurée conserve une description sémantique des questions visibles. Elle n’est pas présentée comme un moyen d’obtenir des résultats enrichis FAQ : Google a retiré cet affichage en mai 2026. [Google — mises à jour de la documentation](https://developers.google.com/search/updates#may-2026)

## Contrôles réalisés

| Contrôle | Résultat |
| --- | --- |
| 47 URLs représentatives, parcourues séquentiellement | Réponses 200, un H1 par page, aucun identifiant HTML dupliqué |
| 7 817 sections stockées en SQLite, 29 types | Rendu serveur sans exception |
| 209 sections avantages/inconvénients | Aucun rendu de secours, textes exploitables conservés |
| 14 configurations et graphes d’outils | Identités reliées, fonctions réelles, FAQ cohérentes, JSON sécurisé |
| 14 pages d’outils servies en HTTP | Canonical, OpenGraph, Twitter, H1, entité principale, fonctions visibles, liens connexes et absence de doublons vérifiés |
| 49 contrôles des calculs existants | Réussis ; formules conservées |
| TypeScript | `npx tsc --noEmit` réussi |
| Diff | `git diff --check` réussi |

Les contrôles existants des templates profession, service, ville d’annuaire, fiche cabinet et commerciaux ont également réussi. Les assertions de contenu, de publication et de provenance restent actives ; les anciennes assertions portant uniquement sur une largeur CSS précise ont été adaptées à la nouvelle mise en page.

La revue visuelle a été effectuée sur des représentants des templates communs, en 1280 px et 390 px : FAQ et checklist d’un dossier publié, parcours local de Paris, fiche cabinet, documents avec/sans PDF, formulaires et résultats TVA/frais kilométriques, définition, texte et sources sous le calculateur. Aucun débordement horizontal de page n’a été constaté sur ces écrans.

Interactions vérifiées : ouverture FAQ, choix du mode d’échange local, ouverture/fermeture du brief prérempli, recherche de cabinet, accès à sa fiche, modification d’un montant de TVA et des kilomètres, activation de l’option électrique. Les PDF existants restent accessibles ; les fiches sans fichier ne proposent pas de téléchargement fictif.

Un contrôle de provenance a aussi repéré quatre faits de démonstration préexistants sur la fiche pilote de Paris. Les sources en `.test` sont désormais exclues à la lecture du contenu, des contacts, des métadonnées, du JSON-LD et des données sérialisées avec la page. Les neuf faits issus de la source publique réelle sont conservés ; la base n’a pas été modifiée.

## Rejouer les contrôles ciblés

```sh
npx tsc --noEmit
npx tsx scripts/check-simulateurs.ts
npx tsx scripts/check-simulateurs-seo.ts
SKORIA_TEST_ORIGIN=http://127.0.0.1:3100 npx tsx scripts/check-simulateurs-seo.ts
SKORIA_DB_ADAPTER=sqlite npx tsx scripts/check-directory-public-enrichment.tsx
git diff --check
```

La couverture de rendu de la base et les contrôles HTTP complètent les vérifications visuelles ; ils ne constituent pas une revue manuelle de chacune des URLs dynamiques. Aucune mise en production n’a été effectuée pendant ce contrôle.
