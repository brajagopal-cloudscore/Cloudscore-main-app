import PoliciesContent from "@/components/control-net/PoliciesContent";
import PolicyDetail from "@/components/control-net/PolicyDetail";
interface PageProps {
  params: Promise<{ tenant: string; policyId: string }>;
}

export default async function PolicyPage({ params }: PageProps) {
  const { tenant, policyId } = await params;

  return (
    <div className="">
      <PolicyDetail></PolicyDetail>
    </div>
  );
}
