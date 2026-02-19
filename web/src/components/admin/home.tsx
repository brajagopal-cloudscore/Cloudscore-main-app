"use client";

import React, { useEffect, useState } from "react";
import { TbCloudNetwork } from "react-icons/tb";
import { Users } from "lucide-react";
import { PiFolderOpenLight } from "react-icons/pi";
import { useTenant } from "@/contexts/TenantContext";
import { useParams } from "next/navigation";
import { getAdminStats } from "@/lib/actions/admin-stats";

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

interface AdminStats {
  activeApplicationsCount: number;
  activeUsersCount: number;
}

const HomeMain = () => {
  const { tenant } = useTenant();
  const params = useParams();
  const [stats, setStats] = useState<AdminStats>({
    activeApplicationsCount: 0,
    activeUsersCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get tenant slug from context or params
  const tenantSlug = tenant?.slug || (params?.tenant as string);

  useEffect(() => {
    const fetchStats = async () => {
      if (!tenantSlug) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await getAdminStats(tenantSlug);

        if (result.success && result.data) {
          setStats({
            activeApplicationsCount: result.data.activeApplicationsCount,
            activeUsersCount: result.data.activeUsersCount,
          });
        } else {
          setError(result.error || "Failed to fetch statistics");
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch statistics"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [tenantSlug]);

  return (
    <>
      <div className="flex flex-col p-5 pl-[15px]">
        <div className="flex flex-col">
          <div className="text-lg leading-5 font-semibold font-sans mb-3 ">
            A brief glimpse into your organization
          </div>
          <div className="flex flex-col gap-7">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Active Users Card */}
              <div className=" border rounded-lg p-6">
                {/* <div className="flex justify-end">
                    <span className="text-xs text-gray-500">12% ↑</span>
                  </div> */}
                <div className="flex flex-col justify-start items-start gap-1 mt-2">
                  <Users size={32} className=" text-muted-foreground mb-2" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-normal leading-normal font-sans">
                      Active Users
                    </span>
                    {isLoading ? (
                      <span className="text-xl text-muted-foregroundfont-semibold leading-7 font-sans">
                        ...
                      </span>
                    ) : error ? (
                      <span className="text-xl text-red-500 font-semibold leading-7 font-sans">
                        Error
                      </span>
                    ) : (
                      <span className="text-xl text-muted-foreground font-semibold leading-7 font-sans">
                        {stats.activeUsersCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Workspaces Card */}
              <div className="border rounded-lg p-6">
                {/* <div className="flex justify-end">
                    <span className="text-xs text-gray-500">12% ↑</span>
                  </div> */}
                <div className="flex flex-col justify-start items-start gap-1 mt-2">
                  <PiFolderOpenLight
                    size={32}
                    className="text-muted-foreground stroke-[8px] mb-2"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-normal leading-normal font-sans">
                      Active Applications
                    </span>
                    {isLoading ? (
                      <span className="text-xl text-muted-foregroundfont-semibold leading-7 font-sans">
                        ...
                      </span>
                    ) : error ? (
                      <span className="text-xl text-red-500 font-semibold leading-7 font-sans">
                        Error
                      </span>
                    ) : (
                      <span className="text-xl text-muted-foreground font-semibold leading-7 font-sans">
                        {stats.activeApplicationsCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Connectors Card */}
              {/* <div className="bg-white border border-[#DDDCDB] rounded-lg p-6">
                <div className="flex flex-col justify-start items-start gap-1 mt-2">
                  <TbCloudNetwork size={32} className="text-muted-foreground mb-2" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-normal leading-normal font-sans">
                      Active Policies
                    </span>
                    <span className="text-xl text-muted-foregroundfont-semibold leading-7 font-sans">
                      {staticUsageData.nActivePolicyCount}
                    </span>
                  </div>
                </div>
              </div> */}

              {/* Total Processed Data Card */}
              {/* <div className="bg-white border border-[#DDDCDB] rounded-lg p-6">
                  <div className="flex flex-col justify-start items-start gap-1 mt-2">
                    <PiDatabaseThin
                      size={32}
                      className="stroke-[8px] text-muted-foreground mb-2"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground font-normal leading-normal font-sans">
                        Total processed data
                      </span>
                      <span className="text-xl text-muted-foregroundfont-semibold leading-7 font-sans">
                        {convertKBToGB(usage.total_process_data)} GB
                      </span>
                    </div>
                  </div>
                </div> */}
            </div>

            {/* Data Usage Card */}
            {/* <div className="bg-white border border-[#DDDCDB] max-w-[600px] rounded-lg p-6">
                <div className="text-base font-medium mb-4">Data Usage</div>
                <div className="flex flex-col md:flex-row-reverse justify-between gap-2 items-center">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-full max-w-[300px] aspect-square">
                      <ChartStyle id={chartId} config={chartConfig} />
                      <ChartContainer
                        id={chartId}
                        config={chartConfig}
                        className="mx-auto w-full h-full"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={0}
                            activeShape={({
                              outerRadius = 0,
                              ...props
                            }: PieSectorDataItem) => (
                              <g>
                                <Sector
                                  {...props}
                                  outerRadius={outerRadius + 8}
                                />
                                <Sector
                                  {...props}
                                  outerRadius={outerRadius + 25}
                                  innerRadius={outerRadius + 12}
                                />
                              </g>
                            )}
                          >
                            <Label
                              content={({ viewBox }) => {
                                if (
                                  viewBox &&
                                  'cx' in viewBox &&
                                  'cy' in viewBox
                                ) {
                                  return (
                                    <text
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      textAnchor="middle"
                                      dominantBaseline="middle"
                                    >
                                      <tspan
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        className="fill-black text-2xl font-bold"
                                      >
                                        {convertKBToGB(
                                          usage?.total_data_remaining
                                        )}
                                      </tspan>
                                      <tspan
                                        x={viewBox.cx}
                                        y={(viewBox.cy || 0) + 24}
                                        className="fill-gray-500 text-xs"
                                      >
                                        GB Remaining
                                      </tspan>
                                    </text>
                                  );
                                }
                              }}
                            />
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 mt-6 md:mt-0">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#6B7280]"></div>
                      <span className="text-sm">
                        {' '}
                        {convertKBToGB(usage?.total_process_data)} Total Used
                        data GB
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#E5E7EB]"></div>
                      <span className="text-sm">
                        {' '}
                        {convertKBToGB(usage?.total_allocated_storage)} Total
                        allocated storage GB
                      </span>
                    </div>
                  </div>
                </div>
              </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeMain;
