#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ROOT/.env"
  set +a
fi

# Backend requires Java 21 (class file 65.0). Maven may compile with 21 but run with an older default JAVA_HOME.
if [ -z "${JAVA_HOME:-}" ] || ! "$JAVA_HOME/bin/java" -version 2>&1 | grep -qE 'version "21'; then
  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    JAVA_21_HOME="$(/usr/libexec/java_home -v 21 2>/dev/null || true)"
    if [ -n "$JAVA_21_HOME" ]; then
      export JAVA_HOME="$JAVA_21_HOME"
      export PATH="$JAVA_HOME/bin:$PATH"
    fi
  fi
fi

if ! java -version 2>&1 | grep -qE 'version "21'; then
  echo "ERROR: Java 21 is required. Install with: brew install openjdk@21"
  echo "Then run: export JAVA_HOME=\"\$(/usr/libexec/java_home -v 21)\""
  java -version 2>&1 || true
  exit 1
fi

# macOS + mongodb+srv:// often fails with "Unknown DNS server: fe80::...%en0" — force public DNS for Java
export MAVEN_OPTS="-Djava.net.preferIPv4Stack=true \
  -Dsun.net.spi.nameservice.provider.1=dns,sun \
  -Dsun.net.spi.nameservice.nameservers=8.8.8.8,1.1.1.1 \
  ${MAVEN_OPTS:-}"

echo "==> Java: $(java -version 2>&1 | head -1)"
echo "==> Starting backend (MongoDB: ${MONGODB_URI:+configured}${MONGODB_URI:-NOT SET - add .env})"
cd "$ROOT/backend"
mvn -Dmaven.test.skip=true spring-boot:run
