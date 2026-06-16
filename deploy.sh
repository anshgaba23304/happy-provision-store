#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Building frontend..."
cd "$ROOT/frontend"
npm install
npm run build

echo "==> Copying frontend into backend static folder..."
rm -rf "$ROOT/backend/src/main/resources/static"
mkdir -p "$ROOT/backend/src/main/resources/static"
cp -r dist/* "$ROOT/backend/src/main/resources/static/"

echo "==> Building backend JAR..."
cd "$ROOT/backend"
mvn clean package -Dmaven.test.skip=true

echo ""
echo "==> Done! Run the website with:"
echo "    cd backend && java -jar target/store-1.0.0.jar"
echo ""
echo "    Open http://localhost:8081"
