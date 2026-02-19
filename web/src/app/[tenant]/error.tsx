'use client';

import { useEffect } from 'react';
import { ServerErrorPage } from '@/components/error/CustomErrorPage';

/**
 * Tenant-level error boundary for Next.js App Router.
 * This catches errors within tenant routes.
 */
export default function TenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Tenant error:', error);
  }, [error]);

  return <ServerErrorPage />;
}
