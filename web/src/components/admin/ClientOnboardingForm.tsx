// src/components/admin/ClientOnboardingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createClientOrganizationAction } from "@/actions/client-onboarding";

interface ClientOnboardingFormProps {
  onSuccess?: () => void;
}

interface FormData {
  clientName: string;
  clientEmail: string;
  clientSlug: string;
  plan: "free" | "pro" | "enterprise";
  metadata: {
    companySize?: string;
    industry?: string;
    notes?: string;
  };
}

export function ClientOnboardingForm({ onSuccess }: ClientOnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    clientEmail: "",
    clientSlug: "",
    plan: "free",
    metadata: {
      companySize: "",
      industry: "",
      notes: "",
    },
  });

  // Auto-generate slug from client name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Auto-generate slug when client name changes
      ...(field === "clientName" && { clientSlug: generateSlug(value) }),
    }));
  };

  const handleMetadataChange = (
    field: keyof FormData["metadata"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call Server Action directly (SSR) - no need for API route
      const result = await createClientOrganizationAction(formData);

      toast.success(result.message);

      // Reset form to allow creating another organization
      setFormData({
        clientName: "",
        clientEmail: "",
        clientSlug: "",
        plan: "free",
        metadata: {
          companySize: "",
          industry: "",
          notes: "",
        },
      });

      if (onSuccess) {
        onSuccess();
      }
      // Stay on the same page to create more organizations
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6  rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Create New Organization
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Name */}
        <div>
          <label
            htmlFor="clientName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Organization Name *
          </label>
          <input
            type="text"
            id="clientName"
            required
            value={formData.clientName}
            onChange={(e) => handleInputChange("clientName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter organization name"
          />
        </div>

        {/* Owner Email */}
        <div>
          <label
            htmlFor="clientEmail"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Owner Email *
          </label>
          <input
            type="email"
            id="clientEmail"
            required
            value={formData.clientEmail}
            onChange={(e) => handleInputChange("clientEmail", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-black  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="user@example.com"
          />
          <p className="text-sm text-gray-500 mt-1">
            This user will become the organization owner and receive an
            invitation email
          </p>
        </div>

        {/* Organization Slug */}
        <div>
          <label
            htmlFor="clientSlug"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Organization Slug (auto-generated)
          </label>
          <input
            type="text"
            id="clientSlug"
            value={formData.clientSlug}
            readOnly
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
            placeholder="auto-generated-slug"
          />
          <p className="text-sm text-gray-500 mt-1">
            URL-friendly identifier automatically generated from the
            organization name
          </p>
        </div>

        {/* Plan Selection */}
        <div>
          <label
            htmlFor="plan"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Plan
          </label>
          <select
            id="plan"
            value={formData.plan}
            onChange={(e) =>
              handleInputChange("plan", e.target.value as FormData["plan"])
            }
            className="w-full px-3 text-black  py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label
            htmlFor="companySize"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Company Size
          </label>
          <select
            id="companySize"
            value={formData.metadata.companySize}
            onChange={(e) =>
              handleMetadataChange("companySize", e.target.value)
            }
            className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>

        {/* Industry */}
        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Industry
          </label>
          <input
            type="text"
            id="industry"
            value={formData.metadata.industry}
            onChange={(e) => handleMetadataChange("industry", e.target.value)}
            className="w-full text-black  px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Technology, Healthcare, Finance"
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.metadata.notes}
            onChange={(e) => handleMetadataChange("notes", e.target.value)}
            className="w-full text-black  px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes about this organization..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isLoading || !formData.clientName || !formData.clientEmail
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Creating..." : "Create Organization"}
          </button>
        </div>
      </form>
    </div>
  );
}
