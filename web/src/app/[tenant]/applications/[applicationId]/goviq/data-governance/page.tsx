"use client";

import { use } from "react";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFieldComponent } from "@/components/common/FormFieldComponent";
import { useDocumentation } from "@/hooks/use-documentation";
import { Separator } from "@/components/ui/separator";
const formSchema = z.object({
  deploymentRisks: z.string().optional(),
  dataHostLocation: z.string().optional(),
  behaviorDetection: z.string().optional(),
  unforeseenEffects: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default function GovIQDataGovernancePage({ params }: PageProps) {
  const { tenant, applicationId } = use(params);

  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant,
    applicationId,
    sectionType: "data_governance",
    riskId: null,
    schema: formSchema,
    initialValues: {
      deploymentRisks: "",
      dataHostLocation: "",
      behaviorDetection: "",
      unforeseenEffects: "",
    },
    fieldDefinitions: [
      { key: "deploymentRisks", title: "Deployment Risks" },
      { key: "dataHostLocation", title: "Data Host Location" },
      { key: "behaviorDetection", title: "Behavior Detection" },
      { key: "unforeseenEffects", title: "Unforeseen Effects" },
    ],
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold  my-2">Data Governance</h1>
      </div>
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // important, prevents ghost submits
            form.handleSubmit(onSubmit)();
          }
        }}
      >
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <FormFieldComponent
              control={form.control as any}
              name="deploymentRisks"
              label="What risks have been identified associated with the chosen deployment and serving strategies? How have these risks been prioritized?"
              placeholder="Detail the specific risks identified in your deployment and serving strategies, including how these risks were assessed and prioritized based on impact and likelihood..."
              description="Describe the deployment risks and how they were prioritized."
            />
            <Separator></Separator>
            <FormFieldComponent
              control={form.control as any}
              name="dataHostLocation"
              label="Where the data has been hosted?"
              placeholder="Select hosting location..."
              description="Select the hosting location of your data."
              fieldType="select"
              selectOptions={[
                { value: "aws", label: "AWS" },
                { value: "gcp", label: "Google Cloud" },
                { value: "azure", label: "Azure" },
              ]}
            />
            <Separator></Separator>
            <FormFieldComponent
              control={form.control as any}
              name="behaviorDetection"
              label="What measures are in place to detect undesired behavior in our AI solution, including logging and responding to such behavior?"
              placeholder="Describe monitoring systems, anomaly detection mechanisms, logging protocols, and response procedures for identifying and handling undesired AI behavior..."
              description="Explain your mechanisms for detecting undesired AI behavior."
            />
            <Separator></Separator>
            <FormFieldComponent
              control={form.control as any}
              name="unforeseenEffects"
              label="How can any unforeseen effects be mitigated after deployment of the AI application?"
              placeholder="Outline contingency plans, rollback procedures, rapid response protocols, and mitigation strategies for addressing unexpected issues post-deployment..."
              description="Describe your strategies for mitigating unforeseen effects post-deployment."
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
