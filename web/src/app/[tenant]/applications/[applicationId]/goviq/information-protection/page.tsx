"use client";

import { use } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDocumentation } from "@/hooks/use-documentation";
import { Separator } from "@/components/ui/separator";
// 🧩 Zod Schema
const formSchema = z.object({
  identifiedRisks: z.string().optional(),
  appRegistration: z.string().optional(),
  dataHosting: z
    .enum(
      [
        "None",
        "EU",
        "North America",
        "South America",
        "Asia",
        "Oceania",
        "Africa",
        "Other",
      ],
      { message: "Please select where data is hosted." }
    )
    .optional(),
  mitigationStrategies: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PageProps {
  params: Promise<{
    tenant: string;
    applicationId: string;
  }>;
}
export default function GovIQInformationProtectionPage({ params }: PageProps) {
  const { tenant, applicationId } = use(params);

  const { form, isLoading, onSubmit } = useDocumentation<FormValues>({
    tenant,
    applicationId,
    sectionType: "information_protection",
    schema: formSchema,
    riskId: null,
    initialValues: {
      identifiedRisks: "",
      dataHosting: "None",
      mitigationStrategies: "",
      appRegistration: "",
    },
    fieldDefinitions: [
      {
        key: "identifiedRisks",
        title:
          " What risks have been identified associated with the chosen deployment and serving strategies?",
      },
      { key: "dataHosting", title: "Where is the data hosted?" },
      {
        key: "mitigationStrategies",
        title:
          "Describe your strategies for mitigating unforeseen effects post-deployment.",
      },
      { key: "appRegistration", title: "App Registration EU Region" },
    ],
  });

  return (
    <div className="!text-black space-y-8">
      <h1 className="text-2xl font-semibold">
        Fundamental Rights Impact Assessment
      </h1>
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // important, prevents ghost submits
            form.handleSubmit(onSubmit)();
          }
        }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Identified Risks */}
            <FormField
              control={form.control}
              name="identifiedRisks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    What risks have been identified associated with the chosen
                    deployment and serving strategies?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe identified risks..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator></Separator>
            {/* Data Hosting Location */}
            <FormField
              control={form.control}
              name="dataHosting"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Where is the data hosted?</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="EU">Europe (EU)</SelectItem>
                        <SelectItem value="North America">
                          North America
                        </SelectItem>
                        <SelectItem value="South America">
                          South America
                        </SelectItem>
                        <SelectItem value="Asia">Asia</SelectItem>
                        <SelectItem value="Oceania">Oceania</SelectItem>
                        <SelectItem value="Africa">Africa</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator></Separator>
            {/* Mitigation Strategies */}
            <FormField
              control={form.control}
              name="mitigationStrategies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Describe your strategies for mitigating unforeseen effects
                    post-deployment.
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe mitigation measures..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator></Separator>
            <FormField
              control={form.control}
              name="appRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Registration EU Region</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="App Registration..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
