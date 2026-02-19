"use client";

import { useEffect } from "react";
import { Loader } from "lucide-react";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useUserRole } from "@/hooks/useUserRole";

interface Props {
  isOpen: boolean;
  mode: "create" | "edit" | "view";
  application?: {
    id: string;
    name: string;
    description?: string | null;
    goviqEnabled: boolean;
    controlnetEnabled: boolean;
    status?: "Not Started" | "In Progress" | "Completed" | "Archived";
  } | null;
  onClose: () => void;
  onSubmit?: (data: {
    name: string;
    description?: string;
    goviqEnabled: boolean;
    controlnetEnabled: boolean;
    status?: "Not Started" | "In Progress" | "Completed" | "Archived";
  }) => Promise<void>;
  isPending: boolean;
}

/* ------------------------ ZOD VALIDATION SCHEMA ------------------------ */

const formSchema = z
  .object({
    name: z.string().min(1, "Application name is required"),
    description: z.string().optional(),
    goviqEnabled: z.boolean(),
    controlnetEnabled: z.boolean(),
    status: z.enum(["Not Started", "In Progress", "Completed", "Archived"]),
  })
  .refine((data) => data.goviqEnabled || data.controlnetEnabled, {
    message: "At least one module must be enabled",
    path: ["modules"],
  });

/* ------------------------------ COMPONENT ------------------------------- */

export function ApplicationModal({
  isOpen,
  mode,
  application,
  onClose,
  onSubmit,
  isPending,
}: Props) {
  const { isAdmin } = useUserRole();
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const title = isViewMode
    ? "View Application"
    : isEditMode
      ? "Edit Application"
      : "Create Application";

  const saveButtonText = isEditMode ? "Save" : "Create";
  const loadingText = isEditMode ? "Saving..." : "Creating...";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      goviqEnabled: false,
      controlnetEnabled: true,
      status: "Not Started",
    },
  });

  /* -------------------------- LOAD INITIAL DATA -------------------------- */

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      if (application) {
        form.reset({
          name: application.name,
          description: application.description || "",
          goviqEnabled: application.goviqEnabled,
          controlnetEnabled: application.controlnetEnabled,
          status: application.status || "Not Started",
        });
      }
    } else if (mode === "create") {
      form.reset({
        name: "",
        description: "",
        goviqEnabled: false,
        controlnetEnabled: true,
        status: "Not Started",
      });
    }
  }, [mode, application, isOpen]);

  /* ------------------------------ SUBMIT LOGIC --------------------------- */

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isViewMode || !onSubmit) return;

    try {
      await onSubmit(values);
    } catch (error: any) {
      form.setError("root", {
        message: error.message || "Failed to save application",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTitle className="sr-only">{title}</DialogTitle>

      <DialogContent className="sm:max-w-[600px] p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="p-6 space-y-6">
              {/* ------------------------------ NAME FIELD ------------------------------ */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Name*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter application name"
                        disabled={isViewMode}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ------------------------------ DESCRIPTION --------------------------- */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Describe your application"
                        disabled={isViewMode}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ------------------------------ MODULES ------------------------------- */}
              <div className="space-y-2 hidden">
                <Label className="text-sm font-medium flex items-end">
                  Modules*
                  <span className="text-muted-foreground text-xs ml-1">
                    (Select at least one)
                  </span>
                </Label>

                <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted">
                  {/* GovIQ */}
                  <FormField
                    control={form.control}
                    name="goviqEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormLabel className="text-sm text-muted-foreground">
                          GovIQ
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isViewMode || !isAdmin}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* ControlNet */}
                  <FormField
                    control={form.control}
                    name="controlnetEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormLabel className="text-sm text-muted-foreground">
                          ControlNet
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isViewMode}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormMessage>
                  {form.formState.errors.goviqEnabled?.message}
                </FormMessage>
              </div>

              {form.formState.errors.root && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.root.message}
                </p>
              )}
            </div>

            <DialogFooter className="p-6 pt-4 border-t">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={isPending}
              >
                {isViewMode ? "Close" : "Cancel"}
              </Button>

              {!isViewMode && (
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {loadingText}
                    </>
                  ) : (
                    saveButtonText
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
