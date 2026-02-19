import GuardrailsPage from '@/app/[tenant]/guardrails/page';

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default async function ControlNetGuardrailsPage({ params }: PageProps) {
  const resolvedParams = await params;

  return <GuardrailsPage params={params} />;
}
