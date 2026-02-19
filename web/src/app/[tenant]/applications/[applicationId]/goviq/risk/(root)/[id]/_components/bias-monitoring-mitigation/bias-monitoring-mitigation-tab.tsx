"use client";

import { useParams } from "next/navigation";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFieldComponent } from "@/components/common/FormFieldComponent";
import { useDocumentation } from "@/hooks/use-documentation";

const formSchema = z.object({
  biasAddressing: z.string().optional(),
  groupAnalysis: z.string().optional(),
  vulnerablePopulations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BiasMonitoringTabProps {
  tenant?: string;
  applicationId?: string;
}

export const BiasMonitoringTab: React.FC<BiasMonitoringTabProps> = ({
  tenant: tenantProp,
  applicationId: applicationIdProp,
}) => {
  // Get params from route if not provided as props
  const params = useParams();
  const tenant = tenantProp || (params?.tenant as string);
  const applicationId = applicationIdProp || (params?.applicationId as string);
  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant,
    applicationId,
    sectionType: "bias_monitoring_mitigation",
    schema: formSchema,
    riskId: params.id?.toString() || null,
    initialValues: {
      biasAddressing: "",
      groupAnalysis: "",
      vulnerablePopulations: "",
    },
    fieldDefinitions: [
      { key: "biasAddressing", title: "Bias Addressing" },
      { key: "groupAnalysis", title: "Group Analysis" },
      { key: "vulnerablePopulations", title: "Vulnerable Populations" },
    ],
  });

  return (
    <div className="m-4">
      <div className="h-screen overflow-y-auto scrollbar-hide scroll-smooth w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold my-2">
            Bias Monitoring and Mitigation
          </h1>
        </div>

        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormFieldComponent
              control={form.control as any}
              name="biasAddressing"
              label="What measures have been undertaken to address bias in the AI system's training data, and what guardrails are in place to ensure non-discriminatory responses?"
              placeholder="Describe bias detection methods, data preprocessing techniques, fairness metrics, and guardrails implemented to prevent discriminatory outcomes..."
              description="Describe bias detection methods and guardrails implemented."
            />

            <FormFieldComponent
              control={form.control as any}
              name="groupAnalysis"
              label="Are there specific groups that are favored or disadvantaged in the context where the AI application is used? How has this been assessed and addressed?"
              placeholder="Detail analysis of differential impacts across demographic groups, assessment methodologies, identified disparities, and corrective measures taken..."
              description="Detail analysis of differential impacts across demographic groups."
            />

            <FormFieldComponent
              control={form.control as any}
              name="vulnerablePopulations"
              label="Is your user base comprised of individuals or groups from vulnerable populations? If so, what special considerations or protections have been put in place?"
              placeholder="Identify vulnerable user populations, describe special protections, additional safeguards, and ethical considerations for these groups..."
              description="Identify vulnerable user populations and special protections."
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BiasMonitoringTab;
