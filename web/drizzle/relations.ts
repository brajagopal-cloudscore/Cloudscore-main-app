import { relations } from "drizzle-orm/relations";
import {
  tenants,
  apiKeys,
  users,
  applicationDocumentation,
  applications,
  applicationModels,
  applicationPolicies,
  policies,
  attachments,
  auditEvents,
  complianceAssessments,
  governanceFrameworks,
  governanceControls,
  datasets,
  euAiActAssessments,
  guardrails,
  integrations,
  memberships,
  modelArtifacts,
  modelScans,
  navigationItems,
  observabilityLogs,
  policyGuardrails,
  providerModels,
  redTeamingTests,
  reports,
  riskCategories,
  riskCategoryLinks,
  risks,
  useCases,
  routerCentroids,
  routerPromptCentroids,
  routerPrompts,
  scanFindings,
  stakeholders,
} from "./schema";

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  tenant: one(tenants, {
    fields: [apiKeys.tenantId],
    references: [tenants.id],
  }),
  user_createdBy: one(users, {
    fields: [apiKeys.createdBy],
    references: [users.id],
    relationName: "apiKeys_createdBy_users_id",
  }),
  user_revokedBy: one(users, {
    fields: [apiKeys.revokedBy],
    references: [users.id],
    relationName: "apiKeys_revokedBy_users_id",
  }),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  apiKeys: many(apiKeys),
  applicationDocumentations: many(applicationDocumentation),
  applications: many(applications),
  applicationModels: many(applicationModels),
  applicationPolicies: many(applicationPolicies),
  policies: many(policies),
  attachments: many(attachments),
  auditEvents: many(auditEvents),
  complianceAssessments: many(complianceAssessments),
  datasets: many(datasets),
  euAiActAssessments: many(euAiActAssessments),
  guardrails: many(guardrails),
  integrations: many(integrations),
  memberships: many(memberships),
  modelArtifacts: many(modelArtifacts),
  modelScans: many(modelScans),
  navigationItems: many(navigationItems),
  observabilityLogs: many(observabilityLogs),
  policyGuardrails: many(policyGuardrails),
  providerModels: many(providerModels),
  redTeamingTests: many(redTeamingTests),
  reports: many(reports),
  risks: many(risks),
  useCases: many(useCases),
  routerCentroids: many(routerCentroids),
  routerPromptCentroids: many(routerPromptCentroids),
  scanFindings: many(scanFindings),
  stakeholders: many(stakeholders),
}));

export const usersRelations = relations(users, ({ many }) => ({
  apiKeys_createdBy: many(apiKeys, {
    relationName: "apiKeys_createdBy_users_id",
  }),
  apiKeys_revokedBy: many(apiKeys, {
    relationName: "apiKeys_revokedBy_users_id",
  }),
  applicationDocumentations_createdBy: many(applicationDocumentation, {
    relationName: "applicationDocumentation_createdBy_users_id",
  }),
  applicationDocumentations_updatedBy: many(applicationDocumentation, {
    relationName: "applicationDocumentation_updatedBy_users_id",
  }),
  applications_createdBy: many(applications, {
    relationName: "applications_createdBy_users_id",
  }),
  applications_updatedBy: many(applications, {
    relationName: "applications_updatedBy_users_id",
  }),
  applicationModels_createdBy: many(applicationModels, {
    relationName: "applicationModels_createdBy_users_id",
  }),
  applicationModels_updatedBy: many(applicationModels, {
    relationName: "applicationModels_updatedBy_users_id",
  }),
  applicationPolicies: many(applicationPolicies),
  policies_createdBy: many(policies, {
    relationName: "policies_createdBy_users_id",
  }),
  policies_updatedBy: many(policies, {
    relationName: "policies_updatedBy_users_id",
  }),
  attachments: many(attachments),
  auditEvents: many(auditEvents),
  complianceAssessments: many(complianceAssessments),
  datasets_createdBy: many(datasets, {
    relationName: "datasets_createdBy_users_id",
  }),
  datasets_updatedBy: many(datasets, {
    relationName: "datasets_updatedBy_users_id",
  }),
  euAiActAssessments_assessedBy: many(euAiActAssessments, {
    relationName: "euAiActAssessments_assessedBy_users_id",
  }),
  euAiActAssessments_approvedBy: many(euAiActAssessments, {
    relationName: "euAiActAssessments_approvedBy_users_id",
  }),
  guardrails_createdBy: many(guardrails, {
    relationName: "guardrails_createdBy_users_id",
  }),
  guardrails_updatedBy: many(guardrails, {
    relationName: "guardrails_updatedBy_users_id",
  }),
  integrations_createdBy: many(integrations, {
    relationName: "integrations_createdBy_users_id",
  }),
  integrations_updatedBy: many(integrations, {
    relationName: "integrations_updatedBy_users_id",
  }),
  memberships: many(memberships),
  modelArtifacts_createdBy: many(modelArtifacts, {
    relationName: "modelArtifacts_createdBy_users_id",
  }),
  modelArtifacts_updatedBy: many(modelArtifacts, {
    relationName: "modelArtifacts_updatedBy_users_id",
  }),
  modelScans_createdBy: many(modelScans, {
    relationName: "modelScans_createdBy_users_id",
  }),
  modelScans_updatedBy: many(modelScans, {
    relationName: "modelScans_updatedBy_users_id",
  }),
  policyGuardrails_createdBy: many(policyGuardrails, {
    relationName: "policyGuardrails_createdBy_users_id",
  }),
  policyGuardrails_updatedBy: many(policyGuardrails, {
    relationName: "policyGuardrails_updatedBy_users_id",
  }),
  providerModels_createdBy: many(providerModels, {
    relationName: "providerModels_createdBy_users_id",
  }),
  providerModels_updatedBy: many(providerModels, {
    relationName: "providerModels_updatedBy_users_id",
  }),
  redTeamingTests: many(redTeamingTests),
  reports: many(reports),
  risks_createdBy: many(risks, {
    relationName: "risks_createdBy_users_id",
  }),
  risks_updatedBy: many(risks, {
    relationName: "risks_updatedBy_users_id",
  }),
  useCases_createdBy: many(useCases, {
    relationName: "useCases_createdBy_users_id",
  }),
  useCases_updatedBy: many(useCases, {
    relationName: "useCases_updatedBy_users_id",
  }),
  routerCentroids_createdBy: many(routerCentroids, {
    relationName: "routerCentroids_createdBy_users_id",
  }),
  routerCentroids_updatedBy: many(routerCentroids, {
    relationName: "routerCentroids_updatedBy_users_id",
  }),
  routerPromptCentroids: many(routerPromptCentroids),
  stakeholders_createdBy: many(stakeholders, {
    relationName: "stakeholders_createdBy_users_id",
  }),
  stakeholders_updatedBy: many(stakeholders, {
    relationName: "stakeholders_updatedBy_users_id",
  }),
}));

export const applicationDocumentationRelations = relations(
  applicationDocumentation,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [applicationDocumentation.tenantId],
      references: [tenants.id],
    }),
    application: one(applications, {
      fields: [applicationDocumentation.applicationId],
      references: [applications.id],
    }),
    user_createdBy: one(users, {
      fields: [applicationDocumentation.createdBy],
      references: [users.id],
      relationName: "applicationDocumentation_createdBy_users_id",
    }),
    user_updatedBy: one(users, {
      fields: [applicationDocumentation.updatedBy],
      references: [users.id],
      relationName: "applicationDocumentation_updatedBy_users_id",
    }),
  })
);

export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    applicationDocumentations: many(applicationDocumentation),
    tenant: one(tenants, {
      fields: [applications.tenantId],
      references: [tenants.id],
    }),
    user_createdBy: one(users, {
      fields: [applications.createdBy],
      references: [users.id],
      relationName: "applications_createdBy_users_id",
    }),
    user_updatedBy: one(users, {
      fields: [applications.updatedBy],
      references: [users.id],
      relationName: "applications_updatedBy_users_id",
    }),
    applicationModels: many(applicationModels),
    applicationPolicies: many(applicationPolicies),
    complianceAssessments: many(complianceAssessments),
    datasets: many(datasets),
    euAiActAssessments: many(euAiActAssessments),
    observabilityLogs: many(observabilityLogs),
    redTeamingTests: many(redTeamingTests),
    risks: many(risks),
    useCases: many(useCases),
    stakeholders: many(stakeholders),
  })
);

export const applicationModelsRelations = relations(
  applicationModels,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [applicationModels.tenantId],
      references: [tenants.id],
    }),
    application: one(applications, {
      fields: [applicationModels.applicationId],
      references: [applications.id],
    }),
    user_createdBy: one(users, {
      fields: [applicationModels.createdBy],
      references: [users.id],
      relationName: "applicationModels_createdBy_users_id",
    }),
    user_updatedBy: one(users, {
      fields: [applicationModels.updatedBy],
      references: [users.id],
      relationName: "applicationModels_updatedBy_users_id",
    }),
  })
);

export const applicationPoliciesRelations = relations(
  applicationPolicies,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [applicationPolicies.tenantId],
      references: [tenants.id],
    }),
    application: one(applications, {
      fields: [applicationPolicies.applicationId],
      references: [applications.id],
    }),
    policy: one(policies, {
      fields: [applicationPolicies.policyId],
      references: [policies.id],
    }),
    user: one(users, {
      fields: [applicationPolicies.createdBy],
      references: [users.id],
    }),
  })
);

export const policiesRelations = relations(policies, ({ one, many }) => ({
  applicationPolicies: many(applicationPolicies),
  tenant: one(tenants, {
    fields: [policies.tenantId],
    references: [tenants.id],
  }),
  user_createdBy: one(users, {
    fields: [policies.createdBy],
    references: [users.id],
    relationName: "policies_createdBy_users_id",
  }),
  user_updatedBy: one(users, {
    fields: [policies.updatedBy],
    references: [users.id],
    relationName: "policies_updatedBy_users_id",
  }),
  observabilityLogs: many(observabilityLogs),
  policyGuardrails: many(policyGuardrails),
  redTeamingTests: many(redTeamingTests),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [attachments.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [attachments.uploadedBy],
    references: [users.id],
  }),
}));

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditEvents.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [auditEvents.actorUserId],
    references: [users.id],
  }),
}));

export const complianceAssessmentsRelations = relations(
  complianceAssessments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceAssessments.tenantId],
      references: [tenants.id],
    }),
    application: one(applications, {
      fields: [complianceAssessments.applicationId],
      references: [applications.id],
    }),
    governanceFramework: one(governanceFrameworks, {
      fields: [complianceAssessments.frameworkId],
      references: [governanceFrameworks.id],
    }),
    governanceControl: one(governanceControls, {
      fields: [complianceAssessments.controlId],
      references: [governanceControls.id],
    }),
    user: one(users, {
      fields: [complianceAssessments.assessedBy],
      references: [users.id],
    }),
  })
);

export const governanceFrameworksRelations = relations(
  governanceFrameworks,
  ({ many }) => ({
    complianceAssessments: many(complianceAssessments),
    governanceControls: many(governanceControls),
  })
);

export const governanceControlsRelations = relations(
  governanceControls,
  ({ one, many }) => ({
    complianceAssessments: many(complianceAssessments),
    governanceFramework: one(governanceFrameworks, {
      fields: [governanceControls.frameworkId],
      references: [governanceFrameworks.id],
    }),
  })
);

export const datasetsRelations = relations(datasets, ({ one }) => ({
  tenant: one(tenants, {
    fields: [datasets.tenantId],
    references: [tenants.id],
  }),
  application: one(applications, {
    fields: [datasets.applicationId],
    references: [applications.id],
  }),
  user_createdBy: one(users, {
    fields: [datasets.createdBy],
    references: [users.id],
    relationName: "datasets_createdBy_users_id",
  }),
  user_updatedBy: one(users, {
    fields: [datasets.updatedBy],
    references: [users.id],
    relationName: "datasets_updatedBy_users_id",
  }),
}));

export const euAiActAssessmentsRelations = relations(
  euAiActAssessments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [euAiActAssessments.tenantId],
      references: [tenants.id],
    }),
    application: one(applications, {
      fields: [euAiActAssessments.applicationId],
      references: [applications.id],
    }),
    user_assessedBy: one(users, {
      fields: [euAiActAssessments.assessedBy],
      references: [users.id],
      relationName: "euAiActAssessments_assessedBy_users_id",
    }),
    user_approvedBy: one(users, {
      fields: [euAiActAssessments.approvedBy],
      references: [users.id],
      relationName: "euAiActAssessments_approvedBy_users_id",
    }),
  })
);

export const guardrailsRelations = relations(guardrails, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [guardrails.tenantId],
    references: [tenants.id],
  }),
  user_createdBy: one(users, {
    fields: [guardrails.createdBy],
    references: [users.id],
    relationName: "guardrails_createdBy_users_id",
  }),
  user_updatedBy: one(users, {
    fields: [guardrails.updatedBy],
    references: [users.id],
    relationName: "guardrails_updatedBy_users_id",
  }),
  guardrail: one(guardrails, {
    fields: [guardrails.fallbackGuardrailId],
    references: [guardrails.id],
    relationName: "guardrails_fallbackGuardrailId_guardrails_id",
  }),
  guardrails: many(guardrails, {
    relationName: "guardrails_fallbackGuardrailId_guardrails_id",
  }),
  policyGuardrails: many(policyGuardrails),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [integrations.tenantId],
    references: [tenants.id],
  }),
  user_createdBy: one(users, {
    fields: [integrations.createdBy],
    references: [users.id],
    relationName: "integrations_createdBy_users_id",
  }),
  user_updatedBy: one(users, {
    fields: [integrations.updatedBy],
    references: [users.id],
    relationName: "integrations_updatedBy_users_id",
  }),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  tenant: one(tenants, {
    fields: [memberships.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
}));

export const modelArtifactsRelations = relations(
  modelArtifacts,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [modelArtifacts.tenantId],
      references: [tenants.id],
    }),
    user_createdBy: one(users, {
      fields: [modelArtifacts.createdBy],
      references: [users.id],
      relationName: "modelArtifacts_createdBy_users_id",
    }),
    user_updatedBy: one(users, {
      fields: [modelArtifacts.updatedBy],
      references: [users.id],
      relationName: "modelArtifacts_updatedBy_users_id",
    }),
    modelScans: many(modelScans),
    providerModels: many(providerModels),
  })
);

export const modelScansRelations = relations(modelScans, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [modelScans.tenantId],
    references: [tenants.id],
  }),
  modelArtifact: one(modelArtifacts, {
    fields: [modelScans.artifactId],
    references: [modelArtifacts.id],
  }),
  user_createdBy: one(users, {
    fields: [modelScans.createdBy],
    references: [users.id],
    relationName: "modelScans_createdBy_users_id",
  }),
  user_updatedBy: one(users, {
    fields: [modelScans.updatedBy],
    references: [users.id],
    relationName: "modelScans_updatedBy_users_id",
  }),
  scanFindings: many(scanFindings),
}));

export const navigationItemsRelations = relations(
  navigationItems,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [navigationItems.tenantId],
      references: [tenants.id],
    }),
    navigationItem: one(navigationItems, {
      fields: [navigationItems.parentId],
      references: [navigationItems.id],
      relationName: "navigationItems_parentId_navigationItems_id",
    }),
    navigationItems: many(navigationItems, {
      relationName: "navigationItems_parentId_navigationItems_id",
    }),
  })
);

export const observabilityLogsRelations = relations(
  observabilityLogs,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [observabilityLogs.tenantId],
      references: [tenants.id],
    }),
    application: one(applications, {
      fields: [observabilityLogs.applicationId],
      references: [applications.id],
    }),
    policy: one(policies, {
      fields: [observabilityLogs.policyId],
      references: [policies.id],
    }),
  })
);

export const policyGuardrailsRelations = relations(
  policyGuardrails,
  ({ one }) => ({
    policy: one(policies, {
      fields: [policyGuardrails.policyId],
      references: [policies.id],
    }),
    guardrail: one(guardrails, {
      fields: [policyGuardrails.guardrailId],
      references: [guardrails.id],
    }),
    tenant: one(tenants, {
      fields: [policyGuardrails.tenantId],
      references: [tenants.id],
    }),
    user_createdBy: one(users, {
      fields: [policyGuardrails.createdBy],
      references: [users.id],
      relationName: "policyGuardrails_createdBy_users_id",
    }),
    user_updatedBy: one(users, {
      fields: [policyGuardrails.updatedBy],
      references: [users.id],
      relationName: "policyGuardrails_updatedBy_users_id",
    }),
  })
);

export const providerModelsRelations = relations(providerModels, ({ one }) => ({
  tenant: one(tenants, {
    fields: [providerModels.tenantId],
    references: [tenants.id],
  }),
  user_createdBy: one(users, {
    fields: [providerModels.createdBy],
    references: [users.id],
    relationName: "providerModels_createdBy_users_id",
  }),
  user_updatedBy: one(users, {
    fields: [providerModels.updatedBy],
    references: [users.id],
    relationName: "providerModels_updatedBy_users_id",
  }),
  modelArtifact: one(modelArtifacts, {
    fields: [providerModels.modelArtifactId],
    references: [modelArtifacts.id],
  }),
}));

export const redTeamingTestsRelations = relations(
  redTeamingTests,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [redTeamingTests.tenantId],
      references: [tenants.id],
    }),
    application: one(applications, {
      fields: [redTeamingTests.applicationId],
      references: [applications.id],
    }),
    policy: one(policies, {
      fields: [redTeamingTests.policyId],
      references: [policies.id],
    }),
    user: one(users, {
      fields: [redTeamingTests.createdBy],
      references: [users.id],
    }),
  })
);

export const reportsRelations = relations(reports, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reports.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [reports.generatedBy],
    references: [users.id],
  }),
}));

export const riskCategoryLinksRelations = relations(
  riskCategoryLinks,
  ({ one }) => ({
    riskCategory: one(riskCategories, {
      fields: [riskCategoryLinks.categoryId],
      references: [riskCategories.id],
    }),
  })
);

export const riskCategoriesRelations = relations(
  riskCategories,
  ({ many }) => ({
    riskCategoryLinks: many(riskCategoryLinks),
  })
);

export const risksRelations = relations(risks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [risks.tenantId],
    references: [tenants.id],
  }),
  application: one(applications, {
    fields: [risks.applicationId],
    references: [applications.id],
  }),
  useCase: one(useCases, {
    fields: [risks.useCaseId],
    references: [useCases.id],
  }),
  ownerUser: one(users, {
    fields: [risks.owner],
    references: [users.id],
  }),

  controlOwnerUser: one(users, {
    fields: [risks.controlOwner],
    references: [users.id],
  }),
  user_createdBy: one(users, {
    fields: [risks.createdBy],
    references: [users.id],
    relationName: "risks_createdBy_users_id",
  }),
  user_updatedBy: one(users, {
    fields: [risks.updatedBy],
    references: [users.id],
    relationName: "risks_updatedBy_users_id",
  }),
}));

export const useCasesRelations = relations(useCases, ({ one, many }) => ({
  risks: many(risks),
  tenant: one(tenants, {
    fields: [useCases.tenantId],
    references: [tenants.id],
  }),
  application: one(applications, {
    fields: [useCases.applicationId],
    references: [applications.id],
  }),
  user_createdBy: one(users, {
    fields: [useCases.createdBy],
    references: [users.id],
    relationName: "useCases_createdBy_users_id",
  }),
  user_updatedBy: one(users, {
    fields: [useCases.updatedBy],
    references: [users.id],
    relationName: "useCases_updatedBy_users_id",
  }),
}));

export const routerCentroidsRelations = relations(
  routerCentroids,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [routerCentroids.tenantId],
      references: [tenants.id],
    }),
    user_createdBy: one(users, {
      fields: [routerCentroids.createdBy],
      references: [users.id],
      relationName: "routerCentroids_createdBy_users_id",
    }),
    user_updatedBy: one(users, {
      fields: [routerCentroids.updatedBy],
      references: [users.id],
      relationName: "routerCentroids_updatedBy_users_id",
    }),
    routerPromptCentroids: many(routerPromptCentroids),
  })
);

export const routerPromptCentroidsRelations = relations(
  routerPromptCentroids,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [routerPromptCentroids.tenantId],
      references: [tenants.id],
    }),
    routerPrompt: one(routerPrompts, {
      fields: [routerPromptCentroids.promptId],
      references: [routerPrompts.id],
    }),
    routerCentroid: one(routerCentroids, {
      fields: [routerPromptCentroids.centroidId],
      references: [routerCentroids.id],
    }),
    user: one(users, {
      fields: [routerPromptCentroids.createdBy],
      references: [users.id],
    }),
  })
);

export const routerPromptsRelations = relations(routerPrompts, ({ many }) => ({
  routerPromptCentroids: many(routerPromptCentroids),
}));

export const scanFindingsRelations = relations(scanFindings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [scanFindings.tenantId],
    references: [tenants.id],
  }),
  modelScan: one(modelScans, {
    fields: [scanFindings.scanId],
    references: [modelScans.id],
  }),
}));

export const stakeholdersRelations = relations(stakeholders, ({ one }) => ({
  tenant: one(tenants, {
    fields: [stakeholders.tenantId],
    references: [tenants.id],
  }),
  application: one(applications, {
    fields: [stakeholders.applicationId],
    references: [applications.id],
  }),
  user_createdBy: one(users, {
    fields: [stakeholders.createdBy],
    references: [users.id],
    relationName: "stakeholders_createdBy_users_id",
  }),
  user_updatedBy: one(users, {
    fields: [stakeholders.updatedBy],
    references: [users.id],
    relationName: "stakeholders_updatedBy_users_id",
  }),
}));
