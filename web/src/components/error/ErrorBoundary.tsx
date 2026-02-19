'use client';

import posthog from '@/lib/posthog';
import React from 'react';

class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { fallback: React.ReactNode, children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Send as $exception for PostHog's error detection
    posthog.capture('$exception', {
      $exception_type: 'react_error_boundary',
      $exception_message: error.message,
      $exception_stack_trace_raw: error.stack,
      $exception_source: 'react_error_boundary',
      error_boundary_component: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Also send as a custom event for easier filtering
    posthog.capture('react_error_boundary', {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack,
      error_name: error.name,
      timestamp: new Date().toISOString(),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
