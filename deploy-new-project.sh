#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# deploy-new-project.sh
# Generic script to:
#   1. Init a git repo (if needed)
#   2. Create a GitHub repo via gh CLI
#   3. Push to origin
#   4. Create & deploy a Vercel project linked to the git repo
#
# Usage:
#   ./deploy-new-project.sh /path/to/project [repo-name] [--private]
#
# Requirements: git, gh (authenticated), vercel (authenticated)
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ---------- Args ----------
PROJECT_DIR="${1:?Usage: $0 /path/to/project [repo-name] [--private]}"
REPO_NAME="${2:-$(basename "$PROJECT_DIR")}"
VISIBILITY="public"
[[ "${3:-}" == "--private" ]] && VISIBILITY="private"

# Resolve to absolute path
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"

echo ""
echo "========================================="
echo "  Project:    $PROJECT_DIR"
echo "  Repo name:  $REPO_NAME"
echo "  Visibility: $VISIBILITY"
echo "========================================="
echo ""

# ---------- Pre-flight checks ----------
command -v git    >/dev/null 2>&1 || error "git is not installed"
command -v gh     >/dev/null 2>&1 || error "gh CLI is not installed (brew install gh)"
command -v vercel >/dev/null 2>&1 || error "Vercel CLI is not installed (npm i -g vercel)"

gh auth status >/dev/null 2>&1 || error "gh is not authenticated. Run: gh auth login"
echo ""

# ---------- Step 1: Git init ----------
cd "$PROJECT_DIR"

if [ -d .git ]; then
    log "Git repo already initialized"
else
    git init
    log "Git repo initialized"
fi

# Ensure there's at least one commit
if ! git rev-parse HEAD >/dev/null 2>&1; then
    # Create .gitignore if missing
    if [ ! -f .gitignore ]; then
        cat > .gitignore <<'GITIGNORE'
node_modules/
.env
.env.local
.vercel/
.next/
dist/
build/
GITIGNORE
        warn "Created default .gitignore"
    fi
    git add -A
    git commit -m "Initial commit"
    log "Created initial commit"
else
    log "Existing commits found"
fi

# Ensure we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    git branch -M main
    log "Renamed branch to main"
fi

# ---------- Step 2: Create GitHub repo ----------
GH_USER=$(gh api user --jq '.login')
REMOTE_URL="https://github.com/${GH_USER}/${REPO_NAME}.git"

# Check if remote repo already exists
if gh repo view "${GH_USER}/${REPO_NAME}" >/dev/null 2>&1; then
    warn "GitHub repo ${GH_USER}/${REPO_NAME} already exists — skipping creation"
else
    gh repo create "$REPO_NAME" --"$VISIBILITY" --source=. --remote=origin
    log "GitHub repo created: ${GH_USER}/${REPO_NAME}"
fi

# ---------- Step 3: Push to origin ----------
# Ensure origin remote is set
if git remote get-url origin >/dev/null 2>&1; then
    EXISTING_REMOTE=$(git remote get-url origin)
    if [ "$EXISTING_REMOTE" != "$REMOTE_URL" ]; then
        git remote set-url origin "$REMOTE_URL"
        warn "Updated origin remote to $REMOTE_URL"
    fi
else
    git remote add origin "$REMOTE_URL"
fi

git push -u origin main
log "Pushed to origin/main"

# ---------- Step 4: Create Vercel project & deploy ----------
echo ""
echo "--- Vercel Setup ---"

if [ -d .vercel ]; then
    warn ".vercel/ directory exists — project may already be linked"
    read -rp "Re-link Vercel project? [y/N] " RELINK
    if [[ "$RELINK" =~ ^[Yy]$ ]]; then
        rm -rf .vercel
    else
        log "Keeping existing Vercel link"
    fi
fi

if [ ! -d .vercel ]; then
    # Link or create a new Vercel project
    vercel link --yes
    log "Vercel project linked"
fi

# Connect Vercel to the GitHub repo
vercel git connect --yes 2>/dev/null || warn "vercel git connect not available — link manually in Vercel dashboard"

# Deploy
echo ""
read -rp "Deploy to production now? [Y/n] " DEPLOY_PROD
if [[ ! "$DEPLOY_PROD" =~ ^[Nn]$ ]]; then
    vercel --prod --yes
    log "Deployed to production"
else
    vercel --yes
    log "Preview deployment created"
fi

# ---------- Summary ----------
echo ""
echo "========================================="
echo -e "${GREEN}  All done!${NC}"
echo ""
echo "  GitHub:  https://github.com/${GH_USER}/${REPO_NAME}"
echo "  Vercel:  Check vercel.com/dashboard for your project"
echo "========================================="
