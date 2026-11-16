#!/bin/sh
# Builds the web app and makes the output available as ./dist relative to
# wherever Vercel started (repo root or apps/web), so any Output Directory
# setting ("dist" or "apps/web/dist") resolves.
set -e
START="$(pwd)"
[ -d packages/shared ] || cd ../..
ROOT="$(pwd)"
npm run build -w @sicoin/shared
npm run build -w @sicoin/web
OUT="$ROOT/apps/web/dist"
for d in "$START/dist" "$ROOT/dist"; do
  if [ "$d" != "$OUT" ]; then
    rm -rf "$d"
    cp -r "$OUT" "$d"
  fi
done
