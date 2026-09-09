import type { PageSection } from "@/libs/db";
import React from "react";
import type { ProfessionSidebarData } from "./profession-v2-helpers";

type AsidePoint = {
  title: string;
  body: string;
};

function SectionAsideShell({
  eyebrow,
  title,
  body,
  children,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <aside
      data-profession-aside="true"
      className={`overflow-hidden rounded-[1.5rem] border p-6 ${
        tone === "dark"
          ? "border-brand-ink bg-brand-ink text-surface"
          : "border-ink/10 bg-mint text-ink"
      }`}
    >
      <p
        className={`text-[0.64rem] font-bold uppercase tracking-[0.14em] ${
          tone === "dark" ? "text-accent-500" : "text-accent-700"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-[1.4rem] font-bold leading-tight">
        {title}
      </h2>
      {body && (
        <p
          className={`mt-4 text-[.83rem] leading-6 ${
            tone === "dark" ? "text-white/68" : "text-ink-muted"
          }`}
        >
          {body}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </aside>
  );
}

function PointList({
  points,
  tone = "light",
}: {
  points: AsidePoint[];
  tone?: "light" | "dark";
}) {
  return (
    <ul className="space-y-3">
      {points.map((point) => (
        <li
          key={point.title}
          className={`border-t pt-3 ${
            tone === "dark" ? "border-white/12" : "border-border-soft"
          }`}
        >
          <span
            className={`block text-[.84rem] font-bold ${
              tone === "dark" ? "text-white" : "text-ink"
            }`}
          >
            {point.title}
          </span>
          <span
            className={`mt-2 block text-[.78rem] leading-6 ${
              tone === "dark" ? "text-white/62" : "text-ink-muted"
            }`}
          >
            {point.body}
          </span>
        </li>
      ))}
    </ul>
  );
}

function dataChecklistItems(data: ProfessionSidebarData): AsidePoint[] {
  return data.missingData.slice(0, 4).map((item) => ({
    title: item,
    body: "À obtenir pour passer d'un échange général à un diagnostic chiffrable.",
  }));
}

function focusPoints(data: ProfessionSidebarData): AsidePoint[] {
  const details = new Set(data.insight.specifics.map((item) => item.toLowerCase()));
  const points: AsidePoint[] = [];
  const isFineGrocery = data.insight.profession.toLowerCase().includes("épicer");

  if ([...details].some((item) => item.includes("caisse"))) {
    points.push({
      title: isFineGrocery ? "TVA ventilée par canal" : "Flux de caisse",
      body: isFineGrocery
        ? "La caisse doit distinguer magasin, coffrets et e-commerce pour éviter les mélanges de taux."
        : "Faire préciser les exports attendus, les corrections, les canaux à distinguer et la personne qui valide les écarts.",
    });
  }

  if (!isFineGrocery && [...details].some((item) => item.includes("tva"))) {
    points.push({
      title: "Traitement de la TVA",
      body: "Faire confirmer le régime, les opérations concernées, les justificatifs et les contrôles adaptés à la situation.",
    });
  }

  if ([...details].some((item) => item.includes("stock") || item.includes("lot") || item.includes("dlc"))) {
    points.push({
      title: isFineGrocery ? "Stock suivi par âge" : "Inventaire et valorisation",
      body: isFineGrocery
        ? "Les lots, DLC et produits premium à rotation lente doivent être visibles avant la clôture."
        : "Décrire la méthode de suivi, la date d'inventaire, les écarts et les éléments à rapprocher des comptes.",
    });
  }

  if ([...details].some((item) => item.includes("import"))) {
    points.push({
      title: "Achats importés",
      body: "Les flux fournisseurs hors France demandent un contrôle TVA et justificatif spécifique.",
    });
  }

  if ([...details].some((item) => item.includes("bic"))) {
    points.push({
      title: "Régime BIC à confirmer",
      body: "Le professionnel doit valider le régime applicable et expliquer ses conséquences à partir de la situation réelle.",
    });
  }

  if ([...details].some((item) => item.includes("bnc"))) {
    points.push({
      title: "Régime BNC à confirmer",
      body: "Le mode d'exercice, les options et les obligations associées doivent être vérifiés avant de définir la mission.",
    });
  }

  if ([...details].some((item) => item.includes("urssaf") || item.includes("carmf") || item.includes("carpimko") || item.includes("cipav"))) {
    points.push({
      title: "Échéances sociales du dirigeant",
      body: "Identifier les organismes, les bases disponibles et les échéances à coordonner avec les autres déclarations.",
    });
  }

  return points.slice(0, 4);
}

function riskPoints(data: ProfessionSidebarData): AsidePoint[] {
  return data.insight.painPoints.slice(0, 4).map((item) => {
    const key = item.toLowerCase();
    if (key.includes("bfr")) {
      return {
        title: "Trésorerie immobilisée",
        body: "Mesurer le cash bloqué dans le stock avant de décider achats, remises ou financement.",
      };
    }
    if (key.includes("marge")) {
      return {
        title: "Marge par fournisseur",
        body: "Identifier les familles qui financent vraiment le commerce, pas seulement le chiffre d'affaires.",
      };
    }
    if (key.includes("coffret") || key.includes("panier")) {
      return {
        title: "Coffrets et paniers composés",
        body: "Vérifier la TVA et la marge quand plusieurs produits sont vendus dans une même offre.",
      };
    }
    if (key.includes("dlc") || key.includes("casse")) {
      return {
        title: "Pertes et DLC",
        body: "Faire apparaître la casse, les dates courtes et les produits dormants dans le pilotage.",
      };
    }
    if (key.includes("échéance") || key.includes("echeance")) {
      return {
        title: "Calendrier et dépendances",
        body: "Relier chaque échéance aux pièces attendues, à la personne qui valide et à la procédure prévue en cas de retard.",
      };
    }
    if (key.includes("responsabilit")) {
      return {
        title: "Répartition des rôles",
        body: "Faire écrire qui prépare, contrôle, valide, dépose et répond lorsqu'une information reste incertaine.",
      };
    }
    if (key.includes("justificatif")) {
      return {
        title: "Circuit des justificatifs",
        body: "Tester le chemin d'une pièce, de sa collecte à son classement, puis la gestion des doublons et des pièces manquantes.",
      };
    }
    if (key.includes("encaissement") || key.includes("dépense") || key.includes("depense")) {
      return {
        title: "Recettes et dépenses professionnelles",
        body: "Séparer les flux professionnels, documenter les remboursements et repérer les opérations qui demandent une validation.",
      };
    }
    if (key.includes("dossier") || key.includes("chantier")) {
      return {
        title: "Suivi par dossier",
        body: "Définir l'unité de suivi, les coûts rattachés, les travaux en cours et le moment où une revue devient utile.",
      };
    }
    if (key.includes("ressource") || key.includes("affectation")) {
      return {
        title: "Traçabilité des ressources",
        body: "Relier les fonds reçus à leur objet, aux justificatifs attendus et au niveau de restitution demandé.",
      };
    }
    return {
      title: item,
      body: "Point à objectiver avec les exports comptables et les données de gestion.",
    };
  });
}

function assetPoints(data: ProfessionSidebarData): AsidePoint[] {
  return data.insight.proposedAssets.slice(0, 3).map((asset) => ({
    title: asset,
    body: "Support utile pour transformer les données disponibles en décision opérationnelle.",
  }));
}

function SectionIntroAside({ data }: { data: ProfessionSidebarData }) {
  const points = focusPoints(data);
  if (points.length === 0) return null;
  return (
    <SectionAsideShell
      eyebrow="Cadrage"
      title="Les contrôles utiles"
      body="Les spécificités métier sont traduites en contrôles comptables concrets."
      tone="dark"
    >
      <PointList points={points} tone="dark" />
    </SectionAsideShell>
  );
}

function PreparationAside({ data }: { data: ProfessionSidebarData }) {
  const points = dataChecklistItems(data);
  if (points.length === 0) return null;
  return (
    <SectionAsideShell
      eyebrow="Avant diagnostic"
      title="Pièces à préparer"
      body="Ces éléments rendent l'échange plus concret dès le premier rendez-vous."
    >
      <PointList points={points} />
    </SectionAsideShell>
  );
}

function RisksAside({ data }: { data: ProfessionSidebarData }) {
  const points = riskPoints(data);
  if (points.length === 0) return null;
  return (
    <SectionAsideShell
      eyebrow="Points de contrôle"
      title="Les sujets à objectiver"
      body="Les risques métier sont reformulés en questions de pilotage."
    >
      <PointList points={points} />
    </SectionAsideShell>
  );
}

function ToolsAside({ data }: { data: ProfessionSidebarData }) {
  const points = assetPoints(data);
  if (points.length === 0) return null;
  return (
    <SectionAsideShell
      eyebrow="Pilotage"
      title="Outils utiles"
      body="L'objectif est de relier les pièces, les contrôles, les échéances et les décisions propres à l'activité."
    >
      <PointList points={points} />
    </SectionAsideShell>
  );
}

export function ProfessionSectionWithAside({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  if (!aside) return <>{children}</>;

  return (
    <div className="mb-12 grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div className="min-w-0 [&>*:last-child]:mb-0">{children}</div>
      <div className="min-w-0 lg:sticky lg:top-[calc(72px+2rem)] lg:self-start">{aside}</div>
    </div>
  );
}

export function getProfessionSectionAside(
  data: ProfessionSidebarData,
  section: Pick<PageSection, "section_type" | "section_order" | "title">,
) {
  const title = (section.title ?? "").toLowerCase();

  if (section.section_type === "Hero" || section.section_type === "EditoIntro") {
    return <SectionIntroAside data={data} />;
  }

  if (section.section_type === "ComparisonTable") {
    return <PreparationAside data={data} />;
  }

  if (
    section.section_type === "ContentSection"
    && /obligation/u.test(title)
  ) {
    return <RisksAside data={data} />;
  }

  if (section.section_type === "StatsBand" || /march[ée]|chiffres/u.test(title)) {
    return <ToolsAside data={data} />;
  }

  return null;
}
