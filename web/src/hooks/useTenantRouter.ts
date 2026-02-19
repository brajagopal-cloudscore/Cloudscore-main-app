// src/hooks/useTenantRouter.ts
'use client';

import { useRouter } from 'next/navigation';
import { useTenant } from '@/contexts/TenantContext';

export function useTenantRouter() {
  const router = useRouter();
  const { tenant } = useTenant();

  const push = (path: string) => {
    if (!tenant) {
      console.error('No tenant context available');
      return;
    }
    
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    router.push(`/${tenant.slug}${cleanPath}`);
  };

  const replace = (path: string) => {
    if (!tenant) {
      console.error('No tenant context available');
      return;
    }
    
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    router.replace(`/${tenant.slug}${cleanPath}`);
  };

  const back = () => {
    router.back();
  };

  const forward = () => {
    router.forward();
  };

  const refresh = () => {
    router.refresh();
  };

  return {
    push,
    replace,
    back,
    forward,
    refresh,
    tenant,
  };
}
