export const DemoPolicies = {
  name: "Launch",
  description:
    "Kickstart your AI security with the Launch — a ready-to-deploy protection layer that automatically blocks Jailbreak attempts, PII exposure, Profanity, and Toxic content. Designed for instant activation, it ensures your AI applications stay compliant, safe, and user-friendly from day one.",
  guardrails: [
    {
      guardrail_id: "0c1974e8-e7ae-4b7d-b8ff-ea73e1b2f15e",
      phase: "input",
      order_index: 0,
      params: {
        types: null,
        severity: "high",
        threshold: 1,
        anonymize_mode: "mask",
      },
      enabled: true,
    },
    {
      guardrail_id: "048be4d8-98e1-4788-8db5-5dd026058fde",
      phase: "input",
      order_index: 1,
      params: {
        severity: "high",
        threshold: 1,
        categories: null,
      },
      enabled: true,
    },
    {
      guardrail_id: "da39b4f2-fcbb-47af-bfe9-16a384d717aa",
      phase: "input",
      order_index: 2,
      params: {
        severity: "critical",
        threshold: 0.6,
      },
      enabled: true,
    },
    {
      guardrail_id: "0ba71772-a653-48d9-bb36-b5fa5cd2f9ff",
      phase: "input",
      order_index: 3,
      params: {
        severity: "high",
        threshold: 0.5,
        categories: null,
      },
      enabled: true,
    },
  ],
  composition: {
    input: "allOf",
    output: "allOf",
    tool_args: "allOf",
    tool_result: "allOf",
  },
  status: "active",
  is_active: true,
};

export const ProdPolicies = {
  name: "Launch",
  description:
    "Kickstart your AI security with the Launch — a ready-to-deploy protection layer that automatically blocks Jailbreak attempts, PII exposure, Profanity, and Toxic content. Designed for instant activation, it ensures your AI applications stay compliant, safe, and user-friendly from day one.",

  guardrails: [
    {
      guardrail_id: "3bd5e8c8-c479-429f-801f-e2556e810f08",
      phase: "input",
      order_index: 0,
      params: {
        types: null,
        severity: "high",
        threshold: 1,
        anonymize_mode: "mask",
      },
      enabled: true,
    },
    {
      guardrail_id: "67535268-722b-4389-80d2-8eb6b56714b1",
      phase: "input",
      order_index: 1,
      params: {
        severity: "critical",
        threshold: 0.6,
      },
      enabled: true,
    },
    {
      guardrail_id: "fbebdbdf-2b24-4b72-8189-e1860f283e49",
      phase: "input",
      order_index: 2,
      params: {
        severity: "high",
        threshold: 1,
        categories: null,
      },
      enabled: true,
    },
    {
      guardrail_id: "77ec1686-a7ee-46a6-9f8f-4c41be7ff427",
      phase: "input",
      order_index: 3,
      params: {
        severity: "high",
        threshold: 0.5,
        categories: null,
      },
      enabled: true,
    },
  ],
  composition: {
    input: "allOf",
    output: "allOf",
    tool_args: "allOf",
    tool_result: "allOf",
  },
  status: "active",
  is_active: true,
  application_id: "0950329c-f635-4e76-ac38-3b49b7c63ad0",
};
