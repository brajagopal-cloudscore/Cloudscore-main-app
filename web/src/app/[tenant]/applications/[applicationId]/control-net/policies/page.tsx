import PoliciesTab from '@/components/control-net/Polices';

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default async function ControlNetPoliciesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { tenant, applicationId } = resolvedParams;

  return <PoliciesTab />;
}
