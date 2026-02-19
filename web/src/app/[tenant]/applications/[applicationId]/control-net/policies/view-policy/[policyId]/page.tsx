import { getPolicyWithDetails } from "@/lib/queries/policies";

interface PageProps {
  params: Promise<{ policyId: string }>;
}

export default async function PolicyDetails({ params }: PageProps) {
  const { policyId } = await params;

  const policy = await getPolicyWithDetails(policyId);

  return (
    <div className="space-y-6">
      {/* Policy Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900">{policy.name}</h1>
        <p className="text-gray-600 mt-2">{policy.description}</p>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Version:</span>
            <p className="text-sm text-gray-900">{policy.version}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <p className="text-sm text-gray-900">
              {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">
              Created by
            </span>
            <p className="text-sm text-gray-900">
              {policy.user_createdBy?.name || policy.createdBy} at{" "}
              {new Date(policy.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">
              Updated by
            </span>
            <p className="text-sm text-gray-900">
              {policy.user_updatedBy?.name || policy.updatedBy} at{" "}
              {new Date(policy.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Database Guardrails */}
      {policy.databaseGuardrails.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Guardrails
          </h2>
          <div className="flex flex-col-6 gap-4">
            {policy.databaseGuardrails.map((policyGuardrail) => (
              <div
                key={policyGuardrail.id}
                className="border border-gray-200 rounded-lg p-4 text-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {policyGuardrail.guardrail.name ||
                      policyGuardrail.guardrail.key}
                  </h3>
                  <div className="flex space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        policyGuardrail.guardrail.tier === "T0"
                          ? "bg-red-100 text-red-800"
                          : policyGuardrail.guardrail.tier === "T1"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {policyGuardrail.guardrail.tier}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">
                  {policyGuardrail.guardrail.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Phase:
                    </span>
                    <span className="text-sm text-gray-900 ml-2">
                      {policyGuardrail.phase}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Order:
                    </span>
                    <span className="text-sm text-gray-900 ml-2">
                      {policyGuardrail.orderIndex}
                    </span>
                  </div>
                  {policyGuardrail.threshold && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Threshold:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {policyGuardrail.threshold}
                      </span>
                    </div>
                  )}
                  {policyGuardrail.weight && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Weight:
                      </span>
                      <span className="text-sm text-gray-900 ml-2">
                        {policyGuardrail.weight}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw YAML (for debugging) */}
      {policy.yaml && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">YAML</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {policy.yaml}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
