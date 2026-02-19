import { auth } from "@clerk/nextjs/server";
import Observability from "@/components/observability";
import {
  TenantLogsStore,
  TenantStatsStore,
  TenantGraphStore,
} from "@/store/tenantLogs.store";
export default async function page() {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error("Authentication required");
  }

  return (
    <>
      <TenantStatsStore>
        <TenantLogsStore>
          <TenantGraphStore>
            <Observability />
          </TenantGraphStore>
        </TenantLogsStore>
      </TenantStatsStore>
    </>
  );
}
