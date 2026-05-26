#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Building Next.js ==="
npm run build

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
CSS_HASH=$(grep -oP '/_next/static/css/\K[a-f0-9]+(?=\.css)' .next/BUILD_ID 2>/dev/null || true)
if [ -n "$CSS_HASH" ]; then
  CSS_FILE=".next/static/css/${CSS_HASH}.css"
  if [ -f "$CSS_FILE" ]; then
    echo "✓ CSS asset found: $CSS_FILE"
  else
    echo "✗ CSS asset not found: $CSS_FILE"
    exit 1
  fi
fi

echo "=== Build and deploy complete ==="
