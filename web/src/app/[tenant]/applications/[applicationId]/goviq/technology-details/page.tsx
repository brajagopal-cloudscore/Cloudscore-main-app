"use client";

import { use } from "react";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFieldComponent } from "@/components/common/FormFieldComponent";
import { useDocumentation } from "@/hooks/use-documentation";
import { Separator } from "@/components/ui/separator";
const formSchema = z.object({
  aiTechnology: z.string().optional(),
  ongoingMonitoring: z.string().optional(),
  unintendedOutcomes: z.string().optional(),
  technologyDocumentation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default function GovIQTechnologyDetailsPage({ params }: PageProps) {
  const { tenant, applicationId } = use(params);

  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant,
    applicationId,
    sectionType: "technology_details",
    schema: formSchema,
    riskId: null,
    initialValues: {
      aiTechnology: "",
      ongoingMonitoring: "",
      unintendedOutcomes: "",
      technologyDocumentation: "",
    },
    fieldDefinitions: [
      { key: "aiTechnology", title: "AI Technology Used" },
      { key: "ongoingMonitoring", title: "Ongoing Monitoring" },
      { key: "unintendedOutcomes", title: "Unintended Outcomes" },
      { key: "technologyDocumentation", title: "Technology Documentation" },
    ],
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold my-2">Technology Details</h1>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 !">
            <FormFieldComponent
              control={form.control as any}
              name="aiTechnology"
              label="What type of AI technology are you using? Explain AI and ML technologies used."
              placeholder="Describe the specific AI and ML technologies, frameworks, models, and methodologies being used in your application..."
              description="Provide details about the AI and ML technologies in your application."
            />
            <Separator></Separator>
            <FormFieldComponent
              control={form.control as any}
              name="ongoingMonitoring"
              label="Is there ongoing monitoring of the system to ensure that the system is operating as intended?"
              placeholder="Explain the monitoring systems, metrics, and processes in place to track system performance and ensure proper operation..."
              description="Describe your system monitoring and performance tracking mechanisms."
            />
            <Separator></Separator>
            <FormFieldComponent
              control={form.control as any}
              name="unintendedOutcomes"
              label="Have you considered unintended outcomes that could occur from the use of this system?"
              placeholder="Detail potential unintended consequences, edge cases, and risk scenarios that have been identified and considered..."
              description="Outline potential risks and unintended consequences of your system."
            />
            <Separator></Separator>
            <FormFieldComponent
              control={form.control as any}
              name="technologyDocumentation"
              label="Add technology documentation. You can include a data flow diagram, MLops lifecycle diagram. Think of it as an executive summary of the technology you are using."
              placeholder="Provide comprehensive technology documentation including architecture diagrams, data flows, MLops processes, and executive summary of your technology stack..."
              description="Provide comprehensive documentation of your technology architecture."
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
