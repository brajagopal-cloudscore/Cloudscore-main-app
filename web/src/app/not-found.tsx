import { NotFoundPage } from '@/components/error/CustomErrorPage';

/**
 * Root-level 404 page for Next.js App Router.
 * This handles 404 errors for routes that don't exist.
 */
export default function RootNotFound() {
  return <NotFoundPage />;
}
