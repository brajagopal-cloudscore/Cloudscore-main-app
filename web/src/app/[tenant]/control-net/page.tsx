import EndpointsContent from '@/components/control-net/EndpointsContent';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function ControlNetPage({ params }: PageProps) {
  const { tenant } = await params;

  // TODO: Fetch endpoints from database when models table is set up
  // const tenantData = await db.query.tenants.findFirst({
  //   where: eq(tenants.slug, tenant),
  // });
  // const endpoints = await db.query.models.findMany({
  //   where: eq(models.tenantId, tenantData.id),
  // });

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-black">ControlNet</h1>
        </div>

        {/* Endpoints Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Endpoint Management</h2>
          <EndpointsContent initialEndpoints={[]} />
        </div>
      </div>
    </div>
  );
}
