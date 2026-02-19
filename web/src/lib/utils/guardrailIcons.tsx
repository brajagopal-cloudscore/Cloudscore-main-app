import React from "react"
import {
  Shield, Lock, Eye, AlertTriangle, FileText, Database,
  CheckCircle, XCircle, Code, Settings,
  Users, Building, Gavel, CreditCard, Heart,
  MessageSquare, Filter, Mail,
  Link, Ruler, Regex, Scale, Brain, Target,
  ShieldCheck, Bug, Terminal, Globe2,
  FileCheck, FileX, FileSearch, FileCode, FileSpreadsheet
} from "lucide-react"

/**
 * Get the appropriate Lucide icon component based on guardrail key
 * @param key - The guardrail key (e.g., "security.jailbreak", "pii.detect")
 * @returns The corresponding Lucide icon component
 */
export function getGuardrailIcon(key: string): React.ComponentType<{ className?: string }> {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Security guards
    'security.jailbreak': Lock,
    'security.secrets': Eye,
    'security.sql_injection': Database,
    'security.xss_prevent': ShieldCheck,
    'security.unusual_prompt': AlertTriangle,
    'security.code_injection': Code,
    'security.url_check': Link,
    'security.command_injection': Terminal,
    'security.code_scan': Bug,
    'security.api_security': Settings,

    // PII guards
    'pii.detect': Eye,
    'pii.redact': Eye,
    'privacy.pii_enhanced': Eye,
    'privacy.anonymization': Users,
    'privacy.consent': CheckCircle,

    // Safety guards
    'safety.toxicity': AlertTriangle,
    'safety.jailbreak.local_onnx': Lock,
    'safety.ner.local_onnx': Target,
    'toxicity.detect': AlertTriangle,
    'toxicity.block': XCircle,

    // Quality guards
    'quality.hallucination': Brain,
    'quality.gibberish': FileX,
    'quality.factual_accuracy': FileCheck,
    'quality.logic_consistency': Scale,
    'quality.relevance': Target,
    'quality.bias': Scale,
    'quality.data_quality': FileSearch,
    'quality.redundancy': FileText,

    // Compliance guards
    'compliance.gdpr': Shield,
    'compliance.hipaa': Heart,
    'compliance.sox': Building,
    'compliance.pci_dss': CreditCard,
    'compliance.medical_info': Heart,

    // Business guards
    'business.financial_compliance': Building,
    'business.financial_advice_onnx': Building,
    'business.legal_advice_onnx': Gavel,
    'business.compliance_onnx': Building,

    // Communication guards
    'communication.politeness': MessageSquare,
    'communication.readability': FileText,
    'communication.tone': MessageSquare,
    'communication.translation': Globe2,
    'communication.cultural': Users,

    // Formatting guards
    'formatting.json': FileCode,
    'formatting.xml': FileCode,
    'formatting.csv': FileSpreadsheet,
    'formatting.url': Link,
    'formatting.email': Mail,
    'formatting.length': Ruler,
    'formatting.regex': Regex,

    // Tools guards
    'tools.allowlist': CheckCircle,
    'tools.denylist': XCircle,
    'tools.args.validator': Settings,
    'tools.result.filter': Filter,

    // Schema guards
    'schema.validate.json': FileCheck,
    'schema.validate.structure': FileCheck,

    // Politics guards
    'politics.block': XCircle,
    'politics.detect': Eye,

    // ONNX guards
    'onnx.configurable': Settings,
    'onnx.financial': Building,
    'onnx.legal': Gavel,
    'onnx.toxicity': AlertTriangle,
    'onnx.pii': Eye,
    'onnx.sentiment': MessageSquare,
  }

  // Try exact match first
  if (iconMap[key]) {
    return iconMap[key]
  }

  // Try category-based matching
  const category = key.split('.')[0]
  const categoryMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'security': Shield,
    'pii': Eye,
    'privacy': Eye,
    'safety': AlertTriangle,
    'toxicity': AlertTriangle,
    'quality': Brain,
    'compliance': Shield,
    'business': Building,
    'communication': MessageSquare,
    'formatting': FileText,
    'tools': Settings,
    'schema': FileCheck,
    'politics': Users,
    'onnx': Settings,
  }

  return categoryMap[category] || Shield
}
