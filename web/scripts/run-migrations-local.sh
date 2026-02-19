#!/bin/bash
# Simple script to run migrations locally with Cloud SQL Proxy
# This script handles the proxy setup and connection string properly

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="${SCRIPT_DIR}/.."
PROJECT_ID="${GCP_PROJECT_ID:-kn-dev-01}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
REGION="${REGION:-us-central1}"
PROXY_PORT="${PROXY_PORT:-5432}"

cd "${WEB_DIR}"

echo "🔄 Running database migrations locally for ${PROJECT_ID} (${ENVIRONMENT})..."
echo ""

# Step 1: Get DATABASE_URL from Secret Manager
echo "📥 Fetching DATABASE_URL from Secret Manager..."
ORIGINAL_DATABASE_URL=$(gcloud secrets versions access latest --secret=database-url --project="${PROJECT_ID}")

if [[ -z "${ORIGINAL_DATABASE_URL}" ]]; then
  echo "❌ Failed to fetch DATABASE_URL"
  exit 1
fi

# Step 2: Check if Cloud SQL Proxy is running
CONNECTION_NAME="${PROJECT_ID}:${REGION}:ai-governance-db-${ENVIRONMENT}"
PROXY_RUNNING=false

if nc -z localhost "${PROXY_PORT}" 2>/dev/null; then
  echo "✅ Cloud SQL Proxy already running on port ${PROXY_PORT}"
  PROXY_RUNNING=true
else
  echo "🚀 Starting Cloud SQL Proxy..."
  
  # Check if cloud-sql-proxy is installed
  if ! command -v cloud-sql-proxy &> /dev/null; then
    echo "❌ cloud-sql-proxy not found. Install it with:"
    echo "   brew install cloud-sql-proxy"
    exit 1
  fi
  
  # Start proxy in background
  cloud-sql-proxy "${CONNECTION_NAME}" --port="${PROXY_PORT}" > /tmp/cloud-sql-proxy.log 2>&1 &
  PROXY_PID=$!
  
  # Wait for proxy to be ready
  echo "⏳ Waiting for Cloud SQL Proxy to connect..."
  for i in {1..30}; do
    if nc -z localhost "${PROXY_PORT}" 2>/dev/null; then
      echo "✅ Cloud SQL Proxy is ready!"
      PROXY_RUNNING=true
      break
    fi
    if ! kill -0 "${PROXY_PID}" 2>/dev/null; then
      echo "❌ Cloud SQL Proxy failed to start"
      echo "Logs:"
      cat /tmp/cloud-sql-proxy.log 2>/dev/null || true
      exit 1
    fi
    sleep 1
  done
  
  if [[ "${PROXY_RUNNING}" != "true" ]]; then
    echo "❌ Cloud SQL Proxy failed to start within 30 seconds"
    kill "${PROXY_PID}" 2>/dev/null || true
    exit 1
  fi
fi

# Step 3: Update DATABASE_URL to use localhost
# Keep password as-is (already URL-encoded in secret)
echo "🔧 Updating DATABASE_URL to use localhost:${PROXY_PORT}..."
export DATABASE_URL=$(python3 <<EOF
import urllib.parse
url = '${ORIGINAL_DATABASE_URL}'
parsed = urllib.parse.urlparse(url)
# Keep password as-is (already properly encoded)
new_netloc = f'{parsed.username}:{parsed.password}@localhost:${PROXY_PORT}'
new_url = urllib.parse.urlunparse((
    parsed.scheme,
    new_netloc,
    parsed.path,
    parsed.params,
    parsed.query,
    parsed.fragment
))
print(new_url)
EOF
)

echo "   ✅ Connection string configured"
echo ""

# Step 4: Test connection (optional but helpful)
echo "🔍 Testing database connection..."
if command -v psql &> /dev/null; then
  # Extract just the connection parts for psql test
  DB_USER=$(python3 -c "import urllib.parse; print(urllib.parse.urlparse('${DATABASE_URL}').username)")
  DB_NAME=$(python3 -c "import urllib.parse; print(urllib.parse.urlparse('${DATABASE_URL}').path[1:])")
  if PGPASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.unquote(urllib.parse.urlparse('${DATABASE_URL}').password))") psql -h localhost -p "${PROXY_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1;" &>/dev/null; then
    echo "   ✅ Connection test successful!"
  else
    echo "   ⚠️  Connection test failed, but continuing anyway..."
  fi
else
  echo "   ⏭️  psql not available, skipping connection test"
fi
echo ""

# Step 5: Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
  echo "📦 Installing dependencies..."
  npm install --silent || pnpm install --silent || yarn install --silent
  echo ""
fi

# Step 6: Run migrations
echo "🚀 Running migrations..."
npx drizzle-kit migrate --config=src/drizzle.config.ts

echo ""
echo "✅ Migrations completed successfully!"

# Cleanup: Only kill proxy if we started it
if [[ -n "${PROXY_PID:-}" ]]; then
  echo ""
  echo "🧹 Cleaning up Cloud SQL Proxy..."
  kill "${PROXY_PID}" 2>/dev/null || true
  wait "${PROXY_PID}" 2>/dev/null || true
fi

echo "🎉 Done!"

