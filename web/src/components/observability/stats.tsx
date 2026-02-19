import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Shield,
  Network,
  ShieldCheck,
  ShieldBan,
  GitPullRequestArrow,
  Package,
  AppWindow,
  Clock,
} from "lucide-react";
import { useTenantStats } from "@/store/tenantLogs.store";
import Loading from "./loading";

export default function Stats() {
  const { data, isLoading } = useTenantStats();
  if (!data || isLoading) {
    return <Loading />;
  }
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 h-fit">
        <Card className="shadow-sm border  ">
          <CardHeader className="">
            <div className="flex items-center gap-2">
              <AppWindow className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Applications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.applications}</p>
            <p className="text-sm text-muted-foreground">
              Applications in organisation
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border ">
          <CardHeader className="">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Policies</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.policies}</p>
            <p className="text-sm text-muted-foreground">
              Active configurations
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border  h-fit">
          <CardHeader className="">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Guardrails</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.guardrails}</p>
            <p className="text-sm text-muted-foreground">
              Applied across endpoints
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border  h-fit">
          <CardHeader className="">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Models</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.models}</p>
            <p className="text-sm text-muted-foreground">Operational Models</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border  ">
          <CardHeader className="">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Average Latency</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.averageLatency} ms</p>
            <p className="text-sm text-muted-foreground">
              Request Time (in ms)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border  h-fit">
          <CardHeader className="">
            <div className="flex items-center gap-2">
              <GitPullRequestArrow className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Request Count</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.requestCount}</p>
            <p className="text-sm text-muted-foreground">Request to Server</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border  col-span-2 ">
          <CardHeader className="">
            <div className="flex items-center gap-2">
              <GitPullRequestArrow className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Request Response</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center  text-muted-foreground">
                <ShieldCheck className="h-5 w-5 "></ShieldCheck>
                <p className="">Allowed</p>
              </div>
              <p className="">{data.allowCount}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center  text-red-600">
                <ShieldBan className="h-5 w-5 "></ShieldBan>
                <p className="">Blocked</p>
              </div>
              <p className="">{data.blockCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 hidden">
        <Card className="shadow-sm border  col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {" "}
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Recent Models</CardTitle>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {data.logs.slice(0, 3).map((ele, idx) => {
                const now = new Date();
                const timestamp = new Date(ele.timestamp);
                const diffMs = now.getTime() - timestamp.getTime();
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor(
                  (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                );

                const timeAgo =
                  diffHours > 0
                    ? `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
                    : diffMinutes > 0
                      ? `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
                      : "Just now";

                return (
                  <li className="flex justify-between" key={idx}>
                    <span className="font-medium text-muted-foreground">
                      {/* @ts-ignore */}
                      {ele.requestPayload.model}
                    </span>
                    <span className="text-muted-foreground">{`Requested ${timeAgo}`}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
