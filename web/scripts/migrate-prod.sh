#!/bin/bash
# Run Drizzle migrations on production using .env.production
# Usage: ./scripts/migrate-prod.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="${SCRIPT_DIR}/.."
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env.production"

cd "${WEB_DIR}"

echo "🔄 Running Drizzle migrations on PRODUCTION"
echo ""

# Check if .env.production exists
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "❌ .env.production not found at: ${ENV_FILE}"
  exit 1
fi

echo "📄 Loading environment from: ${ENV_FILE}"
echo ""

# Load DATABASE_URL from .env.production
DATABASE_URL_LINE=$(grep -v '^#' "${ENV_FILE}" | grep "^DATABASE_URL=" | head -1)

if [[ -z "${DATABASE_URL_LINE:-}" ]]; then
  echo "❌ DATABASE_URL not found in .env.production"
  exit 1
fi

# Extract DATABASE_URL (handle quoted and unquoted values)
DATABASE_URL=$(echo "${DATABASE_URL_LINE}" | cut -d'=' -f2- | sed 's/^"//;s/"$//')

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL is empty"
  exit 1
fi

# Ensure SSL is required for production database
if [[ ! "${DATABASE_URL}" =~ sslmode= ]]; then
  if [[ "${DATABASE_URL}" =~ \? ]]; then
    export DATABASE_URL="${DATABASE_URL}&sslmode=require"
  else
    export DATABASE_URL="${DATABASE_URL}?sslmode=require"
  fi
  echo "🔒 Added sslmode=require to DATABASE_URL"
fi

# Verify it's production (safety check)
if [[ ! "${DATABASE_URL}" =~ (prod|production|kentron-production) ]]; then
  echo "⚠️  WARNING: DATABASE_URL doesn't appear to be production!"
  echo "   DATABASE_URL: ${DATABASE_URL:0:50}..."
  read -p "Continue anyway? (yes/no) " -r
  if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Cancelled"
    exit 0
  fi
fi

echo "✅ DATABASE_URL loaded with SSL enabled"
echo ""

# Create temporary drizzle config that loads from .env.production
TEMP_CONFIG="${WEB_DIR}/src/drizzle.config.prod.ts"
cat > "${TEMP_CONFIG}" <<'EOF'
import type { Config } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.production
config({ path: resolve(process.cwd(), "../../.env.production") });

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true,
  },
} satisfies Config;
EOF

# Run migration
echo "🚀 Running migrations..."
echo ""

npm run db:migrate -- --config=src/drizzle.config.prod.ts

# Cleanup
rm -f "${TEMP_CONFIG}"

echo ""
echo "✅ Migrations completed successfully!"







