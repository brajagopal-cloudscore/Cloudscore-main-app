"use client";

import SideBar from "@/components/admin/sidebar/Sidebar";
// Removed API imports - using static data instead
// Removed Navbar import - using static layout instead
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Static data for organization info
const staticOrganizationInfo = {
  sTenantName: "Kentron",
  sTenantURL: "https://demo.kentron.ai",
  sDataLocation: "United States",
  sDisplayName: "Kentron Admin",
  sEmail: "admin@kentron.ai",
  sCreatedAt: "2025-09-01",
  sRenewalDate: "2026-09-01",
};

const OrganizationInfo = () => {
  // Static data usage instead of API calls
  const OrganizationInfo = staticOrganizationInfo;
  const isLoading = false;

  return (
    <div className="flex flex-1 justify-start flex-col px-5 gap-5 pt-4">
      {isLoading ? (
        <Card className="w-[437px]  rounded-lg shadow-none p-4">
          <CardHeader className="p-0 space-y-0 pb-2">
            <div className="flex flex-col items-start justify-center gap-1">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-[200px]" />
            </div>
            <Separator className="my-2 " />
          </CardHeader>

          <CardContent className="p-0 pt-2">
            <div className="flex flex-col space-y-1">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[110px_1fr] items-center"
                >
                  <Skeleton className="h-4 w-[90px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-[437px]  rounded-lg shadow-none p-4">
          <CardHeader className="p-0 space-y-0 pb-2">
            <div className="flex  flex-col items-start justify-center gap-1">
              <Building2 size={20} className="" />
              <h3 className="text-[14px] font-sans leading-5  font-bold ">
                {OrganizationInfo?.sTenantName.charAt(0).toUpperCase() +
                  OrganizationInfo?.sTenantName.slice(1) || "Contoso"}
              </h3>
            </div>
            <Separator className="my-2 " />
          </CardHeader>

          <CardContent className="p-0 pt-2">
            <div className="flex flex-col space-y-1">
              <div className="grid grid-cols-[110px_1fr] items-center ">
                <div className="text-sm text-muted-foreground font-normal">
                  Tenant URL
                </div>
                <div className="text-sm leading-5 font-sans font-medium ">
                  {OrganizationInfo?.sTenantURL}
                </div>
              </div>

              <div className="grid grid-cols-[110px_1fr] items-center ">
                <div className="text-sm text-muted-foreground font-normal">
                  Business Operation Location
                </div>
                <div className="text-sm leading-5 font-sans font-medium ">
                  {OrganizationInfo?.sDataLocation}
                </div>
              </div>

              <div className="grid grid-cols-[110px_1fr] items-center ">
                <div className="text-sm text-muted-foreground font-normal">
                  Global Admin
                </div>
                <div className="text-sm leading-5 font-sans font-medium ">
                  {OrganizationInfo?.sDisplayName}
                </div>
              </div>

              <div className="grid grid-cols-[110px_1fr] items-center ">
                <div className="text-sm text-muted-foreground font-normal">
                  Email id
                </div>
                <div className="text-sm leading-5 font-sans font-medium ">
                  {OrganizationInfo?.sEmail}
                </div>
              </div>

              <div className="grid grid-cols-[110px_1fr] items-center ">
                <div className="text-sm text-muted-foreground">Created at</div>
                <div className="text-sm leading-5 font-sans font-medium ">
                  {OrganizationInfo?.sCreatedAt}
                </div>
              </div>

              <div className="grid grid-cols-[110px_1fr] items-center ">
                <div className="text-sm text-muted-foreground font-normal">
                  Renewal Date
                </div>
                <div className="text-sm leading-5 font-sans font-medium ">
                  {OrganizationInfo?.sRenewalDate}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationInfo;
