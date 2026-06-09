#!/usr/bin/env bash
# audit_v2_kpis.sh — Wave 5 V2 audit of 10 target KPIs across 11 re-generated slugs
# Outputs PASS/FAIL per KPI with measured value vs target.

set -uo pipefail

REPO_ROOT="/Users/nicolas/PBN_AUTO/COMPTABLE/numeris"
ARKEE_SECTIONS="/Users/nicolas/ARKEE_ORG/CLIENTS/keobiz/satellites/numeris/outputs/content/pipeline/sections"
HTML_BASE="$REPO_ROOT/.next/server/app"
DB="$REPO_ROOT/numeris.db"

# 11 slugs: {route}/{slug}
SLUGS=(
  "professions/medecins"
  "professions/boulangers"
  "professions/avocats"
  "professions/startups"
  "professions/e-commercants"
  "professions/loueurs-en-meuble-lmnp-lmp"
  "professions/restaurateurs-traditionnels"
  "professions/infirmiers-liberaux"
  "secteurs/immobilier"
  "secteurs/start-up"
  "ressources/recherche-expert-comptable"
)

echo "=================================================================="
echo "Wave 5 V2 Audit — 10 KPIs over 11 slugs"
echo "Run timestamp: $(date)"
echo "=================================================================="

# --------------------------------------------------------------------
# KPI 1 — Similarity Jaccard inter-pages
# --------------------------------------------------------------------
echo ""
echo "--- KPI 1: Jaccard similarity inter-pages (target <0.25 max) ---"
python3 <<'PY'
import json, os, re
from itertools import combinations

base = "/Users/nicolas/ARKEE_ORG/CLIENTS/keobiz/satellites/numeris/outputs/content/pipeline/sections"
slugs = [
    ("professions","medecins"), ("professions","boulangers"), ("professions","avocats"),
    ("professions","startups"), ("professions","e-commercants"),
    ("professions","loueurs-en-meuble-lmnp-lmp"),
    ("professions","restaurateurs-traditionnels"), ("professions","infirmiers-liberaux"),
    ("secteurs","immobilier"), ("secteurs","start-up"),
    ("ressources","recherche-expert-comptable"),
]

def tokenize(text):
    text = re.sub(r"[^a-zA-Z0-9àâäéèêëïîôöùûüç']+", " ", text.lower())
    toks = text.split()
    # remove short stop-equivalents
    return {t for t in toks if len(t) >= 4}

def extract_body(d):
    parts = [d.get("intro","")]
    for s in d.get("sections", []):
        parts.append(s.get("title",""))
        parts.append(s.get("body",""))
        for it in s.get("items", []) or []:
            if isinstance(it, dict):
                parts.append(it.get("title",""))
                parts.append(it.get("description",""))
                parts.append(it.get("body",""))
                parts.append(it.get("question",""))
                parts.append(it.get("answer",""))
            elif isinstance(it, str):
                parts.append(it)
    return " ".join(parts)

bags = {}
for route, slug in slugs:
    p = os.path.join(base, route, f"{slug}.sections.json")
    d = json.load(open(p))
    bags[f"{route}/{slug}"] = tokenize(extract_body(d))

scores = []
for (a, ba), (b, bb) in combinations(bags.items(), 2):
    inter = len(ba & bb); uni = len(ba | bb)
    j = inter/uni if uni else 0.0
    scores.append((j, a, b))

scores.sort(reverse=True)
mx = scores[0][0]; md = sorted(s[0] for s in scores)[len(scores)//2]
verdict = "PASS" if mx < 0.25 else "FAIL"
print(f"KPI 1 Jaccard: max={mx:.4f} median={md:.4f} {verdict} (cible max <0.25)")
print(f"  top-3 pairs:")
for j,a,b in scores[:3]:
    print(f"    {j:.4f}  {a}  vs  {b}")
PY

# --------------------------------------------------------------------
# KPI 2 — Person schema
# --------------------------------------------------------------------
echo ""
echo "--- KPI 2: Person schema emitted (target 11/11) ---"
person_count=0
for s in "${SLUGS[@]}"; do
  f="$HTML_BASE/$s.html"
  if [ -f "$f" ] && grep -qE '"@type":\s*"Person"' "$f"; then
    person_count=$((person_count+1))
  fi
done
verdict=$([ "$person_count" -eq 11 ] && echo "PASS" || echo "FAIL")
echo "KPI 2 Person: $person_count/11 $verdict (cible 11/11)"

# --------------------------------------------------------------------
# KPI 3 — FAQPage schema
# --------------------------------------------------------------------
echo ""
echo "--- KPI 3: FAQPage schema emitted (target 11/11) ---"
faq_count=0
for s in "${SLUGS[@]}"; do
  f="$HTML_BASE/$s.html"
  if [ -f "$f" ] && grep -qE '"@type":\s*"FAQPage"' "$f"; then
    faq_count=$((faq_count+1))
  fi
done
verdict=$([ "$faq_count" -eq 11 ] && echo "PASS" || echo "FAIL")
echo "KPI 3 FAQPage: $faq_count/11 $verdict (cible 11/11)"

# --------------------------------------------------------------------
# KPI 4 — Article schema (10/11, only professions+secteurs+ressources)
# --------------------------------------------------------------------
echo ""
echo "--- KPI 4: Article schema emitted (target 10/11+) ---"
article_count=0
for s in "${SLUGS[@]}"; do
  f="$HTML_BASE/$s.html"
  if [ -f "$f" ] && grep -qE '"@type":\s*"Article"' "$f"; then
    article_count=$((article_count+1))
  fi
done
verdict=$([ "$article_count" -ge 10 ] && echo "PASS" || echo "FAIL")
echo "KPI 4 Article: $article_count/11 $verdict (cible >=10/11)"

# --------------------------------------------------------------------
# KPI 5 — CTAs structurels per page (target >=4)
# --------------------------------------------------------------------
echo ""
echo "--- KPI 5: CTAs structurels per page (target >=4) ---"
cta_pass=0
echo "  per-page detail:"
for s in "${SLUGS[@]}"; do
  f="$HTML_BASE/$s.html"
  if [ ! -f "$f" ]; then echo "  $s: MISSING"; continue; fi
  contact=$(grep -oE 'href="/contact"' "$f" | wc -l | tr -d ' ')
  tel=$(grep -oE 'href="tel:' "$f" | wc -l | tr -d ' ')
  sticky=$(grep -ciE 'StickyMobileCTA|sticky-mobile|sticky_mobile' "$f" || true)
  total=$((contact + tel + sticky))
  echo "    $s: contact=$contact tel=$tel sticky=$sticky -> total=$total"
  if [ "$total" -ge 4 ]; then cta_pass=$((cta_pass+1)); fi
done
verdict=$([ "$cta_pass" -eq 11 ] && echo "PASS" || echo "FAIL")
echo "KPI 5 CTAs >=4 per page: $cta_pass/11 pages $verdict (cible 11/11)"

# --------------------------------------------------------------------
# KPI 6 — Mention "Hélène" per page (target >=1)
# --------------------------------------------------------------------
echo ""
echo "--- KPI 6: 'Hélène' mention per page (target >=1) ---"
helene_pass=0
for s in "${SLUGS[@]}"; do
  f="$HTML_BASE/$s.html"
  if [ ! -f "$f" ]; then continue; fi
  hits=$(grep -ciE 'hélène|helene' "$f" || true)
  if [ "$hits" -ge 1 ]; then helene_pass=$((helene_pass+1)); fi
  echo "    $s: $hits hits"
done
verdict=$([ "$helene_pass" -eq 11 ] && echo "PASS" || echo "FAIL")
echo "KPI 6 Hélène >=1: $helene_pass/11 pages $verdict (cible 11/11)"

# --------------------------------------------------------------------
# KPI 7 — Word count body (target 1500-2500)
# --------------------------------------------------------------------
echo ""
echo "--- KPI 7: Word count per page body (target 1500-2500) ---"
python3 <<'PY'
import re, os
slugs = [
    "professions/medecins","professions/boulangers","professions/avocats",
    "professions/startups","professions/e-commercants",
    "professions/loueurs-en-meuble-lmnp-lmp",
    "professions/restaurateurs-traditionnels","professions/infirmiers-liberaux",
    "secteurs/immobilier","secteurs/start-up",
    "ressources/recherche-expert-comptable",
]
base = "/Users/nicolas/PBN_AUTO/COMPTABLE/numeris/.next/server/app"
ok = 0
counts = []
for s in slugs:
    p = os.path.join(base, f"{s}.html")
    if not os.path.exists(p):
        print(f"    {s}: MISSING"); continue
    html = open(p, encoding="utf-8", errors="ignore").read()
    # extract body
    m = re.search(r"<body[^>]*>(.*?)</body>", html, re.DOTALL|re.IGNORECASE)
    body_html = m.group(1) if m else html
    # strip scripts/styles
    body_html = re.sub(r"<script.*?</script>", " ", body_html, flags=re.DOTALL|re.IGNORECASE)
    body_html = re.sub(r"<style.*?</style>", " ", body_html, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", body_html)
    text = re.sub(r"\s+", " ", text)
    words = [w for w in text.split() if any(c.isalpha() for c in w)]
    n = len(words)
    counts.append((s, n))
    status = "OK" if 1500 <= n <= 2500 else "OUT"
    print(f"    {s}: {n} words [{status}]")
    if 1500 <= n <= 2500:
        ok += 1
verdict = "PASS" if ok == 11 else ("PARTIAL" if ok >= 8 else "FAIL")
print(f"KPI 7 words 1500-2500: {ok}/11 pages {verdict} (cible 11/11)")
PY

# --------------------------------------------------------------------
# KPI 8 — Stub URL Légifrance (target 0/11)
# --------------------------------------------------------------------
echo ""
echo "--- KPI 8: Stub URL Légifrance count (target 0) ---"
stub_total=0
for s in "${SLUGS[@]}"; do
  f="$HTML_BASE/$s.html"
  if [ ! -f "$f" ]; then continue; fi
  n=$(grep -coE '/stub/[0-9]+' "$f" || true)
  if [ "$n" -gt 0 ]; then
    echo "    $s: $n stub URLs"
    stub_total=$((stub_total+n))
  fi
done
verdict=$([ "$stub_total" -eq 0 ] && echo "PASS" || echo "FAIL")
echo "KPI 8 Légifrance stub URLs: $stub_total total $verdict (cible 0)"

# --------------------------------------------------------------------
# KPI 9 — dateModified real (not build timestamp)
# --------------------------------------------------------------------
echo ""
echo "--- KPI 9: dateModified réel (non-build timestamp) ---"
python3 <<'PY'
import re, os
slugs = [
    "professions/medecins","professions/boulangers","professions/avocats",
    "professions/startups","professions/e-commercants",
    "professions/loueurs-en-meuble-lmnp-lmp",
    "professions/restaurateurs-traditionnels","professions/infirmiers-liberaux",
    "secteurs/immobilier","secteurs/start-up",
    "ressources/recherche-expert-comptable",
]
base = "/Users/nicolas/PBN_AUTO/COMPTABLE/numeris/.next/server/app"
distinct_dates = set()
ok = 0
for s in slugs:
    p = os.path.join(base, f"{s}.html")
    if not os.path.exists(p): continue
    html = open(p, encoding="utf-8", errors="ignore").read()
    matches = re.findall(r'"dateModified"\s*:\s*"([^"]+)"', html)
    # pick the most precise one (longest = with timestamp)
    if not matches:
        print(f"    {s}: no dateModified")
        continue
    dt = max(matches, key=len)
    distinct_dates.add(dt)
    ok += 1
    print(f"    {s}: dateModified={dt} (all: {matches})")
# if all 11 have it AND we have >1 distinct timestamp -> real reviewed_at (not single build new Date())
verdict = "PASS" if ok == 11 and len(distinct_dates) >= 2 else ("PARTIAL" if ok == 11 else "FAIL")
print(f"KPI 9 dateModified: {ok}/11 with field, {len(distinct_dates)} distinct timestamps {verdict} (cible 11/11 distinct)")
PY

# --------------------------------------------------------------------
# KPI 10 — Variants distinct used (target >=4)
# --------------------------------------------------------------------
echo ""
echo "--- KPI 10: Variants distincts used (target >=4) ---"
python3 <<'PY'
import json, os
base = "/Users/nicolas/ARKEE_ORG/CLIENTS/keobiz/satellites/numeris/outputs/content/pipeline/sections"
slugs = [
    ("professions","medecins"), ("professions","boulangers"), ("professions","avocats"),
    ("professions","startups"), ("professions","e-commercants"),
    ("professions","loueurs-en-meuble-lmnp-lmp"),
    ("professions","restaurateurs-traditionnels"), ("professions","infirmiers-liberaux"),
    ("secteurs","immobilier"), ("secteurs","start-up"),
    ("ressources","recherche-expert-comptable"),
]
variants = {}
for route, slug in slugs:
    p = os.path.join(base, route, f"{slug}.sections.json")
    d = json.load(open(p))
    v = d.get("variant_id", "?")
    variants.setdefault(v, []).append(f"{route}/{slug}")
distinct = len(variants)
verdict = "PASS" if distinct >= 4 else "FAIL"
print(f"KPI 10 variants distincts: {distinct} {verdict} (cible >=4)")
for v in sorted(variants):
    print(f"    variant {v}: {len(variants[v])} slugs -> {', '.join(variants[v])}")
PY

echo ""
echo "=================================================================="
echo "Audit complete."
echo "=================================================================="
