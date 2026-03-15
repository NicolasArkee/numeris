#!/usr/bin/env python3
"""Pre-processing des keywords expert-comptable: normalisation + dedup lexicale.

- Normalise: lowercase, strip accents, hyphens → spaces, collapse whitespace
- Groupe les near-duplicates par forme normalisée identique
- Pour chaque groupe: garde la variante avec le volume max comme canonical
- Agrège le volume total du groupe
- Output: CSV prêt pour le pipeline de clustering

Usage:
    python preprocess_expert_comptable.py
"""

import pandas as pd
import unicodedata
import re

INPUT_CSV = "audit/corsair/expert-comptable_broad-match_fr_2026-03-15.csv"
OUTPUT_CSV = "audit/corsair/expert-comptable_master.csv"


def normalize_keyword(kw: str) -> str:
    """Normalise un keyword: lowercase, strip accents, hyphens→spaces, collapse spaces."""
    if not isinstance(kw, str):
        return ""
    # Lowercase
    kw = kw.lower().strip()
    # Strip accents: NFD decompose → remove combining marks → NFC recompose
    kw = unicodedata.normalize("NFD", kw)
    kw = "".join(c for c in kw if unicodedata.category(c) != "Mn")
    kw = unicodedata.normalize("NFC", kw)
    # Hyphens, underscores, dots → spaces
    kw = re.sub(r"[-_\.''`]", " ", kw)
    # Remove other non-alphanumeric (keep digits)
    kw = re.sub(r"[^\w\s]", " ", kw)
    # Collapse whitespace
    kw = re.sub(r"\s+", " ", kw).strip()
    return kw


def main():
    print(f"Reading {INPUT_CSV}...")
    df = pd.read_csv(INPUT_CSV, low_memory=False)
    print(f"  {len(df)} keywords bruts")

    # Rename columns to match pipeline format
    df = df.rename(columns={
        "Keyword": "query",
        "Volume": "Volume_Y",
        "Intent": "intent",
        "Keyword Difficulty": "kd",
        "CPC (USD)": "cpc",
        "SERP Features": "serp_features",
    })

    # Ensure Volume is numeric
    df["Volume_Y"] = pd.to_numeric(df["Volume_Y"], errors="coerce").fillna(0).astype(int)

    # Normalize
    print("Normalizing keywords...")
    df["normalized"] = df["query"].apply(normalize_keyword)

    # Remove empty after normalization
    df = df[df["normalized"] != ""].copy()
    print(f"  {len(df)} after removing empty")

    # Show examples of normalization
    print("\n  Exemples de normalisation:")
    examples = [
        "expert-comptable", "Expert Comptable", "expert comptable",
        "expert-comptable étude", "expert comptable etude",
        "experts comptables", "l'expert comptable",
    ]
    for ex in examples:
        norm = normalize_keyword(ex)
        if ex != norm:
            print(f"    '{ex}' → '{norm}'")

    # Group by normalized form
    print("\nGrouping near-duplicates by normalized form...")
    groups = df.groupby("normalized")
    n_groups = len(groups)
    n_deduped = len(df) - n_groups
    print(f"  {len(df)} keywords → {n_groups} groupes uniques ({n_deduped} doublons fusionnés)")

    # For each group: keep the variant with highest volume as canonical query
    # Aggregate: sum volumes, keep intent/kd/cpc from highest-volume variant
    records = []
    multi_variant_examples = []

    for norm_kw, group in groups:
        # Sort by volume desc
        group_sorted = group.sort_values("Volume_Y", ascending=False)
        canonical = group_sorted.iloc[0]

        total_volume = group_sorted["Volume_Y"].sum()
        n_variants = len(group_sorted)

        record = {
            "query": canonical["query"],  # Original form with highest volume
            "normalized": norm_kw,
            "Volume_Y": total_volume,
            "intent": canonical["intent"],
            "kd": canonical["kd"],
            "cpc": canonical["cpc"],
            "serp_features": canonical["serp_features"],
            "n_variants": n_variants,
        }

        # Track variants for examples
        if n_variants > 1 and len(multi_variant_examples) < 20:
            variants = group_sorted["query"].tolist()
            vols = group_sorted["Volume_Y"].tolist()
            multi_variant_examples.append({
                "canonical": canonical["query"],
                "normalized": norm_kw,
                "variants": list(zip(variants, vols)),
                "total_vol": total_volume,
            })

        records.append(record)

    result = pd.DataFrame(records)
    result = result.sort_values("Volume_Y", ascending=False).reset_index(drop=True)

    # Show multi-variant examples
    print(f"\n  Top exemples de groupes multi-variantes ({len(multi_variant_examples)} affichés):")
    for ex in sorted(multi_variant_examples, key=lambda x: -x["total_vol"])[:15]:
        print(f"    '{ex['normalized']}' (vol total={ex['total_vol']:,}):")
        for var, vol in ex["variants"]:
            marker = " ★" if var == ex["canonical"] else ""
            print(f"      - '{var}' (vol={vol:,}){marker}")

    # Stats
    print(f"\n  Stats:")
    print(f"    Input: {len(df)} keywords")
    print(f"    Output: {len(result)} keywords uniques")
    print(f"    Dedup rate: {n_deduped/len(df)*100:.1f}%")
    print(f"    Volume total: {result['Volume_Y'].sum():,}")
    multi = result[result["n_variants"] > 1]
    print(f"    Groupes multi-variantes: {len(multi)} ({len(multi)/len(result)*100:.1f}%)")

    # Intent distribution
    print(f"\n  Distribution des intents:")
    intent_counts = result["intent"].value_counts(dropna=False).head(10)
    for intent, count in intent_counts.items():
        print(f"    {intent}: {count}")

    # Save
    print(f"\nSaving to {OUTPUT_CSV}...")
    result.to_csv(OUTPUT_CSV, index=False)
    print(f"  Done! {len(result)} keywords prêts pour le clustering.")


if __name__ == "__main__":
    main()
