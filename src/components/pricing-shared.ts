// ─── Typage partagé des tiers de pricing inline ───
// Consommé par PricingTeaser (rendu) et DynamicSection (coercition DB/Gemini).
// NB : Pricing.tsx (section homepage) consomme la table `pricing_plans`
// (shape différente) et reste volontairement séparé.

import type { PricingTier } from "@/libs/db";

export interface PricingTierShape {
  name: string;
  from: string;
  features: string[];
  highlighted?: boolean;
}

// Adaptateur DB row → props composant (features = JSON string[] en colonne).
export function pricingTierToProp(tier: PricingTier): PricingTierShape {
  let features: string[] = [];
  try {
    const parsed = JSON.parse(tier.features) as unknown;
    if (Array.isArray(parsed)) {
      features = parsed.filter((f): f is string => typeof f === "string");
    }
  } catch {
    features = [];
  }
  return {
    name: tier.name,
    from: tier.from_price,
    features,
    highlighted: tier.highlighted === 1,
  };
}
