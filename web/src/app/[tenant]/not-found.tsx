import { NotFoundPage } from '@/components/error/CustomErrorPage';

/**
 * Tenant-level 404 page for Next.js App Router.
 * This handles 404 errors within tenant routes.
 */
export default function TenantNotFound() {
  return <NotFoundPage />;
}
