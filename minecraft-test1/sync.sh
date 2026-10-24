#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$DIR/.." && pwd)"
CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/mc-test1"
mkdir -p "$CACHE"

python3 "$DIR/checker/check.py" >/dev/null
cd "$REPO"

if git diff --quiet -- minecraft-test1/stats.json; then
  exit 0
fi

now=$(date +%s)
last=$(cat "$CACHE/last-push" 2>/dev/null || echo 0)
state=$(python3 -c "import json;print(int(json.load(open('minecraft-test1/stats.json'))['server']['online']))")
prev=$(cat "$CACHE/last-state" 2>/dev/null || echo "")

if [ "$state" = "$prev" ] && [ $((now - last)) -lt 900 ]; then
  exit 0
fi

git add minecraft-test1/stats.json
git commit -q -m "datos $(date -u +%FT%TZ)"
if git push -q origin HEAD; then
  echo "$now" > "$CACHE/last-push"
  echo "$state" > "$CACHE/last-state"
else
  git reset -q --soft HEAD~1
  exit 1
fi
