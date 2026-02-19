"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form as FormWrapper,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSubmittion } from "./hook";
import { useISO_42001ComplianceTracking } from "../provider";

const formSchema = z
  .object({
    documentName: z.string().min(2).max(50),
    documentUrl: z
      .string()
      .url({ message: "Please add a valid URL" })
      .optional()
      .or(z.literal("")),
    documentFile: z
      .any()
      .optional()
      .refine(
        (file) => {
          if (!file || file.length === 0) return true;
          if (!(file instanceof FileList)) return false;
          if (file.length !== 1) return false;
          const allowedTypes = ["application/pdf"];
          return allowedTypes.includes(file[0].type);
        },
        { message: "Only one PDF file is allowed" }
      ),
    status: z.enum(["Draft", "In Review", "Approved", "Rejected", "Pending"], {
      message: "Please select a valid enum",
    }),
    // .refine((val) => !!val, { message: "Please select a status" }),
    owner: z.string().min(1, { message: "Please add an owner" }),
    dueDate: z.string().min(1, { message: "Please add a due date" }),
    reviews: z.string().min(1, { message: "Please add a reviewer" }),
    reviewDate: z.string().min(1, { message: "Please add a review date" }),
    notes: z.string(),
  })
  .refine(
    (data) =>
      data.documentUrl || (data.documentFile && data.documentFile.length > 0),
    {
      message: "Either Document URL or Document File is required",
      path: ["documentUrl"],
    }
  );

export default function Form({
  close,
  label,
}: {
  close: Function;
  label: string;
}) {
  const { onSubmit } = useSubmittion();
  const { data } = useISO_42001ComplianceTracking();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentName: data[label]?.documentName || "",
      documentUrl: data[label]?.documentUrl || "",
      notes: data[label]?.notes || "",
      status:
        (data[label]?.status as
          | "Draft"
          | "In Review"
          | "Approved"
          | "Rejected"
          | "Pending") || "Pending",
      owner: data[label]?.owner || "",
      reviews: data[label]?.reviews || "",
      reviewDate:
        data[label]?.reviewDate || new Date().toISOString().slice(0, 16),
      dueDate: data[label]?.dueDate || new Date().toISOString().slice(0, 16),
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(label, values);
    close();
  };

  return (
    <FormWrapper {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 !text-black"
      >
        <FormField
          control={form.control}
          name="documentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter document name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter document URL..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 1) {
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(files[0]);
                      e.target.files = dataTransfer.files;
                    }
                    field.onChange(e.target.files);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="owner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner</FormLabel>
                <FormControl>
                  <Input placeholder="Enter owner name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reviews"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review</FormLabel>
                <FormControl>
                  <Input placeholder="Enter review name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reviewDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            className="gap-2 w-full"
            type="button"
            variant={"outline"}
            onClick={() => close()}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="gap-2 !bg-black hover:bg-[#141414] w-full"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            Submit
          </Button>
        </div>
      </form>
    </FormWrapper>
  );
}
