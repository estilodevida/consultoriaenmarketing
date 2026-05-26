#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Building Next.js ==="
npm run build

echo "=== Copying static files to standalone ==="
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
echo "✓ Static files copied to standalone"

echo "=== Restarting PM2 process ==="
pm2 restart consultoriaenmarketing

echo "=== Waiting for server to be ready ==="
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:3199/ > /dev/null 2>&1; then
    echo "✓ Server ready on port 3199"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "✗ Server did not start within 30s"
    exit 1
  fi
  sleep 1
done

echo "=== Verifying static assets ==="
CSS_HASH=$(find .next/static/css -name '*.css' -type f -exec basename {} \; | sed 's/\.css$//' | head -1)
if [ -n "$CSS_HASH" ]; then
  CSS_FILE_STANDALONE=".next/standalone/.next/static/css/${CSS_HASH}.css"
  CSS_FILE_MAIN=".next/static/css/${CSS_HASH}.css"
  if [ -f "$CSS_FILE_STANDALONE" ]; then
    echo "✓ CSS asset in standalone: $CSS_FILE_STANDALONE"
  else
    echo "✗ CSS asset not found in standalone: $CSS_FILE_STANDALONE"
    exit 1
  fi
  if [ -f "$CSS_FILE_MAIN" ]; then
    echo "✓ CSS asset in main build: $CSS_FILE_MAIN"
  fi
fi

echo "=== Build and deploy complete ==="
