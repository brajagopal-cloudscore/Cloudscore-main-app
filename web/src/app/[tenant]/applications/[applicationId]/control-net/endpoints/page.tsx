import EndpointsContent from '@/components/control-net/EndpointsContent';

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default async function ControlNetEndpointsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { tenant, applicationId } = resolvedParams;

  return <EndpointsContent initialEndpoints={[]} />;
}
