#!/usr/bin/env bash
# ========================================
# REMEDIATION SCRIPT — 2026-04-15 Audit
# ========================================
# Status: NO-OP (monorepo audit found ZERO offending tracked files)
# This script is retained as a TEMPLATE for future audits or re-verification.
#
# Usage:
#   bash .agent/sessions/2026-04-15-remediation.sh        # runs verification only
#   bash .agent/sessions/2026-04-15-remediation.sh --apply # would apply fixes (no-op today)
#
# Exit codes:
#   0 = SAFE (no remediation needed)
#   1 = BLOCKED (offending files found — re-run audit)

set -euo pipefail

MODE="${1:-verify}"

echo "========================================"
echo "Abyss Monorepo — Remediation Check"
echo "Audit: 2026-04-15"
echo "========================================"

cd "$(git rev-parse --show-toplevel)"

FAIL=0

check() {
  local desc="$1"; shift
  local matches
  matches=$(git ls-files | grep -E "$1" | grep -Ev "${2:-__NEVER_MATCH__}" || true)
  if [[ -n "$matches" ]]; then
    echo "❌ FAIL: $desc"
    echo "$matches" | sed 's/^/    /'
    FAIL=1
  else
    echo "✅ PASS: $desc"
  fi
}

check ".env files tracked (non-example)"    "\.env"                                         "\.env\.(.*\.)?example$"
check "key/cert files tracked"               "\.(pem|key|p12|pfx|cert|crt)$"                 "__NEVER_MATCH__"
check "node_modules tracked"                 "node_modules"                                  "__NEVER_MATCH__"
check "credential files tracked"             "(credentials\.json|service-account.*\.json|firebase-adminsdk.*\.json|google-credentials.*\.json)" "__NEVER_MATCH__"

echo "---"
echo "EXEMPTED path integrity:"
for p in ".agent/tasks/TASKS.json" "pnpm-lock.yaml" ".cursor/README.md"; do
  if git ls-files --error-unmatch "$p" >/dev/null 2>&1; then
    echo "✅ TRACKED: $p"
  else
    echo "❌ MISSING: $p"
    FAIL=1
  fi
done

echo "---"
if [[ "$FAIL" -eq 0 ]]; then
  echo "✅ CLEARANCE: SAFE TO PUSH"
  exit 0
else
  echo "❌ CLEARANCE: BLOCKED — remediate before push"
  echo ""
  echo "# --- REMEDIATION TEMPLATE (commented — edit if needed) ---"
  echo "# Example: un-track a sensitive file"
  echo "# git rm --cached path/to/offending/file"
  echo "# echo 'path/to/offending/file' >> .gitignore"
  echo "# git add .gitignore"
  echo "# git commit -m 'chore(security): un-track offending file [AUDIT-REMEDIATE]'"
  exit 1
fi
