import RedTeamingContent from '@/components/control-net/RedTeamingContent';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function RedTeamingPage({ params }: PageProps) {
  const { tenant } = await params;
  
  // TODO: Fetch red teaming tasks from database

  return (
    <div className="min-h-screen bg-white p-6">
      <RedTeamingContent initialTasks={[]} />
    </div>
  );
}

