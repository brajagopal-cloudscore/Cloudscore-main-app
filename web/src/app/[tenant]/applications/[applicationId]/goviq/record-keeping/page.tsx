"use client";

import { use } from "react";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFieldComponent } from "@/components/common/FormFieldComponent";
import { useDocumentation } from "@/hooks/use-documentation";
import { Separator } from "@/components/ui/separator";
const formSchema = z.object({
  performanceCriteria: z.string().optional(),
  loggingPolicies: z.string().optional(),
  modelTesting: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default function GovIQRecordKeepingPage({ params }: PageProps) {
  const { tenant, applicationId } = use(params);

  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant,
    applicationId,
    sectionType: "record_keeping",
    schema: formSchema,
    riskId: null,
    initialValues: {
      performanceCriteria: "",
      loggingPolicies: "",
      modelTesting: "",
    },
    fieldDefinitions: [
      { key: "performanceCriteria", title: "Performance Criteria" },
      { key: "loggingPolicies", title: "Logging Policies" },
      { key: "modelTesting", title: "Model Testing" },
    ],
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold  my-2">Record Keeping</h1>
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
              name="performanceCriteria"
              label="What performance criteria have been established for the AI application? How were these criteria determined, and how do they relate to the application's objectives?"
              placeholder="Describe the specific performance metrics, KPIs, and success criteria established for the AI application, including methodology for determining these criteria and their alignment with business objectives..."
              description="Describe the performance criteria and how they were determined."
            />
            <Separator></Separator>
            <FormFieldComponent
              control={form.control as any}
              name="loggingPolicies"
              label="Describe the policies and procedures in place for retaining automatically generated logs for a minimum of six months to ensure adequate data tracking and auditability."
              placeholder="Detail logging policies, data retention procedures, storage systems, and audit trail mechanisms that ensure comprehensive tracking for at least six months..."
              description="Explain your logging and retention policies."
            />
            <Separator></Separator>
            <FormFieldComponent
              control={form.control as any}
              name="modelTesting"
              label="How has your organization tested the model's performance on extreme values and protected attributes? What were the results of these tests, and how have they informed further development?"
              placeholder="Explain testing methodologies for edge cases and protected attributes, present test results, and describe how findings have influenced model improvements and development decisions..."
              description="Describe your model testing approach and results."
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
