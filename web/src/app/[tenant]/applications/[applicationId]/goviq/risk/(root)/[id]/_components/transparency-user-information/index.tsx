"use client";

import { use } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFieldComponent } from "@/components/common/FormFieldComponent";
import { useDocumentation } from "@/hooks/use-documentation";

const formSchema = z.object({
  userTraining: z.string().optional(),
  externalCommunication: z.string().optional(),
  decisionMakingInfo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
  params?: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}

export default function GovIQTransparencyUserInformationPage({
  params,
}: PageProps) {
  // Get params from route if not provided as props
  const routeParams = useParams();

  const resolvedParams = params ? use(params) : null;
  const tenant = (resolvedParams?.tenant || routeParams?.tenant) as string;
  const applicationId = (resolvedParams?.applicationId ||
    routeParams?.applicationId) as string;

  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant,
    applicationId,
    riskId: routeParams.id?.toString() || null,
    sectionType: "transparency",
    schema: formSchema,
    initialValues: {
      userTraining: "",
      externalCommunication: "",
      decisionMakingInfo: "",
    },
    fieldDefinitions: [
      { key: "userTraining", title: "User Training" },
      { key: "externalCommunication", title: "External Communication" },
      { key: "decisionMakingInfo", title: "Decision Making Information" },
    ],
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold my-2">
          Transparency & User Information
        </h1>
      </div>
      <Form {...(form as any)}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 !">
          <FormFieldComponent
            control={form.control as any}
            name="userTraining"
            label="Have users been adequately trained on the appropriate usage of the AI system, and is documentation readily available to all users?"
            placeholder="Describe user training programs, documentation availability, training materials, and ongoing support provided to ensure proper AI system usage..."
            description="Describe user training programs and documentation availability."
          />

          <FormFieldComponent
            control={form.control as any}
            name="externalCommunication"
            label="In what ways has your organization communicated these AI-related values externally? How effective have these communication efforts been?"
            placeholder="Detail external communication strategies, channels used, stakeholder engagement, and assessment of communication effectiveness regarding AI values and principles..."
            description="Detail external communication strategies and their effectiveness."
          />

          <FormFieldComponent
            control={form.control as any}
            name="decisionMakingInfo"
            label="If the AI system performs automated decision-making using personal data, is there meaningful information provided about the logic involved, the significance, and the envisaged consequences for data subjects?"
            placeholder="Explain how decision-making logic is communicated to users, transparency measures for automated decisions, and information provided about potential consequences for individuals..."
            description="Explain how decision-making logic is communicated to users."
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </>
  );
}
