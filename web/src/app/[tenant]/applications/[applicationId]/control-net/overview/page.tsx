import ControlNetOverview from "@/components/control-net/overview";
import {
  ApplicationLogsStore,
  ApplicationStatsStore,
  ApplicationGraphStore,
} from "@/store/applicationLogs.store";

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default async function ControlNetOverviewPage({ params }: PageProps) {
  return (
    <>
      <ApplicationStatsStore>
        <ApplicationLogsStore>
          <ApplicationGraphStore>
            <ControlNetOverview />
          </ApplicationGraphStore>
        </ApplicationLogsStore>
      </ApplicationStatsStore>
    </>
  );
}
