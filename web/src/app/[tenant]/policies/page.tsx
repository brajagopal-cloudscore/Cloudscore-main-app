import PoliciesContent from '@/components/control-net/PoliciesContent';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function PoliciesPage({ params }: PageProps) {
  const { tenant } = await params;
  
  // TODO: Fetch policies from database
  // const policies = await db.query.policies.findMany({
  //   where: eq(policies.tenantId, tenantId),
  // });

  return (
    <div className="min-h-screen bg-white p-6">
      <PoliciesContent initialPolicies={[]} />
    </div>
  );
}

