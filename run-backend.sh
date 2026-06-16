#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ROOT/.env"
  set +a
fi

export MAVEN_OPTS="-Djava.net.preferIPv4Stack=true ${MAVEN_OPTS:-}"

echo "==> Starting backend (MongoDB: ${MONGODB_URI:+configured}${MONGODB_URI:-NOT SET - add .env})"
cd "$ROOT/backend"
mvn -Dmaven.test.skip=true spring-boot:run
