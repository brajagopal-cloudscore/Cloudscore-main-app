"use client";

import { use } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFieldComponent } from "@/components/common/FormFieldComponent";
import { useDocumentation } from "@/hooks/use-documentation";

const formSchema = z.object({
  primaryObjectives: z.string().optional(),
  businessProcessLogic: z.string().optional(),
  operationExplanation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
  params?: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default function GovIQExplainabilityPage({ params }: PageProps) {
  // Get params from route if not provided as props
  const routeParams = useParams();
  const resolvedParams = params ? use(params) : null;
  const tenant = (resolvedParams?.tenant || routeParams?.tenant) as string;
  const applicationId = (resolvedParams?.applicationId ||
    routeParams?.applicationId) as string;

  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant,
    applicationId,
    sectionType: "explainability",
    schema: formSchema,
    riskId: routeParams.id?.toString() || null,
    initialValues: {
      primaryObjectives: "",
      businessProcessLogic: "",
      operationExplanation: "",
    },
    fieldDefinitions: [
      { key: "primaryObjectives", title: "Primary Objectives" },
      { key: "businessProcessLogic", title: "Business Process Logic" },
      { key: "operationExplanation", title: "Operation Explanation" },
    ],
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold my-2">Explainability</h1>
      </div>
      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 !">
          <FormFieldComponent
            control={form.control as any}
            name="primaryObjectives"
            label="What are the primary objectives of your AI application? How do these objectives align with your organization's overall mission and values?"
            placeholder="Describe the main goals and objectives of your AI application, how they support business strategy, and alignment with organizational mission and core values..."
            description="Describe the main goals and objectives of your AI application."
          />

          <FormFieldComponent
            control={form.control as any}
            name="businessProcessLogic"
            label="Provide the high-level business process logic of the AI system. Is it possible to explain the inner workings of the AI system to the end-user by linking specific responses to the source data or documents? Outline any Explainable AI (XAI) model used, with respect to both local and global explainability."
            placeholder="Detail the business process flow, decision-making logic, data processing steps, XAI implementations (LIME, SHAP, etc.), traceability mechanisms, and both local (individual prediction) and global (model behavior) explainability features..."
            description="Detail the business process flow and XAI implementations."
          />

          <FormFieldComponent
            control={form.control as any}
            name="operationExplanation"
            label="To what extent can the operation of the application/algorithm be explained to end users and those involved?"
            placeholder="Describe the level of transparency provided to different stakeholder groups, explanation interfaces, user-friendly documentation, and communication strategies for technical and non-technical audiences..."
            description="Describe the level of transparency provided to different stakeholder groups."
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
}
