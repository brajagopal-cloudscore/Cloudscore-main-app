"use client";

import { useTenant } from "@/contexts/TenantContext";
import { useParams } from "next/navigation";
import OpsTabs from "@/components/ops/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Router, Upload, TestTube2, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OpsPage() {
  const params = useParams();
  const tenant = params.tenant as string;
  const { tenant: tenantData } = useTenant();

  return (
    <>
      {/* <OpsTabs /> */}
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold ">Operations</h1>
          <p className="text-muted-foreground mt-2">
            Manage router configuration and test prompts
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="h-5 w-5" />
                Test Prompts
              </CardTitle>
              <CardDescription>
                Test how prompts are routed to different guardrail families
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/${tenant}/ops/router-test`}>
                <Button className="w-full">
                  <Router className="mr-2 h-4 w-4" />
                  Open Test Page
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Router Training
              </CardTitle>
              <CardDescription>
                Configure centroids and seed prompts for intelligent routing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/${tenant}/ops/router-training`}>
                <Button className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Configure Router
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                View Models
              </CardTitle>
              <CardDescription>Browse and manage ONNX models</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/${tenant}/ops/models`}>
                <Button className="w-full">
                  <Database className="mr-2 h-4 w-4" />
                  Open Models
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
