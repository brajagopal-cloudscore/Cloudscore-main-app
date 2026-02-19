export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Check if an email is from Kentron AI domain
 * Safe to use in Edge Runtime (middleware) - no database access
 */
export function isKentronEmail(email: string): boolean {
  return email.endsWith('@kentron.ai');
}
