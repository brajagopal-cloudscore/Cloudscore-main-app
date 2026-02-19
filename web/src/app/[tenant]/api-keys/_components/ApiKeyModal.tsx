"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isPending: boolean;
}

/* ----------------------- ZOD VALIDATION ----------------------- */

const formSchema = z.object({
  name: z.string().min(1, "Key name is required"),
});

/* ------------------------- COMPONENT -------------------------- */

export function ApiKeyModal({ isOpen, onClose, onSubmit, isPending }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await onSubmit({
        name: values.name,
      });

      form.reset();
    } catch (error: any) {
      form.setError("root", {
        message: error.message || "Failed to create API key",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for programmatic access.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* ------------------------- NAME FIELD ------------------------- */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Production API Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ----------------------- ROOT ERROR ------------------------- */}
            {form.formState.errors.root?.message && (
              <p className="text-sm text-red-600">
                {form.formState.errors.root.message}
              </p>
            )}

            {/* -------------------------- ACTIONS ------------------------- */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Key"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
