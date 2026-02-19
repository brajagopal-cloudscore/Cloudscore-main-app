import posthog from './posthog'

export function setupErrorTracking() {
  if (typeof window === 'undefined') return;

  console.log('Setting up error tracking...');

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Use both $exception and $autocapture for better detection
    posthog.capture('$exception', {
      $exception_type: 'unhandledrejection',
      $exception_message: event.reason?.message || String(event.reason) || 'Unhandled promise rejection',
      $exception_stack_trace_raw: event.reason?.stack,
      $exception_source: 'error_tracking',
      timestamp: new Date().toISOString(),
    });
    
    // Also send as a regular event for better visibility
    posthog.capture('unhandled_promise_rejection', {
      error_message: event.reason?.message || String(event.reason),
      error_stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
    });
  })

  // Capture regular JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    
    posthog.capture('$exception', {
      $exception_type: 'javascript_error',
      $exception_message: event.message,
      $exception_stack_trace_raw: event.error?.stack,
      $exception_filename: event.filename,
      $exception_lineno: event.lineno,
      $exception_colno: event.colno,
      $exception_source: 'error_tracking',
      timestamp: new Date().toISOString(),
    });
    
    // Also send as a regular event
    posthog.capture('javascript_error', {
      error_message: event.message,
      error_stack: event.error?.stack,
      filename: event.filename,
      line_number: event.lineno,
      column_number: event.colno,
      timestamp: new Date().toISOString(),
    });
  })

  console.log('Error tracking setup complete');
}
