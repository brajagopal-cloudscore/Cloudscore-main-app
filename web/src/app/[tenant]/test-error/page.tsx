'use client';

import React from 'react';

/**
 * Test page to trigger error boundary and test error page redirection.
 * This page intentionally throws an error when rendered to test the
 * ErrorBoundary fallback and redirect functionality.
 */
export default function TestErrorPage(): never {
  // Throw an error during render to trigger the ErrorBoundary
  // ErrorBoundary catches errors during rendering
  throw new Error('Test error for testing error page redirection');
}
