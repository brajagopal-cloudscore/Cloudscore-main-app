"use client";
import React from "react";
import { Risk } from "./type";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function View({ risk }: { risk: Risk }) {
  const router = useRouter();
  return (
    <>
      <Button variant={"outline"} onClick={() => router.back()}>
        <ChevronLeft></ChevronLeft>
        Back
      </Button>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">{risk.riskName}</h1>
        <p className="text-muted-foreground">{risk.description}</p>
      </div>
    </>
  );
}
