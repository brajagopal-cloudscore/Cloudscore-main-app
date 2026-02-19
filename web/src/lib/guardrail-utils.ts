/**
 * Guardrail utilities for interpreting ONNX model results
 * This handles label mapping and guardrail decisions in the UI
 */

export interface ModelPrediction {
  class_index: number;
  confidence: number;
}

export interface GuardrailDecision {
  action: 'BLOCK' | 'ALLOW' | 'REVIEW';
  reason: string;
  confidence: number;
  threshold: number;
  threshold_met: boolean;
  is_risky: boolean;
  model_family: string;
}

export interface ModelResult {
  predictions: ModelPrediction[];
  max_confidence: number;
  top_prediction: ModelPrediction | null;
  model_family: string;
  num_classes: number;
}

// Label mappings for different model families
const LABEL_MAPPINGS: Record<string, Record<number, string>> = {
  toxicity: {
    0: "Toxic",           // ← Xenova/toxic-bert labels
    1: "Severe Toxic",
    2: "Obscene",
    3: "Threat",
    4: "Insult",
    5: "Identity Hate"
  },
  safety: {
    0: "Unsafe",
    1: "Safe" 
  },
  jailbreak: {
    0: "Jailbreak attempt",
    1: "Normal"
  },
  bias: {
    0: "Biased",
    1: "Unbiased"
  },
  privacy: {
    0: "Contains PII",
    1: "No PII"
  },
  security: {
    0: "Security risk",
    1: "Secure"
  }
};

// Default thresholds for different model families
const DEFAULT_THRESHOLDS: Record<string, number> = {
  toxicity: 0.5,
  safety: 0.5,
  jailbreak: 0.5,
  bias: 0.5,
  privacy: 0.5,
  security: 0.5
};

// Risky label patterns for each model family (case-insensitive matching)
const RISKY_PATTERNS: Record<string, string[]> = {
  toxicity: ["toxic"],
  safety: ["unsafe", "dangerous", "harmful"],
  jailbreak: ["jailbreak", "bypass", "exploit"],
  bias: ["biased", "discriminatory", "unfair"],
  privacy: ["pii", "personal", "sensitive"],
  security: ["risk", "vulnerable", "threat"]
};

/**
 * Get meaningful label for a class index based on model family
 */
export function getLabelForClass(modelFamily: string, classIndex: number, numClasses: number): string {
  const labels = LABEL_MAPPINGS[modelFamily.toLowerCase()];
  
  if (labels && labels[classIndex] !== undefined) {
    return labels[classIndex];
  }
  
  // Fallback labels based on number of classes
  if (numClasses === 2) {
    return classIndex === 0 ? "Negative" : "Positive";
  } else if (numClasses === 3) {
    return classIndex === 0 ? "Negative" : classIndex === 1 ? "Neutral" : "Positive";
  } else {
    return `Category ${classIndex}`;
  }
}

/**
 * Make a guardrail decision based on model prediction
 */
export function makeGuardrailDecision(
  prediction: ModelPrediction | null,
  modelFamily: string,
  threshold?: number
): GuardrailDecision {
  if (!prediction) {
    return {
      action: 'unknown' as any,
      reason: "No prediction available",
      confidence: 0.0,
      threshold: threshold || DEFAULT_THRESHOLDS[modelFamily] || 0.5,
      threshold_met: false,
      is_risky: false,
      model_family: modelFamily
    };
  }

  const effectiveThreshold = threshold || DEFAULT_THRESHOLDS[modelFamily] || 0.5;
  const confidence = prediction.confidence;
  const label = getLabelForClass(modelFamily, prediction.class_index, 2); // Assume binary for now
  
  // Determine if this is a "risky" prediction
  const riskyPatterns = RISKY_PATTERNS[modelFamily.toLowerCase()] || [];
  const is_risky = riskyPatterns.some(pattern => 
    label.toLowerCase().includes(pattern)
  );
  
  // Make decision
  let action: 'BLOCK' | 'ALLOW' | 'REVIEW';
  let reason: string;
  
  // If confidence is extremely low (< 10%), always ALLOW regardless of label
  // This prevents false positives from noisy model outputs
  if (confidence < 0.10) {
    action = 'ALLOW';
    reason = `Very low confidence (${(confidence * 100).toFixed(1)}%) - safe to allow`;
  } else if (confidence >= effectiveThreshold && is_risky) {
    action = 'BLOCK';
    reason = `High confidence (${(confidence * 100).toFixed(1)}%) detection of ${label.toLowerCase()}`;
  } else if (confidence >= effectiveThreshold) {
    action = 'ALLOW';
    reason = `High confidence (${(confidence * 100).toFixed(1)}%) detection of ${label.toLowerCase()}`;
  } else if (is_risky && confidence >= 0.20) {
    // Only REVIEW if confidence is at least 20% and label is risky
    action = 'REVIEW';
    reason = `Moderate confidence (${(confidence * 100).toFixed(1)}%) but potentially ${label.toLowerCase()}`;
  } else {
    action = 'ALLOW';
    reason = `Low confidence (${(confidence * 100).toFixed(1)}%) detection of ${label.toLowerCase()}`;
  }
  
  return {
    action,
    reason,
    confidence,
    threshold: effectiveThreshold,
    threshold_met: confidence >= effectiveThreshold,
    is_risky,
    model_family: modelFamily
  };
}

/**
 * Process raw model result into user-friendly format
 */
export function processModelResult(result: any): {
  predictions: Array<ModelPrediction & { label: string }>;
  top_prediction: (ModelPrediction & { label: string }) | null;
  guardrail_decision: GuardrailDecision;
} {
  // Debug logging
  console.log('[processModelResult] Raw result:', result);
  
  // Handle different data structures from backend
  let predictions: ModelPrediction[] = [];
  let top_prediction: ModelPrediction | null = null;
  
  if (result.predictions && Array.isArray(result.predictions)) {
    predictions = result.predictions;
  } else if (result.predictions && typeof result.predictions === 'object') {
    // If predictions is an object with a predictions array inside
    if (Array.isArray(result.predictions.predictions)) {
      predictions = result.predictions.predictions;
    }
  }
  
  if (result.top_prediction) {
    top_prediction = result.top_prediction;
  } else if (predictions.length > 0) {
    top_prediction = predictions[0];
  }
  
  const processedPredictions = predictions.map(pred => ({
    ...pred,
    label: getLabelForClass(result.model_family || 'unknown', pred.class_index, result.num_classes || 2)
  }));
  
  const processedTopPrediction = top_prediction ? {
    ...top_prediction,
    label: getLabelForClass(result.model_family || 'unknown', top_prediction.class_index, result.num_classes || 2)
  } : null;
  
  const guardrail_decision = makeGuardrailDecision(top_prediction, result.model_family || 'unknown');
  
  return {
    predictions: processedPredictions,
    top_prediction: processedTopPrediction,
    guardrail_decision
  };
}
