#!/usr/bin/env bash
# Bootstrap all three automated submission steps in one shot.
# Manuel ASC clicks (age rating, App Privacy, Review Notes) için
# APP_REVIEW_ANSWERS.md dosyasındaki kopyala-yapıştır blokları kullan.
#
# USAGE:
#   cd mobile
#   ./scripts/run_all_setup.sh
#
# REQUIREMENTS:
# - mobile/credentials/AuthKey_CV8FXZNAR8.p8 (App Store Connect API key, .p8)
# - mobile/.env.local with REVENUECAT_V2_SECRET=sk_...
# - SUPABASE_PROJECT_REF env var (e.g. wihkcmgtzmdupxuyavyr)
# - supabase CLI installed and logged in (`supabase login`)
# - python3 with: pip install pyjwt cryptography requests
set -euo pipefail

cd "$(dirname "$0")/.."

GREEN='\033[0;32m'
RED='\033[0;31m'
YEL='\033[0;33m'
NC='\033[0m'

step() { echo -e "\n${GREEN}=== $1 ===${NC}"; }
warn() { echo -e "${YEL}⚠ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }

# ─── Pre-flight checks ──────────────────────────────────────────────────────
step "0. Pre-flight"

[[ -f credentials/AuthKey_CV8FXZNAR8.p8 ]] \
  || fail "credentials/AuthKey_CV8FXZNAR8.p8 missing. Download from App Store Connect → Users and Access → Integrations → Keys."

[[ -f .env.local ]] \
  || fail ".env.local missing. Add REVENUECAT_V2_SECRET=sk_... (from RevenueCat Dashboard → Project Settings → API keys → V2 Secret)."

grep -q '^REVENUECAT_V2_SECRET=' .env.local \
  || fail "REVENUECAT_V2_SECRET not found in .env.local"

command -v python3 >/dev/null \
  || fail "python3 not found"

command -v supabase >/dev/null \
  || fail "supabase CLI not found. Install: npm i -g supabase"

[[ -n "${SUPABASE_PROJECT_REF:-}" ]] \
  || fail "Set SUPABASE_PROJECT_REF env var (e.g. export SUPABASE_PROJECT_REF=wihkcmgtzmdupxuyavyr)"

echo "  ✓ All pre-flight checks passed"

# ─── 1. App Store Connect: subscriptions + intro offers ──────────────────
step "1. App Store Connect — create yearly + intro offers + localizations"

python3 -c "import jwt, requests" 2>/dev/null \
  || pip3 install --user pyjwt cryptography requests >/dev/null

python3 scripts/configure_asc.py || warn "configure_asc.py reported issues — review the log above"

# ─── 2. App Store Connect: pricing ───────────────────────────────────────
step "2. App Store Connect — set pricing"

if [[ -f scripts/set_asc_pricing.py ]]; then
  python3 scripts/set_asc_pricing.py || warn "set_asc_pricing.py reported issues"
else
  warn "scripts/set_asc_pricing.py not found, skipping"
fi

# ─── 3. RevenueCat: entitlement + offering + packages ────────────────────
step "3. RevenueCat — entitlement + offering + packages"

python3 scripts/configure_revenuecat.py \
  || warn "configure_revenuecat.py reported issues. Most likely: products not yet imported from ASC. Wait 15-30 min after pricing is set, then re-run this script."

# ─── 4. Supabase: deploy delete-user Edge Function (5.1.1(v)) ────────────
step "4. Supabase — deploy delete-user Edge Function"

supabase link --project-ref "$SUPABASE_PROJECT_REF" 2>/dev/null || true

# --no-verify-jwt: function manually verifies JWT inside index.ts
supabase functions deploy delete-user \
  --no-verify-jwt \
  --project-ref "$SUPABASE_PROJECT_REF" \
  || fail "Edge Function deploy failed"

echo
warn "Don't forget: in Supabase dashboard → Edge Functions → delete-user → Settings,"
warn "set the SUPABASE_SERVICE_ROLE_KEY secret (Project Settings → API → service_role)."

# ─── 5. Verification ─────────────────────────────────────────────────────
step "5. Verify"

python3 scripts/verify_asc.py || warn "verify_asc.py reported issues"

echo
echo -e "${GREEN}=== Automated setup complete ===${NC}"
echo
echo "Şimdi MANUEL adımlar (kopyala-yapıştır):"
echo "  1) ASC → Age Rating → APP_REVIEW_ANSWERS.md §1"
echo "  2) ASC → App Privacy → APP_REVIEW_ANSWERS.md §2"
echo "  3) ASC → App Review Information → APP_REVIEW_ANSWERS.md §3"
echo "  4) Supabase SQL Editor → demo account oluştur (APP_REVIEW_ANSWERS.md §7)"
echo "  5) ASC → Versions → +Build (v1.0.10 b24) → Submit for Review"
echo
echo "Tüm hard-blocker checkbox'lar: SUBMISSION_GO_NO_GO.md"
