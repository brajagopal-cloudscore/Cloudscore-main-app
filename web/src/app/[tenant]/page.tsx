import { redirect } from 'next/navigation';

interface TenantPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenant } = await params;
  // Redirect to control-net as the main tenant landing page
  redirect(`/${tenant}/applications`);
}