"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form as FormWrapper,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  documentName: z.string().min(2).max(50),
  documentUrl: z
    .url({ message: "Please add a valid URL" })
    .min(1, { message: "Please add a URL" }),
  status: z.string(),
  owner: z.string().min(1, { message: "Please add a owner" }),
  notes: z.string(),
  reviews: z.string(),
  reviewDate: z.string(),
  dueDate: z.string(),
});
import { useSubmittion } from "./hook";
import { useEUComplianceTracking } from "../provider";

export default function Form({
  close,
  label,
}: {
  close: Function;
  label: string;
}) {
  // 1. Define your form.
  const { onSubmit } = useSubmittion();
  const { data } = useEUComplianceTracking();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentName: data[label] ? data[label].documentName : "",
      documentUrl: data[label] ? data[label].documentUrl : "",
      notes: data[label] ? data[label].notes : "",
      owner: data[label] ? data[label].owner : "",
      reviews: data[label] ? data[label].reviews : "",
      reviewDate: data[label]
        ? data[label].reviewDate
        : new Date().toISOString().slice(0, 16),
      dueDate: data[label]
        ? data[label].dueDate
        : new Date().toISOString().slice(0, 16),
    },
  });

  const handleSubmit = (data: any) => {
    onSubmit(label, data);
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
                <Input placeholder="Enter document url..." {...field} />
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
                <Input placeholder="Enter upload status..." {...field} />
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
                <Textarea className="" placeholder="...."></Textarea>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            className="gap-2  w-full"
            type="button"
            variant={"outline"}
            onClick={() => close()}
            disabled={form.formState.isSubmitting || form.formState.isLoading}
          >
            Cancel
          </Button>
          <Button
            className="gap-2 !bg-black hover:bg-[#141414] w-full"
            type="submit"
            disabled={form.formState.isSubmitting || form.formState.isLoading}
          >
            Submit
          </Button>
        </div>
      </form>
    </FormWrapper>
  );
}
