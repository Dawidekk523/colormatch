#!/usr/bin/env bash
# Verify, migrate and deploy to Cloudflare Pages production from this machine.
set -euo pipefail
cd "$(dirname "$0")/.."

# Wrangler reads these; on the PC they come from ~/.config/claude/env.
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ -f "$HOME/.config/claude/env" ]; then
  CLOUDFLARE_API_TOKEN=$(sed -n 's/^CF_API_TOKEN=//p' "$HOME/.config/claude/env" | tr -d '\r')
  CLOUDFLARE_ACCOUNT_ID=$(sed -n 's/^CF_ACCOUNT_ID=//p' "$HOME/.config/claude/env" | tr -d '\r')
  export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
fi
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is not set}"

# Production must match a commit, so a dirty tree is refused.
if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes: commit them before deploying." >&2
  exit 1
fi

npm run lint
npm run typecheck
npm test
npm run build
npm run functions:build
# Applies only migrations the remote database has not recorded; all are additive.
npx wrangler d1 migrations apply DB --remote
npx wrangler pages deploy dist --project-name colormatch --branch main --commit-hash "$(git rev-parse HEAD)"
