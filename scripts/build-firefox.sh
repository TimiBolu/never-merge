#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist/firefox"
ZIP_PATH="$ROOT_DIR/../never-merge-firefox.zip"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/assets"

cp "$ROOT_DIR/manifest.firefox.json" "$DIST_DIR/manifest.json"
cp "$ROOT_DIR/content.js" "$DIST_DIR/"
cp "$ROOT_DIR/options.html" "$DIST_DIR/"
cp "$ROOT_DIR/options.css" "$DIST_DIR/"
cp "$ROOT_DIR/options.js" "$DIST_DIR/"
cp "$ROOT_DIR/popup.html" "$DIST_DIR/"
cp "$ROOT_DIR/popup.css" "$DIST_DIR/"
cp "$ROOT_DIR/popup.js" "$DIST_DIR/"
cp "$ROOT_DIR/assets/icon-16.png" "$DIST_DIR/assets/"
cp "$ROOT_DIR/assets/icon-32.png" "$DIST_DIR/assets/"
cp "$ROOT_DIR/assets/icon-48.png" "$DIST_DIR/assets/"
cp "$ROOT_DIR/assets/icon-128.png" "$DIST_DIR/assets/"

rm -f "$ZIP_PATH"
(
  cd "$DIST_DIR"
  zip -X -r "$ZIP_PATH" .
)

echo "$ZIP_PATH"
