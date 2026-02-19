import Playground from '@/components/playground/Playground';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function PlaygroundPage({ params }: PageProps) {
  const { tenant } = await params;
  
  return <Playground />;
}
