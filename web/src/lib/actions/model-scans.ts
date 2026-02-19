/**
 * Server actions for Model Scans
 * Used to fetch scan results for provider models
 */

'use server';

import { db, modelScans, modelArtifacts } from '@db';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export const getModelScanResults = async (modelUrl: string, tenantId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    // Find the most recent scan for this model URL and tenant
    const [scan] = await db
      .select()
      .from(modelScans)
      .where(
        and(
          eq(modelScans.tenantId, tenantId),
          // We'll need to match by URI - this assumes the modelUrl matches the scan URI
          // You might need to adjust this logic based on how your data is structured
        )
      )
      .orderBy(desc(modelScans.createdAt))
      .limit(1);

    if (!scan) {
      return null;
    }

    // Return the scan results in the format expected by the modal
    const reportJson = scan.reportJson as any;
    return {
      scan_id: scan.id,
      status: scan.status,
      findings_count: reportJson?.findings?.length || 0,
      findings: reportJson?.findings || [],
      metadata: {
        model_name: reportJson?.metadata?.model_name,
        model_size: reportJson?.metadata?.model_size,
        scan_duration: reportJson?.metadata?.scan_duration,
        engine_version: scan.engineVersion,
      },
      created_at: scan.createdAt,
      finished_at: scan.finishedAt,
    };
  } catch (error) {
    console.error('Error fetching model scan results:', error);
    return null;
  }
};

export const getModelScanResultsByUrl = async (modelUrl: string, tenantId: string) => {
  console.log('=== getModelScanResultsByUrl DEBUG START ===');
  console.log('Input modelUrl:', modelUrl);
  console.log('Input tenantId:', tenantId);
  
  const { userId } = await auth();
  console.log('Auth userId:', userId);
  
  if (!userId) {
    console.error('Authentication failed - no userId');
    throw new Error('Authentication required');
  }

  try {
    // Trim the modelUrl to remove any leading/trailing spaces
    const trimmedUrl = modelUrl.trim();
    console.log('Original URL:', modelUrl);
    console.log('Trimmed URL:', trimmedUrl);
    console.log('Searching for model artifact with URL:', trimmedUrl);
    console.log('Tenant ID:', tenantId);

    // First, find the model artifact by URI (not tenant-specific since we know the tenant mismatch)
    const [artifact] = await db
      .select()
      .from(modelArtifacts)
      .where(eq(modelArtifacts.uri, trimmedUrl))
      .limit(1);

    if (!artifact) {
      console.log('No model artifact found for URI:', trimmedUrl);
      
      // Let's also check what artifacts are available for debugging
      const allArtifacts = await db
        .select({ uri: modelArtifacts.uri, id: modelArtifacts.id, tenantId: modelArtifacts.tenantId })
        .from(modelArtifacts)
        .limit(10);
      
      console.log('Available artifacts in database:', allArtifacts);
      return null;
    }

    console.log('Found artifact:', artifact.id, 'for URL:', trimmedUrl);

    // Then find the most recent scan for this artifact (not tenant-specific)
    const [scan] = await db
      .select()
      .from(modelScans)
      .where(eq(modelScans.artifactId, artifact.id))
      .orderBy(desc(modelScans.createdAt))
      .limit(1);

    if (!scan) {
      console.log('No scan found for artifact:', artifact.id);
      
      // Let's check what scans are available for debugging
      const allScans = await db
        .select({ id: modelScans.id, artifactId: modelScans.artifactId, status: modelScans.status })
        .from(modelScans)
        .where(eq(modelScans.artifactId, artifact.id))
        .limit(10);
      
      console.log('Available scans for this artifact:', allScans);
      return null;
    }

    console.log('Found scan:', scan.id, 'for artifact:', artifact.id);

    // Return the scan results in the format expected by the ModelGuard UI
    const reportJson = scan.reportJson as any;
    console.log('Report JSON:', reportJson);
    console.log('Report JSON type:', typeof reportJson);
    console.log('Report JSON keys:', reportJson ? Object.keys(reportJson) : 'null');
    
    // Count findings by severity - the findings are nested under security.findings.details
    const findings = reportJson?.security?.findings?.details || [];
    console.log('Findings array:', findings);
    console.log('Findings count:', findings.length);
    console.log('Security findings structure:', reportJson?.security?.findings);
    
    // Get severity counts from the by_severity object if available, otherwise count manually
    const bySeverity = reportJson?.security?.findings?.by_severity || {};
    const severityCounts = {
      critical: bySeverity.critical || 0,
      high: bySeverity.high || 0,
      medium: bySeverity.medium || 0,
      low: bySeverity.low || 0,
      info: bySeverity.info || 0
    };
    
    // If by_severity is not available, count manually
    if (Object.values(severityCounts).every(count => count === 0)) {
      findings.forEach((finding: any) => {
        const severity = finding.severity?.toLowerCase();
        if (severityCounts.hasOwnProperty(severity)) {
          severityCounts[severity as keyof typeof severityCounts]++;
        }
      });
    }
    
    console.log('Severity counts:', severityCounts);
    console.log('By severity object:', bySeverity);
    
    const result = {
      scan_id: scan.id,
      artifact_id: artifact.id,
      status: scan.status,
      format: artifact.detectedFormat,
      findings_count: reportJson?.security?.findings?.total || findings.length,
      critical_count: severityCounts.critical,
      high_count: severityCounts.high,
      medium_count: severityCounts.medium,
      low_count: severityCounts.low,
      info_count: severityCounts.info,
      approval_status: artifact.approvalStatus,
      blocked_reason: artifact.blockedReason,
      registry_synced: true, // Since it's in the registry
      scan_duration_ms: reportJson?.scan?.duration_ms || (reportJson?.metadata?.scan_duration ? reportJson.metadata.scan_duration * 1000 : undefined),
      created_at: scan.createdAt,
      completed_at: scan.finishedAt,
      cached: false,
      findings: findings.map((finding: any) => ({
        id: finding.id || `finding-${Math.random()}`,
        type: finding.type || finding.category || 'security',
        severity: finding.severity || 'medium',
        title: finding.title || finding.name || 'Security Finding',
        description: finding.description || finding.message || 'No description available',
        recommendation: finding.recommendation || finding.suggestion,
        evidence: finding.evidence || finding.details,
        scanner: finding.scanner || finding.rule_id || 'Model Guard',
        location: finding.location?.file || finding.file,
        created_at: finding.created_at || scan.createdAt
      })),
      metadata: {
        model_name: reportJson?.model?.metadata?.description || reportJson?.sbom?.model_info?.description || artifact.filename,
        model_size: reportJson?.model?.metadata?.file_size || reportJson?.sbom?.model_info?.file_size || artifact.sizeBytes,
        scan_duration: reportJson?.scan?.duration_ms ? reportJson.scan.duration_ms / 1000 : undefined,
        engine_version: scan.engineVersion,
        detected_format: artifact.detectedFormat,
        approval_status: artifact.approvalStatus,
      },
      finished_at: scan.finishedAt,
    };
    
    console.log('Final result:', result);
    console.log('=== getModelScanResultsByUrl DEBUG END ===');
    return result;
  } catch (error) {
    console.error('Error fetching model scan results by URL:', error);
    console.error('Error details:', error);
    console.log('=== getModelScanResultsByUrl DEBUG END (ERROR) ===');
    return null;
  }
};

export const getAllModelScans = async (tenantId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    const scans = await db
      .select()
      .from(modelScans)
      .where(eq(modelScans.tenantId, tenantId))
      .orderBy(desc(modelScans.createdAt));

    return scans;
  } catch (error) {
    console.error('Error fetching model scans:', error);
    return [];
  }
};

// Debug function to list all artifacts and scans for a tenant
export const debugModelData = async (tenantId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    const artifacts = await db
      .select({
        id: modelArtifacts.id,
        uri: modelArtifacts.uri,
        filename: modelArtifacts.filename,
        detectedFormat: modelArtifacts.detectedFormat,
        approvalStatus: modelArtifacts.approvalStatus,
        createdAt: modelArtifacts.createdAt,
      })
      .from(modelArtifacts)
      .where(eq(modelArtifacts.tenantId, tenantId))
      .orderBy(desc(modelArtifacts.createdAt));

    const scans = await db
      .select({
        id: modelScans.id,
        artifactId: modelScans.artifactId,
        status: modelScans.status,
        engineVersion: modelScans.engineVersion,
        createdAt: modelScans.createdAt,
        finishedAt: modelScans.finishedAt,
      })
      .from(modelScans)
      .where(eq(modelScans.tenantId, tenantId))
      .orderBy(desc(modelScans.createdAt));

    return {
      artifacts,
      scans,
      totalArtifacts: artifacts.length,
      totalScans: scans.length,
    };
  } catch (error) {
    console.error('Error fetching debug data:', error);
    return { artifacts: [], scans: [], totalArtifacts: 0, totalScans: 0 };
  }
};

// Debug function to check all provider models for a tenant
export const debugProviderModels = async (tenantId: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    const { providerModels } = await import('@db');
    
    const models = await db
      .select({
        id: providerModels.id,
        provider: providerModels.provider,
        modelId: providerModels.modelId,
        displayName: providerModels.displayName,
        modelUrl: providerModels.modelUrl,
        tenantId: providerModels.tenantId,
        createdAt: providerModels.createdAt,
      })
      .from(providerModels)
      .where(eq(providerModels.tenantId, tenantId))
      .orderBy(desc(providerModels.createdAt));

    console.log('=== PROVIDER MODELS DEBUG ===');
    console.log('Tenant ID:', tenantId);
    console.log('Total models found:', models.length);
    console.log('Models:', models);

    return {
      models,
      totalModels: models.length,
    };
  } catch (error) {
    console.error('Error fetching provider models:', error);
    return { models: [], totalModels: 0 };
  }
};

// Debug function to list all artifacts across all tenants
export const debugAllArtifacts = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    const artifacts = await db
      .select({
        id: modelArtifacts.id,
        tenantId: modelArtifacts.tenantId,
        uri: modelArtifacts.uri,
        filename: modelArtifacts.filename,
        detectedFormat: modelArtifacts.detectedFormat,
        approvalStatus: modelArtifacts.approvalStatus,
        createdAt: modelArtifacts.createdAt,
      })
      .from(modelArtifacts)
      .orderBy(desc(modelArtifacts.createdAt));

    console.log('=== ALL ARTIFACTS DEBUG ===');
    console.log('Total artifacts found:', artifacts.length);
    console.log('Artifacts:', artifacts);

    return {
      artifacts,
      totalArtifacts: artifacts.length,
    };
  } catch (error) {
    console.error('Error fetching all artifacts:', error);
    return { artifacts: [], totalArtifacts: 0 };
  }
};

// Function to check scans for existing artifacts
export const checkScansForExistingArtifacts = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    // Get all artifacts
    const artifacts = await db
      .select({
        id: modelArtifacts.id,
        tenantId: modelArtifacts.tenantId,
        uri: modelArtifacts.uri,
        filename: modelArtifacts.filename,
      })
      .from(modelArtifacts)
      .orderBy(desc(modelArtifacts.createdAt));

    console.log('=== CHECKING SCANS FOR EXISTING ARTIFACTS ===');
    console.log('Found artifacts:', artifacts.length);

    const results = [];
    for (const artifact of artifacts) {
      const scans = await db
        .select({
          id: modelScans.id,
          status: modelScans.status,
          reportJson: modelScans.reportJson,
          createdAt: modelScans.createdAt,
        })
        .from(modelScans)
        .where(eq(modelScans.artifactId, artifact.id))
        .orderBy(desc(modelScans.createdAt));

      results.push({
        artifact,
        scans,
        scanCount: scans.length
      });

      console.log(`Artifact ${artifact.uri}: ${scans.length} scans`);
    }

    return results;
  } catch (error) {
    console.error('Error checking scans for artifacts:', error);
    return [];
  }
};

// Test function to create mock artifact and scan data
export const createTestArtifactAndScan = async (tenantId: string, modelUrl: string) => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }

  try {
    console.log('=== CREATING TEST ARTIFACT AND SCAN ===');
    console.log('Tenant ID:', tenantId);
    console.log('Model URL:', modelUrl);

    // Create a test artifact
    const [artifact] = await db
      .insert(modelArtifacts)
      .values({
        tenantId,
        source: 'test',
        uri: modelUrl,
        filename: 'test-model.bin',
        sizeBytes: 1024000,
        sha256: 'test-sha256-hash',
        contentType: 'application/octet-stream',
        detectedFormat: 'pytorch',
        approvalStatus: 'approved',
        artifactMetadata: { test: true },
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    console.log('Created artifact:', artifact);

    // Create a test scan
    const [scan] = await db
      .insert(modelScans)
      .values({
        tenantId,
        artifactId: artifact.id,
        status: 'completed',
        engineVersion: '1.0.0',
        sbom: { test: 'sbom data' },
        reportJson: {
          findings: [
            {
              id: 'test-finding-1',
              title: 'Test Security Finding',
              description: 'This is a test security finding for demonstration',
              severity: 'Medium',
              category: 'Security',
              rule_id: 'test-rule-001'
            }
          ],
          metadata: {
            model_name: 'Test Model',
            model_size: 1024000,
            scan_duration: 30
          }
        },
        reportSarif: { test: 'sarif data' },
        createdBy: userId,
        updatedBy: userId,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
      })
      .returning();

    console.log('Created scan:', scan);

    return {
      artifact,
      scan,
      success: true
    };
  } catch (error) {
    console.error('Error creating test data:', error);
    return {
      artifact: null,
      scan: null,
      success: false,
      error: error
    };
  }
};
