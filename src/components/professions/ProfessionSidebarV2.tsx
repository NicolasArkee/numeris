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
      className={`border p-5 ${
        tone === "dark"
          ? "border-brand-ink bg-brand-ink text-surface"
          : "border-border-soft bg-surface text-ink"
      }`}
    >
      <p
        className={`text-[0.64rem] font-bold uppercase tracking-[0.14em] ${
          tone === "dark" ? "text-accent-500" : "text-accent-700"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[1.08rem] font-semibold leading-tight">
        {title}
      </h2>
      {body && (
        <p
          className={`mt-2 text-[0.76rem] leading-5 ${
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
            className={`block text-[0.78rem] font-semibold ${
              tone === "dark" ? "text-white" : "text-ink"
            }`}
          >
            {point.title}
          </span>
          <span
            className={`mt-1 block text-[0.72rem] leading-5 ${
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

  if ([...details].some((item) => item.includes("tva") || item.includes("caisse"))) {
    points.push({
      title: "TVA ventilée par canal",
      body: "La caisse doit distinguer magasin, coffrets et e-commerce pour éviter les mélanges de taux.",
    });
  }

  if ([...details].some((item) => item.includes("stock") || item.includes("lot") || item.includes("dlc"))) {
    points.push({
      title: "Stock suivi par âge",
      body: "Les lots, DLC et produits premium à rotation lente doivent être visibles avant la clôture.",
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
      title: "Régime BIC commerce",
      body: "Le choix micro/réel doit être lu avec la marge, le niveau de stock et les investissements.",
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
      body="L'objectif est de relier la comptabilité au stock, aux marges et aux décisions d'achat."
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
    <div className="mb-12 grid max-w-[72rem] gap-6 lg:grid-cols-[minmax(0,48rem)_20rem] lg:items-start">
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
