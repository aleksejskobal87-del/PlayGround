#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
PORT="${PORT:-3000}"
export PORT
STATIC_DIR="$PROJECT_DIR/dist"
export STATIC_DIR

# Keep command timing visible in the startup log for each setup/build step.
timed() { /usr/bin/time -p "$@"; }
timed mkdir -p "${OPENCODE_WEB_DIR:?}"
timed npm install --no-audit --no-fund
timed npm run build

timed node --input-type=module -e 'import { writeFileSync } from "node:fs"; const output = { project: process.argv[1], directory: process.argv[2] }; writeFileSync(process.argv[3], `${JSON.stringify(output)}\n`);' \
  "$PROJECT_DIR" "$STATIC_DIR" "$OPENCODE_WEB_DIR/deployment-output.json"
timed node server.js
