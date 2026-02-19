/**
 * Seed Marketplace Guardrails
 * 
 * Seeds the database with global marketplace guardrails that match
 * the Python guard implementations in apps/controlnet/guard_packs/
 */

import { db, guardrails } from "../src/db"
import { eq, isNull } from "drizzle-orm"

// Only include guards that exist in Python registry
const MARKETPLACE_GUARDRAILS = [
  // PII Guards
  {
    key: "pii.detect",
    name: "PII Detection",
    description: "Detects personally identifiable information (PII) such as emails, phone numbers, SSN, credit cards, and addresses",
    category: "privacy",
    tier: "T0",
    packName: "pii",
    functionName: "detect",
    performanceBudgetMs: "10",
    infrastructure: "cpu",
    isGlobal: true,
    isCertified: true,
    requiresOnnx: false,
    defaultParams: {
      types: ["EMAIL", "PHONE"],
      threshold: 0,
      severity: "high"
    },
    avgLatencyMs: "5",
    accuracyScore: "0.95",
  },
  {
    key: "pii.redact",
    name: "PII Redaction",
    description: "Redacts or masks PII from content to protect privacy",
    category: "privacy",
    tier: "T0",
    packName: "pii",
    functionName: "redact",
    performanceBudgetMs: "10",
    infrastructure: "cpu",
    isGlobal: true,
    isCertified: true,
    requiresOnnx: false,
    defaultParams: {
      types: ["SSN"],
      mode: "mask"
    },
    avgLatencyMs: "6",
    accuracyScore: "0.98",
  },
  
  // Toxicity Guards
  {
    key: "toxicity.detect",
    name: "Toxicity Detection",
    description: "Detects toxic, offensive, or harmful language",
    category: "safety",
    tier: "T1",
    packName: "toxicity",
    functionName: "detect",
    performanceBudgetMs: "50",
    infrastructure: "cpu",
    isGlobal: true,
    isCertified: true,
    requiresOnnx: false,
    defaultParams: {
      severity: "high",
      threshold: 0.5
    },
    avgLatencyMs: "35",
    accuracyScore: "0.92",
  },
  
  // Business Guards
  {
    key: "business.competitor_protection",
    name: "Competitor Protection",
    description: "Prevents mentioning or promoting competitor brands",
    category: "business",
    tier: "T0",
    packName: "business",
    functionName: "competitor_protection",
    performanceBudgetMs: "10",
    infrastructure: "cpu",
    isGlobal: true,
    isCertified: true,
    requiresOnnx: false,
    defaultParams: {
      competitors: ["OldCorp"],
      severity: "low"
    },
    avgLatencyMs: "4",
    accuracyScore: "0.99",
  },
  {
    key: "business.brand_tone",
    name: "Brand Tone Enforcement",
    description: "Ensures responses match your brand's tone and voice",
    category: "business",
    tier: "T0",
    packName: "business",
    functionName: "brand_tone",
    performanceBudgetMs: "10",
    infrastructure: "cpu",
    isGlobal: true,
    isCertified: true,
    requiresOnnx: false,
    defaultParams: {
      severity: "low",
      unprofessional_patterns: [],
      required_tone: "professional"
    },
    avgLatencyMs: "5",
    accuracyScore: "0.90",
  },
  
  // Tool Guards
  {
    key: "tools.allowlist",
    name: "Tool Allowlist",
    description: "Only allows execution of specified tools",
    category: "tools",
    tier: "T0",
    packName: "tools",
    functionName: "allowlist",
    performanceBudgetMs: "5",
    infrastructure: "cpu",
    isGlobal: true,
    isCertified: true,
    requiresOnnx: false,
    defaultParams: {
      allowed_tools: [],
      severity: "high"
    },
    avgLatencyMs: "2",
    accuracyScore: "1.0",
  },
  {
    key: "tools.denylist",
    name: "Tool Denylist",
    description: "Blocks execution of dangerous or restricted tools",
    category: "tools",
    tier: "T0",
    packName: "tools",
    functionName: "denylist",
    performanceBudgetMs: "5",
    infrastructure: "cpu",
    isGlobal: true,
    isCertified: true,
    requiresOnnx: false,
    defaultParams: {
      denied_tools: [],
      severity: "critical"
    },
    avgLatencyMs: "2",
    accuracyScore: "1.0",
  },
]

async function seedMarketplace() {
  console.log("🌱 Seeding marketplace guardrails...")
  
  try {
    // Delete existing global marketplace guardrails
    console.log("🧹 Cleaning up old marketplace guardrails...")
    await db.delete(guardrails)
      .where(eq(guardrails.isGlobal, true))
    
    // Insert new marketplace guardrails
    console.log(`📦 Inserting ${MARKETPLACE_GUARDRAILS.length} marketplace guardrails...`)
    
    const values = MARKETPLACE_GUARDRAILS.map(guard => ({
      key: guard.key,
      name: guard.name,
      description: guard.description,
      category: guard.category,
      tier: guard.tier as "T0" | "T1" | "T2",
      packName: guard.packName,
      functionName: guard.functionName,
      performanceBudgetMs: guard.performanceBudgetMs,
      infrastructure: guard.infrastructure as "ml" | "llm" | "rule" | "na",
      isGlobal: guard.isGlobal,
      isCertified: guard.isCertified,
      requiresOnnx: guard.requiresOnnx,
      defaultParams: guard.defaultParams,
      avgLatencyMs: guard.avgLatencyMs,
      accuracyScore: guard.accuracyScore,
      tenantId: null, // Global marketplace guardrails have no tenant
      version: "v1",
      isEnabled: true,
    }))
    
    await db.insert(guardrails).values(values)
    
    console.log(`  ✅ Inserted all ${values.length} guardrails`)
    
    
    console.log("✨ Marketplace seeding complete!")
    console.log(`📊 Total guardrails: ${MARKETPLACE_GUARDRAILS.length}`)
    
  } catch (error) {
    console.error("❌ Error seeding marketplace:", error)
    throw error
  }
}

// Run the seed
seedMarketplace()
  .then(() => {
    console.log("👍 Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error)
    process.exit(1)
  })
