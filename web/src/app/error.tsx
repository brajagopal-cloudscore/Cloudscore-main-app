'use client';

import { useEffect } from 'react';
import { ServerErrorPage } from '@/components/error/CustomErrorPage';

/**
 * Root-level error boundary for Next.js App Router.
 * This catches errors in the root layout and pages outside tenant routes.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Root error:', error);
  }, [error]);

  return <ServerErrorPage />;
}
