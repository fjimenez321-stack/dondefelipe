#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/mc-test1"
DATOS="$CACHE/datos"
mkdir -p "$DATOS"

python3 "$DIR/checker/check.py" >/dev/null
cp "$DIR/stats.json" "$DATOS/stats.json"

cd "$DATOS"
git add stats.json
if git diff --cached --quiet; then
  exit 0
fi

now=$(date +%s)
last=$(cat "$CACHE/last-push" 2>/dev/null || echo 0)
if [ $((now - last)) -lt 120 ]; then
  exit 0
fi

git -c user.name=Adriyache32 -c user.email=adriyache32@users.noreply.github.com \
    commit -q --amend -m "datos $(date -u +%FT%TZ)"
if git push -q -f origin datos; then
  echo "$now" > "$CACHE/last-push"
fi
