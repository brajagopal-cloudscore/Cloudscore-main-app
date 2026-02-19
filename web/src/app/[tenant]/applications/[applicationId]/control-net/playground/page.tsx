import Playground from "@/components/playground/Playground";


interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default async function ControlNetPlaygroundPage({ params }: PageProps) {

  return <Playground />;
}
