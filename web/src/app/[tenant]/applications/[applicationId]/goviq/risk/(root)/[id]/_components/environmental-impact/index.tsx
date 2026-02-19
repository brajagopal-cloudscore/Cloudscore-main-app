"use client";

import { use } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFieldComponent } from "@/components/common/FormFieldComponent";
import { useDocumentation } from "@/hooks/use-documentation";

const formSchema = z.object({
  impactAssessment: z.string().optional(),
  environmentalEffects: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
  params?: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default function GovIQEnvironmentalImpactPage({ params }: PageProps) {
  // Get params from route if not provided as props
  const routeParams = useParams();
  const resolvedParams = params ? use(params) : null;
  const tenant = (resolvedParams?.tenant || routeParams?.tenant) as string;
  const applicationId = (resolvedParams?.applicationId ||
    routeParams?.applicationId) as string;

  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant,
    applicationId,
    sectionType: "environmental_impact",
    schema: formSchema,
    riskId: routeParams.id?.toString() || null,
    initialValues: {
      impactAssessment: "",
      environmentalEffects: "",
    },
    fieldDefinitions: [
      { key: "impactAssessment", title: "Impact Assessment" },
      { key: "environmentalEffects", title: "Environmental Effects" },
    ],
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold my-2">Environmental Impact</h1>
      </div>
      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 !">
          <FormFieldComponent
            control={form.control as any}
            name="impactAssessment"
            label="How has your organization assessed the overall environmental impact of this AI application? What factors were considered in this assessment?"
            placeholder="Describe the methodology used for environmental impact assessment, including factors like energy consumption, carbon footprint, computational resources, data center usage, hardware lifecycle, and sustainability metrics evaluated..."
            description="Describe the methodology used for environmental impact assessment."
          />

          <FormFieldComponent
            control={form.control as any}
            name="environmentalEffects"
            label="What are the environmental effects of the AI application? How are these effects measured and mitigated?"
            placeholder="Detail specific environmental impacts identified (energy usage, emissions, resource consumption), measurement methods and tools used, mitigation strategies implemented, and ongoing monitoring practices..."
            description="Detail specific environmental impacts and mitigation strategies."
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
}
