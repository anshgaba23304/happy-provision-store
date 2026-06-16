#!/bin/bash
# Quick local health check — run while backend is up on port 8081
set -e
BASE="${1:-http://localhost:8081}"

echo "Testing $BASE ..."
echo ""

echo -n "GET /api/store → "
curl -sf "$BASE/api/store" | head -c 120 && echo ""

echo -n "GET /api/orders?adminPin=*** → "
curl -sf "$BASE/api/orders?adminPin=${APP_ADMIN_PIN:-23304}" | head -c 120 && echo ""

echo -n "GET /api/analytics?adminPin=*** → "
curl -sf "$BASE/api/analytics?adminPin=${APP_ADMIN_PIN:-23304}" | head -c 200 && echo ""

echo ""
echo "All API checks passed."
