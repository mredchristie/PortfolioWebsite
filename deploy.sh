#!/bin/bash

echo "Formatting files..."
npm run format

# Stamp local css/js references with a fresh ?v= so Cloudflare's ~4h edge cache
# for static assets can never serve stale code alongside new HTML.
STAMP=$(date +%Y%m%d%H%M)
echo "Stamping asset versions (?v=$STAMP)..."
python3 - "$STAMP" <<'PYEOF'
import glob
import re
import sys

stamp = sys.argv[1]
for f in glob.glob("*.html"):
    s = open(f).read()
    out = re.sub(
        r'((?:href|src)="assets/(?:css|js)/[a-z0-9-]+\.(?:css|js))(\?v=[^"]*)?"',
        rf'\g<1>?v={stamp}"',
        s,
    )
    if out != s:
        open(f, "w").write(out)
        print(f"  stamped {f}")
PYEOF

echo "Deploying to Cloudflare R2..."
# Exclude config, dev, and VCS files so only website content is published.
# NOTE: mc mirror does not read .gitignore. Anything that should stay off the
# public bucket has to be listed here as well, or it gets published.
# The .png/-card.jpg originals are kept in the repo as masters but superseded
# on the site by their .webp versions, so they are not published either.
# (A public .git/ directory in particular would expose your full source.)
mc mirror --overwrite \
  --exclude ".git/*" \
  --exclude ".claude/*" \
  --exclude ".img-backup/*" \
  --exclude "node_modules/*" \
  --exclude "*.DS_Store" \
  --exclude "deploy.sh" \
  --exclude "package.json" \
  --exclude "package-lock.json" \
  --exclude ".prettierrc" \
  --exclude ".prettierignore" \
  --exclude "README.md" \
  --exclude "tools/*" \
  --exclude "docs/*" \
  --exclude "assets/img/profile-ski.png" \
  --exclude "assets/img/profile-train.png" \
  --exclude "assets/img/profile.png" \
  --exclude "assets/img/profile-glasses.png" \
  --exclude "*-card.jpg" \
  --exclude ".theme-backup/*" \
  --exclude ".gitignore" \
  . r2/website

# Purge the Cloudflare cache so everything updates immediately. Needs an API
# token with Zone -> Cache Purge permission stored in ~/.config/cloudflare/purge-token.
TOKEN_FILE="$HOME/.config/cloudflare/purge-token"
if [ -f "$TOKEN_FILE" ]; then
  echo "Purging Cloudflare cache..."
  TOKEN=$(cat "$TOKEN_FILE")
  ZONE_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "https://api.cloudflare.com/client/v4/zones?name=mredchristie.dev" |
    python3 -c "import json,sys; r=json.load(sys.stdin); print(r['result'][0]['id'] if r.get('result') else '')")
  if [ -n "$ZONE_ID" ]; then
    PURGE=$(curl -s -X POST \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      --data '{"purge_everything":true}' \
      "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" |
      python3 -c "import json,sys; print('ok' if json.load(sys.stdin).get('success') else 'FAILED')")
    echo "Cache purge: $PURGE"
  else
    echo "Cache purge: could not resolve zone id (check the token's permissions)"
  fi
else
  echo "Cache purge skipped: no token at $TOKEN_FILE (asset versioning still protects css/js)"
fi

echo "Deploy complete!"
