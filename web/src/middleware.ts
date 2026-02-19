import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { isKentronEmail } from '@db';

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/404(.*)',
  '/unauthorized(.*)',
  '/network-error',
  '/admin(.*)',
  '/unauthorized',
  '/',
  '/health',
  '/public(.*)',
  '/_next(.*)',
  '/favicon.ico',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isTenantRoute = createRouteMatcher(['/[tenant](.*)']);

const extractTenantFromPath = (pathname: string): string | null => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 1 && !parts[0].startsWith('admin') && !parts[0].startsWith('api')) {
    return parts[0];
  }
  return null;
};

const isUserAdmin = (orgRole: string | undefined): boolean => {
  if (!orgRole) return false;
  return ['org:admin', 'admin', 'org:owner'].includes(orgRole);
};

export default clerkMiddleware(async (auth, req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Allow public routes without any checks
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Get auth info
  const { userId, orgId, orgRole, sessionClaims } = await auth();

  // Protect all routes - require authentication
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Get user email from session claims
  const userEmail = sessionClaims?.email as string | undefined;

  // If user has no organization context, redirect to onboarding
  if (!orgId && pathname !== '/admin/client-onboarding') {
    // Only Kentron users can access admin to create organizations
    const isKentronUser = userEmail ? isKentronEmail(userEmail) : false;
    if (isKentronUser) {
      return NextResponse.redirect(new URL('/admin/client-onboarding', req.url));
    } else {
      // Regular users need to wait for invitation
      return NextResponse.redirect(new URL('/unauthorized?reason=no-organization', req.url));
    }
  }

  // Check organization creation routes - only Kentron users allowed to ACCESS the page
  // NOTE: The page itself can create orgs for ANY user (kentron.ai or external)
  const isKentronOnlyRoute = pathname.includes('/admin/client-onboarding');
  
  if (isKentronOnlyRoute) {
    const isKentronUser = userEmail ? isKentronEmail(userEmail) : false;
    if (!isKentronUser) {
      return NextResponse.redirect(new URL('/unauthorized?reason=kentron-only', req.url));
    }
  }

  // Handle tenant-based routing
  if (isTenantRoute(req)) {
    const tenantSlug = extractTenantFromPath(pathname);
    
    if (!tenantSlug) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // For tenant routes, we need orgId to match the tenant
    if (!orgId) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Note: We'll validate tenant access in the tenant layout
    // Middleware just ensures user has an active org context
  }

  // Check admin routes (except onboarding which is handled above)
  if (isAdminRoute(req) && pathname !== '/admin/client-onboarding') {
    if (!orgId || !isUserAdmin(orgRole)) {
      return NextResponse.redirect(new URL('/unauthorized?reason=admin-access-required', req.url));
    }
  }

  // Redirect root to appropriate page (handled in page.tsx)
  // Middleware just ensures auth, page.tsx handles smart redirect

  // Allow access to all other authenticated routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
