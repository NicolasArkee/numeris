#!/usr/bin/env python3
"""Clustering semantique par embeddings OpenAI pour Expert-Comptable.

Pipeline: Embed → UMAP(15d) → HDBSCAN → Sub-cluster L3/L4 → LLM labeling → arbo L1-L4

Usage:
    export OPENAI_API_KEY="sk-..."
    python run_expert_comptable_embeddings.py
"""

import os
import time
import json
import numpy as np
import pandas as pd
from openai import OpenAI

# --- Config ---
MASTER_CSV = "audit/corsair/expert-comptable_master.csv"
OUTPUT_DIR = "output_live/expert-comptable"
EMBEDDINGS_CACHE = f"{OUTPUT_DIR}/embeddings.npy"
QUERIES_CACHE = f"{OUTPUT_DIR}/queries.json"
UMAP_CACHE = f"{OUTPUT_DIR}/umap_15d.npy"
EMBED_MODEL = "text-embedding-3-small"
EMBED_BATCH_SIZE = 2000
EMBED_DIMENSIONS = 256
UMAP_DIMS = 15
HDBSCAN_MIN_CLUSTER = 30
HDBSCAN_MIN_SAMPLES = 10
LLM_MODEL = "gpt-4.1"

# L1 categories adaptées au domaine expert-comptable
L1_CATEGORIES = (
    "Métier & Formation, Salaires & Rémunération, Cabinets & Annuaires, "
    "Géolocalisation, Services & Spécialités, Fiscalité & Comptabilité, "
    "Logiciels & Outils, Ordre & Réglementation, Création & Statuts, "
    "Secteurs d'activité, Tarifs & Devis, Marques & Éditeurs, Autre"
)


# ================================================================
# STEP 1 — Embeddings OpenAI (avec cache)
# ================================================================

def embed_keywords(queries: list[str]) -> np.ndarray:
    """Embed toutes les queries via OpenAI, avec cache disque."""
    if os.path.exists(EMBEDDINGS_CACHE) and os.path.exists(QUERIES_CACHE):
        with open(QUERIES_CACHE, "r") as f:
            cached = json.load(f)
        if cached == queries:
            print(f"  Cache hit: {EMBEDDINGS_CACHE}")
            return np.load(EMBEDDINGS_CACHE)

    client = OpenAI()
    all_emb = []
    total = len(queries)
    print(f"  Embedding {total} queries ({EMBED_MODEL}, dim={EMBED_DIMENSIONS})...")
    t0 = time.time()

    for i in range(0, total, EMBED_BATCH_SIZE):
        batch = queries[i:i + EMBED_BATCH_SIZE]
        resp = client.embeddings.create(input=batch, model=EMBED_MODEL, dimensions=EMBED_DIMENSIONS)
        all_emb.extend([e.embedding for e in resp.data])
        done = i + len(batch)
        elapsed = time.time() - t0
        eta = (total - done) / (done / elapsed) if done > 0 else 0
        print(f"    {done}/{total} ({100*done/total:.0f}%) - {elapsed:.1f}s - ETA {eta:.0f}s")

    emb = np.array(all_emb, dtype=np.float32)
    print(f"  {emb.shape} en {time.time()-t0:.1f}s")
    np.save(EMBEDDINGS_CACHE, emb)
    with open(QUERIES_CACHE, "w") as f:
        json.dump(queries, f)
    return emb


# ================================================================
# STEP 2 — UMAP reduction (256d → 15d)
# ================================================================

def reduce_umap(embeddings: np.ndarray) -> np.ndarray:
    """UMAP dimensionality reduction pour denoiser avant HDBSCAN."""
    if os.path.exists(UMAP_CACHE):
        cached = np.load(UMAP_CACHE)
        if cached.shape[0] == embeddings.shape[0]:
            print(f"  Cache hit: {UMAP_CACHE}")
            return cached

    import umap
    print(f"  UMAP {embeddings.shape[1]}d → {UMAP_DIMS}d ({embeddings.shape[0]} points)...")
    t0 = time.time()

    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1
    normed = embeddings / norms

    reducer = umap.UMAP(
        n_components=UMAP_DIMS,
        metric="cosine",
        n_neighbors=30,
        min_dist=0.0,
        random_state=42,
    )
    reduced = reducer.fit_transform(normed)
    print(f"  {reduced.shape} en {time.time()-t0:.1f}s")
    np.save(UMAP_CACHE, reduced)
    return reduced


# ================================================================
# STEP 3 — HDBSCAN sur espace reduit
# ================================================================

def cluster_hdbscan(reduced: np.ndarray) -> tuple[np.ndarray, object]:
    """HDBSCAN sur vecteurs UMAP. Retourne labels + clusterer."""
    import hdbscan

    print(f"  HDBSCAN (min_cluster={HDBSCAN_MIN_CLUSTER}, min_samples={HDBSCAN_MIN_SAMPLES})...")
    t0 = time.time()

    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=HDBSCAN_MIN_CLUSTER,
        min_samples=HDBSCAN_MIN_SAMPLES,
        metric="euclidean",
        cluster_selection_method="eom",
        cluster_selection_epsilon=0.3,
    )
    labels = clusterer.fit_predict(reduced)

    n_cl = len(set(labels)) - (1 if -1 in labels else 0)
    n_noise = (labels == -1).sum()
    print(f"  {n_cl} clusters, {n_noise} noise ({100*n_noise/len(labels):.1f}%) en {time.time()-t0:.1f}s")
    return labels, clusterer


# ================================================================
# STEP 4 — Reassigner le bruit au cluster le plus proche
# ================================================================

def assign_noise(df: pd.DataFrame, reduced: np.ndarray, cluster_col: str = "cluster") -> pd.DataFrame:
    """Reassigne les points noise (-1) au centroide du cluster le plus proche."""
    labels = df[cluster_col].values
    noise_mask = labels == -1
    n_noise = noise_mask.sum()
    if n_noise == 0:
        return df

    cluster_ids = sorted(set(labels) - {-1})
    centroids = np.array([reduced[labels == c].mean(axis=0) for c in cluster_ids])

    noise_points = reduced[noise_mask]
    dists = np.linalg.norm(noise_points[:, None, :] - centroids[None, :, :], axis=2)
    nearest = np.argmin(dists, axis=1)

    df.loc[noise_mask, cluster_col] = [cluster_ids[n] for n in nearest]
    print(f"  {n_noise} noise reassignes → 0 restants")
    return df


# ================================================================
# STEP 5 — Labelling LLM L2 (par batch de clusters)
# ================================================================

def label_clusters_llm(df: pd.DataFrame, cluster_col: str = "cluster") -> dict:
    """Labellise chaque cluster via LLM en envoyant les top KW."""
    client = OpenAI()

    cluster_ids = sorted(df[cluster_col].unique())
    cluster_info = {}
    for cid in cluster_ids:
        mask = df[cluster_col] == cid
        top = df.loc[mask].nlargest(8, "Volume_Y")
        kw_list = top["query"].tolist()
        total_vol = int(df.loc[mask, "Volume_Y"].sum())
        size = int(mask.sum())
        cluster_info[cid] = {"kw": kw_list, "size": size, "volume": total_vol}

    batch_size = 15
    all_labels = {}
    print(f"  Labelling {len(cluster_ids)} clusters via LLM ({LLM_MODEL})...")
    t0 = time.time()

    for i in range(0, len(cluster_ids), batch_size):
        batch_ids = cluster_ids[i:i + batch_size]
        prompt_parts = []
        for cid in batch_ids:
            info = cluster_info[cid]
            kw_str = ", ".join(info["kw"])
            prompt_parts.append(f"Cluster {cid} ({info['size']} KW, vol={info['volume']:,}): {kw_str}")

        prompt = (
            "Tu es un expert SEO. Pour chaque cluster de mots-cles ci-dessous, donne:\n"
            "1. Un label court (2-4 mots, en francais) qui resume le theme semantique\n"
            f"2. Une categorie parente L1 parmi: {L1_CATEGORIES}\n\n"
            "Reponds en JSON: {\"labels\": {\"<cluster_id>\": {\"label\": \"...\", \"L1\": \"...\"}, ...}}\n\n"
            + "\n".join(prompt_parts)
        )

        resp = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        raw = resp.choices[0].message.content
        try:
            data = json.loads(raw)
            batch_labels = data.get("labels", data)
            for k, v in batch_labels.items():
                cid = int(k)
                all_labels[cid] = {
                    "label": v["label"],
                    "L1": v["L1"],
                    **cluster_info[cid],
                }
        except (json.JSONDecodeError, KeyError) as e:
            print(f"    Batch {i//batch_size} parse error: {e}")
            for cid in batch_ids:
                all_labels[cid] = {
                    "label": cluster_info[cid]["kw"][0],
                    "L1": "Autre",
                    **cluster_info[cid],
                }

        print(f"    {min(i+batch_size, len(cluster_ids))}/{len(cluster_ids)} clusters labellises")

    elapsed = time.time() - t0
    print(f"  Done en {elapsed:.1f}s")
    return all_labels


# ================================================================
# STEP 6/7 — Sub-clustering hierarchique (L2 → L3 → L4)
# ================================================================

def subcluster(df: pd.DataFrame, embeddings: np.ndarray, parent_col: str, child_col: str,
               min_for_split: int = 20, min_per_sub: int = 50, max_k: int = 12) -> tuple[pd.DataFrame, dict]:
    """Sub-cluster chaque cluster parent en sous-clusters via KMeans cosine."""
    from sklearn.cluster import KMeans

    child_labels = np.full(len(df), -1, dtype=int)
    child_counter = 0
    mapping = {}  # child_id → parent_id

    for cid in sorted(df[parent_col].unique()):
        mask = (df[parent_col] == cid).values
        n = mask.sum()
        indices = np.where(mask)[0]

        if n < min_for_split:
            child_labels[indices] = child_counter
            mapping[child_counter] = int(cid)
            child_counter += 1
            continue

        k = max(2, min(n // min_per_sub, max_k))

        cluster_emb = embeddings[indices]
        norms = np.linalg.norm(cluster_emb, axis=1, keepdims=True)
        norms[norms == 0] = 1

        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        sub_labels = km.fit_predict(cluster_emb / norms)

        for sl in range(k):
            sub_idx = indices[sub_labels == sl]
            if len(sub_idx) > 0:
                child_labels[sub_idx] = child_counter
                mapping[child_counter] = int(cid)
                child_counter += 1

    df[child_col] = child_labels
    print(f"  {child_counter} {child_col} sub-clusters")
    return df, mapping


# ================================================================
# STEP 8 — Labelling LLM des sous-clusters L3
# ================================================================

def label_subclusters_llm(df: pd.DataFrame, child_col: str, mapping: dict,
                          parent_labels: dict) -> dict:
    """Label les sous-clusters via LLM avec contexte du parent."""
    client = OpenAI()

    child_ids = sorted(df[child_col].unique())
    child_info = {}
    for cid in child_ids:
        mask = df[child_col] == cid
        top = df.loc[mask].nlargest(5, "Volume_Y")
        parent_id = mapping[cid]
        child_info[cid] = {
            "kw": top["query"].tolist(),
            "size": int(mask.sum()),
            "volume": int(df.loc[mask, "Volume_Y"].sum()),
            "parent": parent_labels.get(parent_id, {}).get("label", "?"),
        }

    batch_size = 25
    all_labels = {}
    print(f"  Labelling {len(child_ids)} sous-clusters via LLM ({LLM_MODEL})...")
    t0 = time.time()

    for i in range(0, len(child_ids), batch_size):
        batch_ids = child_ids[i:i + batch_size]
        parts = []
        for cid in batch_ids:
            info = child_info[cid]
            parts.append(
                f"#{cid} [parent: {info['parent']}] ({info['size']} KW, vol={info['volume']:,}): "
                f"{', '.join(info['kw'])}"
            )

        prompt = (
            "Tu es un expert SEO. Pour chaque sous-cluster, donne un label court (2-4 mots, francais) "
            "qui resume le sous-theme semantique. Le label doit etre PLUS SPECIFIQUE que le parent.\n\n"
            "Reponds en JSON: {\"labels\": {\"<id>\": \"label\", ...}}\n\n"
            + "\n".join(parts)
        )

        resp = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        try:
            data = json.loads(resp.choices[0].message.content)
            batch_labels = data.get("labels", data)
            for k, v in batch_labels.items():
                try:
                    cid_parsed = int(k)
                except ValueError:
                    continue  # Skip malformed keys like "200-1"
                all_labels[cid_parsed] = v if isinstance(v, str) else str(v)
        except (json.JSONDecodeError, KeyError):
            for cid in batch_ids:
                all_labels[cid] = child_info[cid]["kw"][0] if child_info[cid]["kw"] else "?"

        print(f"    {min(i+batch_size, len(child_ids))}/{len(child_ids)}")

    # Fill any missing labels with top keyword
    for cid in child_ids:
        if cid not in all_labels:
            all_labels[cid] = child_info[cid]["kw"][0] if child_info[cid]["kw"] else "?"

    print(f"  Done en {time.time()-t0:.1f}s")
    return all_labels


# ================================================================
# MAIN
# ================================================================

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/data", exist_ok=True)

    print("=" * 60)
    print("  EXPERT-COMPTABLE — Clustering L1→L4 (Embed+UMAP+HDBSCAN+LLM)")
    print("=" * 60)

    df = pd.read_csv(MASTER_CSV, low_memory=False)
    df = df.drop_duplicates(subset="query").reset_index(drop=True)
    queries = df["query"].tolist()
    print(f"\n  {len(queries)} queries uniques, volume total: {df['Volume_Y'].sum():,.0f}")

    # --- Step 1: Embeddings ---
    print(f"\n{'='*60}\n  STEP 1 — Embeddings OpenAI\n{'='*60}")
    embeddings = embed_keywords(queries)

    # --- Step 2: UMAP ---
    print(f"\n{'='*60}\n  STEP 2 — UMAP reduction\n{'='*60}")
    reduced = reduce_umap(embeddings)

    # --- Step 3: HDBSCAN ---
    print(f"\n{'='*60}\n  STEP 3 — HDBSCAN clustering\n{'='*60}")
    df["cluster"], clusterer = cluster_hdbscan(reduced)

    # --- Step 4: Reassigner noise ---
    print(f"\n{'='*60}\n  STEP 4 — Reassignment bruit\n{'='*60}")
    df = assign_noise(df, reduced, "cluster")

    # --- Step 5: Labels L2 via LLM (with cache) ---
    print(f"\n{'='*60}\n  STEP 5 — Labelling L2 (LLM)\n{'='*60}")
    l2_cache = f"{OUTPUT_DIR}/data/clusters_l2_cache.json"
    if os.path.exists(l2_cache):
        with open(l2_cache, "r", encoding="utf-8") as f:
            cluster_labels = {int(k): v for k, v in json.load(f).items()}
        print(f"  Cache hit: {l2_cache} ({len(cluster_labels)} labels)")
    else:
        cluster_labels = label_clusters_llm(df, "cluster")
        with open(l2_cache, "w", encoding="utf-8") as f:
            json.dump({str(k): v for k, v in cluster_labels.items()}, f, ensure_ascii=False, indent=2)
    df["L2"] = df["cluster"].map(lambda c: cluster_labels.get(c, {}).get("label", "?"))
    df["L1"] = df["cluster"].map(lambda c: cluster_labels.get(c, {}).get("L1", "Autre"))

    # Save intermediate L1/L2 taxonomy
    l1_taxonomy = {}
    for _, row in df.iterrows():
        l1, l2 = row["L1"], row["L2"]
        if l1 not in l1_taxonomy:
            l1_taxonomy[l1] = {"n_kw": 0, "volume": 0, "topics": {}}
        l1_taxonomy[l1]["n_kw"] += 1
        l1_taxonomy[l1]["volume"] += row["Volume_Y"]
        if l2 not in l1_taxonomy[l1]["topics"]:
            l1_taxonomy[l1]["topics"][l2] = {"n": 0, "vol": 0}
        l1_taxonomy[l1]["topics"][l2]["n"] += 1
        l1_taxonomy[l1]["topics"][l2]["vol"] += row["Volume_Y"]

    for v in l1_taxonomy.values():
        v["volume"] = int(v["volume"])
        for t in v["topics"].values():
            t["vol"] = int(t["vol"])

    with open(f"{OUTPUT_DIR}/data/taxonomy_l1.json", "w", encoding="utf-8") as f:
        json.dump(l1_taxonomy, f, ensure_ascii=False, indent=2)

    # --- Step 6: Sub-cluster L2 → L3 ---
    print(f"\n{'='*60}\n  STEP 6 — Sub-clustering L2 → L3\n{'='*60}")
    df, l3_to_l2 = subcluster(df, embeddings, "cluster", "l3_cluster",
                               min_for_split=20, min_per_sub=50, max_k=12)

    # --- Step 7: Sub-cluster L3 → L4 ---
    print(f"\n{'='*60}\n  STEP 7 — Sub-clustering L3 → L4\n{'='*60}")
    df, l4_to_l3 = subcluster(df, embeddings, "l3_cluster", "l4_cluster",
                               min_for_split=12, min_per_sub=15, max_k=8)

    # --- Step 8: Label L3 via LLM ---
    print(f"\n{'='*60}\n  STEP 8 — Labelling L3 (LLM)\n{'='*60}")
    l3_labels = label_subclusters_llm(df, "l3_cluster", l3_to_l2, cluster_labels)
    df["L3"] = df["l3_cluster"].map(l3_labels)

    # --- Step 9: Label L4 (top keyword par volume) ---
    print(f"\n{'='*60}\n  STEP 9 — Labelling L4 (top KW)\n{'='*60}")
    l4_labels = {}
    for l4_id in sorted(df["l4_cluster"].unique()):
        mask = df["l4_cluster"] == l4_id
        l4_labels[l4_id] = df.loc[mask].nlargest(1, "Volume_Y")["query"].iloc[0]
    df["L4"] = df["l4_cluster"].map(l4_labels)
    print(f"  {len(l4_labels)} L4 labels (top keyword)")

    # --- Build tree ---
    print(f"\n{'='*60}\n  ARBORESCENCE L1 → L4\n{'='*60}")

    tree = {}
    for _, row in df.iterrows():
        l1, l2, l3, l4 = row["L1"], row["L2"], row["L3"], row["L4"]
        vol = row["Volume_Y"]

        if l1 not in tree:
            tree[l1] = {"vol": 0, "n": 0, "children": {}}
        tree[l1]["vol"] += vol
        tree[l1]["n"] += 1

        if l2 not in tree[l1]["children"]:
            tree[l1]["children"][l2] = {"vol": 0, "n": 0, "children": {}}
        tree[l1]["children"][l2]["vol"] += vol
        tree[l1]["children"][l2]["n"] += 1

        if l3 not in tree[l1]["children"][l2]["children"]:
            tree[l1]["children"][l2]["children"][l3] = {"vol": 0, "n": 0, "children": {}}
        tree[l1]["children"][l2]["children"][l3]["vol"] += vol
        tree[l1]["children"][l2]["children"][l3]["n"] += 1

        if l4 not in tree[l1]["children"][l2]["children"][l3]["children"]:
            tree[l1]["children"][l2]["children"][l3]["children"][l4] = {"vol": 0, "n": 0}
        tree[l1]["children"][l2]["children"][l3]["children"][l4]["vol"] += vol
        tree[l1]["children"][l2]["children"][l3]["children"][l4]["n"] += 1

    # Convert volumes to int
    def intify(node):
        node["vol"] = int(node["vol"])
        for child in node.get("children", {}).values():
            intify(child)
    for v in tree.values():
        intify(v)

    # Print tree (top 5 L4 per L3)
    for l1, l1d in sorted(tree.items(), key=lambda x: -x[1]["vol"]):
        print(f"\n  {l1} ({l1d['n']:,} KW | {l1d['vol']:,} vol)")
        l2_items = sorted(l1d["children"].items(), key=lambda x: -x[1]["vol"])
        for i2, (l2, l2d) in enumerate(l2_items):
            l2_pre = "├──" if i2 < len(l2_items) - 1 else "└──"
            l2_bar = "│  " if i2 < len(l2_items) - 1 else "   "
            print(f"    {l2_pre} {l2} ({l2d['n']:,} | {l2d['vol']:,})")
            l3_items = sorted(l2d["children"].items(), key=lambda x: -x[1]["vol"])
            for i3, (l3, l3d) in enumerate(l3_items):
                l3_pre = "├──" if i3 < len(l3_items) - 1 else "└──"
                l3_bar = "│  " if i3 < len(l3_items) - 1 else "   "
                print(f"    {l2_bar} {l3_pre} {l3} ({l3d['n']:,} | {l3d['vol']:,})")
                l4_items = sorted(l3d["children"].items(), key=lambda x: -x[1]["vol"])
                for i4, (l4, l4d) in enumerate(l4_items[:5]):
                    l4_pre = "├──" if i4 < min(len(l4_items), 5) - 1 else "└──"
                    print(f"    {l2_bar} {l3_bar} {l4_pre} {l4} ({l4d['n']} | {l4d['vol']:,})")
                if len(l4_items) > 5:
                    print(f"    {l2_bar} {l3_bar}     ... +{len(l4_items)-5} L4")

    # --- Save ---
    out_csv = f"{OUTPUT_DIR}/AO_expert_comptable_clustered.csv"
    df.to_csv(out_csv, index=False)

    with open(f"{OUTPUT_DIR}/data/clusters.json", "w", encoding="utf-8") as f:
        json.dump({str(k): v for k, v in cluster_labels.items()}, f, ensure_ascii=False, indent=2)

    with open(f"{OUTPUT_DIR}/data/taxonomy_tree.json", "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)

    n_l1 = len(tree)
    n_l2 = sum(len(v["children"]) for v in tree.values())
    n_l3 = sum(len(l2d["children"]) for v in tree.values() for l2d in v["children"].values())
    n_l4 = sum(
        len(l3d["children"])
        for v in tree.values()
        for l2d in v["children"].values()
        for l3d in l2d["children"].values()
    )

    print(f"\n  Saved: {out_csv}")
    print(f"  Tree: {OUTPUT_DIR}/data/taxonomy_tree.json")
    print(f"  Niveaux: {n_l1} L1 → {n_l2} L2 → {n_l3} L3 → {n_l4} L4")


if __name__ == "__main__":
    main()
