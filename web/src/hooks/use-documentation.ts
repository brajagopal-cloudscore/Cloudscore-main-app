/**
 * Custom hook for managing application documentation forms
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { isEqual } from "lodash";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  getDocumentation,
  upsertDocumentation,
} from "@/lib/actions/documentation";
import type { UpsertDocumentationField } from "@/lib/actions/documentation";
import { errorToast, successToast } from "@/lib/utils/toast";

interface UseDocumentationProps<T extends Record<string, unknown>> {
  tenant: string;
  applicationId: string;
  riskId: string | null;
  sectionType: string;
  schema: z.ZodSchema<T>;
  initialValues: T;
  fieldDefinitions: Array<{
    key: keyof T;
    title: string;
  }>;
  enabled?: boolean; // Whether the hook is enabled (e.g., if tenant/appId are available)
}

interface UseDocumentationReturn<T extends Record<string, unknown>> {
  form: ReturnType<typeof useForm<any>>;
  isLoading: boolean;
  isInitialLoad: boolean;
  onSubmit: (values: T) => Promise<void>;
}

/**
 * Custom hook that manages documentation form state, auto-save, and database sync
 */
export function useDocumentation<T extends Record<string, unknown>>({
  tenant,
  applicationId,
  sectionType,
  schema,
  riskId,
  initialValues,
  fieldDefinitions,
  enabled = true,
}: UseDocumentationProps<T>): UseDocumentationReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [formInitialValues, setFormInitialValues] = useState<T>(initialValues);

  const form = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: formInitialValues as any,
  });

  // Load initial data from database
  const loadInitialData = useCallback(async () => {
    if (!enabled || !tenant || !applicationId) {
      setIsInitialLoad(false);
      return;
    }

    try {
      const data = await getDocumentation({
        tenantId: tenant,
        applicationId,
        riskId,
        sectionType,
      });

      if (Array.isArray(data) && data.length > 0) {
        const fieldsMap = { ...initialValues };
        for (const field of data as any[]) {
          if (field.fieldKey in fieldsMap) {
            (fieldsMap as Record<string, unknown>)[field.fieldKey] =
              field.content || "";
          }
        }
        setFormInitialValues(fieldsMap as T);
        form.reset(fieldsMap as T);
      }
    } catch (error) {
      console.error("Failed to load documentation:", error);
      // Continue with default values
    } finally {
      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tenant, applicationId, sectionType]);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Auto-save on debounced value changes
  const currentValue = form.watch();
  const [debouncedValue] = useDebounce(currentValue, 500, {
    equalityFn: isEqual,
  });

  // Manual save function
  const onSubmit = useCallback(
    async (values: T) => {
      if (!enabled || !tenant || !applicationId) {
        toast.error("Missing required parameters");
        return;
      }

      setIsLoading(true);
      try {
        const fields: UpsertDocumentationField[] = fieldDefinitions.map(
          (def) => ({
            fieldKey: String(def.key),
            fieldTitle: def.title,
            content: String(values[def.key] || ""),
          })
        );

        await upsertDocumentation({
          tenantId: tenant,
          applicationId,
          sectionType,
          riskId,
          fields,
        });

        // Refetch documentation after successful save to ensure UI is in sync
        await loadInitialData();

        successToast("", "", "", "Data has been saved successfully!");
      } catch (error) {
        console.error("Failed to save data:", error);
        errorToast("Failed to save data");
      } finally {
        setIsLoading(false);
      }
    },
    [
      enabled,
      tenant,
      applicationId,
      sectionType,
      fieldDefinitions,
      loadInitialData,
    ]
  );

  return {
    form,
    isLoading,
    isInitialLoad,
    onSubmit,
  };
}
