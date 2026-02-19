"use client";

import { z } from "zod";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFieldComponent } from "@/components/common/FormFieldComponent";
import { useDocumentation } from "@/hooks/use-documentation";
import { Separator } from "../ui/separator";
interface ApplicationScopeFormProps {
  tenant?: string;
  applicationId?: string;
}

const formSchema = z.object({
  aiUsed: z.string().optional(),
  newFormOfAI: z.string().optional(),
  needsPrivacy: z.string().optional(),
  applicationScope: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ApplicationScopeForm({
  tenant,
  applicationId,
}: ApplicationScopeFormProps = {}) {
  const params = useParams();
  const resolvedTenant = tenant || (params.tenant as string);
  const resolvedApplicationId =
    applicationId || (params.applicationId as string);

  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant: resolvedTenant,
    applicationId: resolvedApplicationId,
    sectionType: "application_scope",
    riskId: null,
    schema: formSchema,
    initialValues: {
      aiUsed: "",
      newFormOfAI: "",
      needsPrivacy: "",
      applicationScope: "",
    },
    fieldDefinitions: [
      { key: "aiUsed", title: "AI Environment/Application Used" },
      { key: "newFormOfAI", title: "New Form of AI Technology" },
      { key: "needsPrivacy", title: "Personal Sensitive Data Used" },
      { key: "applicationScope", title: "Application Scope Documents" },
    ],
    enabled: !!(resolvedTenant && resolvedApplicationId),
  });

  return (
    <Form {...form}>
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }
        }}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 !">
          <FormFieldComponent
            control={form.control as any}
            name="aiUsed"
            label="Describe the AI environment/application used"
            placeholder="Describe the AI environment/application used..."
            description="Provide details about the environment hosting the AI."
          />
          <Separator></Separator>
          <FormFieldComponent
            control={form.control as any}
            name="newFormOfAI"
            label="Is a new form of AI technology used?"
            placeholder="Explain if this uses a novel AI technology..."
            description="Specify if the application leverages technologies not previously used in your organisation."
          />
          <Separator></Separator>
          <FormFieldComponent
            control={form.control as any}
            name="needsPrivacy"
            label="Are personal sensitive data used?"
            placeholder="Describe the type of sensitive data involved..."
            description="Detail the privacy considerations and type of sensitive data processed."
          />
          <Separator></Separator>
          <FormFieldComponent
            control={form.control as any}
            name="applicationScope"
            label="Application scope documents description"
            placeholder="Provide a description of the application's overall scope..."
            description="A high-level overview of the application's boundaries and goals."
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>
    </Form>
  );
}
