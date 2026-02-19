"use client";

import { use } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFieldComponent } from "@/components/common/FormFieldComponent";
import { useDocumentation } from "@/hooks/use-documentation";

const formSchema = z.object({
  supervisionDesign: z.string().optional(),
  oversightEffectiveness: z.string().optional(),
  periodicReviews: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
  params?: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default function GovIQHumanOversightPage({ params }: PageProps) {
  // Get params from route if not provided as props
  const routeParams = useParams();
  const resolvedParams = params ? use(params) : null;
  const tenant = (resolvedParams?.tenant || routeParams?.tenant) as string;
  const applicationId = (resolvedParams?.applicationId ||
    routeParams?.applicationId) as string;

  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant,
    applicationId,
    sectionType: "human_oversight",
    schema: formSchema,
    riskId: routeParams.id?.toString() || null,
    initialValues: {
      supervisionDesign: "",
      oversightEffectiveness: "",
      periodicReviews: "",
    },
    fieldDefinitions: [
      { key: "supervisionDesign", title: "Supervision Design" },
      { key: "oversightEffectiveness", title: "Oversight Effectiveness" },
      { key: "periodicReviews", title: "Periodic Reviews" },
    ],
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold my-2">Human Oversight</h1>
      </div>
      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 !">
          <FormFieldComponent
            control={form.control as any}
            name="supervisionDesign"
            label="How is the supervision of the AI system designed to ensure human oversight wherever the AI solution could take or influence key decisions?"
            placeholder="Describe the supervision framework, human-in-the-loop processes, decision checkpoints, and oversight mechanisms for critical AI decisions..."
            description="Describe the supervision framework and human oversight mechanisms."
          />

          <FormFieldComponent
            control={form.control as any}
            name="oversightEffectiveness"
            label="How is the effectiveness of human oversight ensured, including having sufficient knowledge to interpret the system's outputs, understand automation bias, and mitigate fundamental risks?"
            placeholder="Detail training programs for oversight personnel, competency requirements, bias awareness training, and risk mitigation protocols..."
            description="Detail training programs and competency requirements for oversight personnel."
          />

          <FormFieldComponent
            control={form.control as any}
            name="periodicReviews"
            label="What is your organization's strategy for conducting periodic reviews of the AI application with regard to ethical values? Who will be involved in these reviews?"
            placeholder="Outline periodic review processes, ethical evaluation frameworks, review schedules, stakeholder involvement, and governance structures..."
            description="Outline periodic review processes and stakeholder involvement."
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
}
