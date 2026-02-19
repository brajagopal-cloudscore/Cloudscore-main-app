import { db, riskMitigationStatus, risks } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Tab from "./_components/tabs";
import { Risk } from "./type";
import View from "./view";
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  const risk = (await db.query.risks.findFirst({
    where: eq(risks.id, id),
    with: {
      useCase: {
        columns: { id: true, whatItDoes: true, useCase: true },
      },
      ownerUser: {
        columns: { name: true, email: true },
      },
      controlOwnerUser: {
        columns: { name: true, email: true },
      },
    },
  })) as Risk;

  if (!risk) return notFound();

  return (
    <div className="p-8 space-y-10">
      <div className="flex gap-2 items-center">
        <View risk={risk}></View >
      </div>
      <Tab risk={risk}></Tab>
    </div>
  );
}
