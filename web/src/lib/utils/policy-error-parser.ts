/**
 * Policy Error Parser Utility
 * 
 * Parses API validation errors and converts them to user-friendly messages
 * for policy creation failures.
 */

export interface ParsedPolicyError {
  type: 'guardrail_parameter' | 'compilation' | 'yaml_syntax' | 'general'
  message: string
  guardrailName?: string
  missingParams?: string
}

/**
 * Parse policy creation error messages into user-friendly format
 */
export function parsePolicyError(errorMessage: string): ParsedPolicyError {
  // Guardrail parameter validation errors
  if (errorMessage.includes('missing') && errorMessage.includes('required positional argument')) {
    const match = errorMessage.match(/(\w+)\(\) missing \d+ required positional argument[s]?: (.+)/)
    if (match) {
      const [, guardrailName, missingParams] = match
      return {
        type: 'guardrail_parameter',
        message: `Guardrail "${guardrailName}" is missing required parameters: ${missingParams}. Please check your guardrail configuration.`,
        guardrailName,
        missingParams
      }
    } else {
      return {
        type: 'guardrail_parameter',
        message: `Guardrail configuration error: ${errorMessage}`
      }
    }
  }

  // Policy compilation errors
  if (errorMessage.includes('Failed to compile policy')) {
    return {
      type: 'compilation',
      message: `Policy validation failed: ${errorMessage.replace('Failed to compile policy: ', '')}`
    }
  }

  // YAML syntax errors
  if (errorMessage.includes('Generated YAML is invalid')) {
    return {
      type: 'yaml_syntax',
      message: `Policy configuration error: ${errorMessage.replace('Generated YAML is invalid: ', '')}`
    }
  }

  // General errors
  return {
    type: 'general',
    message: errorMessage
  }
}

/**
 * Get user-friendly error message for display in UI
 */
export function getUserFriendlyErrorMessage(error: Error | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message
  const parsed = parsePolicyError(errorMessage)
  
  switch (parsed.type) {
    case 'guardrail_parameter':
      return `❌ Guardrail Configuration Error\n\n${parsed.message}\n\nPlease check your guardrail selections and ensure all required parameters are provided.`
    
    case 'compilation':
      return `❌ Policy Validation Failed\n\n${parsed.message}\n\nPlease review your policy configuration and try again.`
    
    case 'yaml_syntax':
      return `❌ Policy Configuration Error\n\n${parsed.message}\n\nPlease check your policy settings.`
    
    default:
      return `❌ Policy Creation Failed\n\n${parsed.message}\n\nPlease try again or contact support if the issue persists.`
  }
}

/**
 * Get toast-friendly error message (shorter format)
 */
export function getToastErrorMessage(error: Error | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message
  const parsed = parsePolicyError(errorMessage)
  
  switch (parsed.type) {
    case 'guardrail_parameter':
      return parsed.message
    
    case 'compilation':
      return parsed.message
    
    case 'yaml_syntax':
      return parsed.message
    
    default:
      return parsed.message
  }
}
