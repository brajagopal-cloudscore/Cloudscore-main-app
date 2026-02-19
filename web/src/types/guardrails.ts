// types/guardrails.ts

export type GuardTier = 'T0' | 'T1' | 'T2';

export interface GuardrailConfig {
  // Security
  injectionAttack: boolean;
  systemPromptLeak: boolean;
  // Privacy  
  piiDetector: boolean;
  copyrightIP: boolean;
  // Compliance
  policyViolation: boolean;
  // Moderation
  toxicityDetector: boolean;
  nsfwDetector: boolean;
  topicDetector: boolean;
  keywordDetector: boolean;
  // Integrity
  bias: boolean;
  spongeAttack: boolean;
  hallucination: boolean;
  adherence: boolean;
  relevancy: boolean;
}

