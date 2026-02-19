#!/bin/bash

# Generate Drizzle Migration for GovIQ Schema
# This script generates SQL migrations from the schema.ts file

echo "🔄 Generating Drizzle migration for GovIQ schema..."

cd "$(dirname "$0")/.." || exit 1

# Generate migration
npx drizzle-kit generate

echo "✅ Migration generated successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the generated migration file in drizzle/ directory"
echo "   2. Run: npx drizzle-kit push (to apply to database)"
echo "   3. Or run: npx drizzle-kit migrate (for production)"
echo ""
echo "🌱 To seed demo data:"
echo "   npx tsx scripts/seed-goviq-data.ts"

