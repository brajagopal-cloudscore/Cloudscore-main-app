/**
 * ModelGuard API integration
 * 
 * Provides functions to interact with the ModelGuard service for model scanning
 */

export interface ScanRequest {
  uri: string;
  scan_options?: {
    force_rescan?: boolean;
  };
}

export interface ScanResponse {
  scan_id: string;
  artifact_id: string;
  status: string;
  format: string;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  approval_status: string;
  scan_duration_ms: number;
  created_at: string;
  completed_at?: string;
  findings?: SecurityFinding[];
  metadata?: any;
}

export interface SecurityFinding {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  recommendation?: string;
  evidence?: any;
  scanner: string;
  location?: string;
  cwe_id?: string;
  created_at: string;
}

export interface SupportedFormatsResponse {
  formats: string[];
}

export interface ScanReportResponse {
  scan_id: string;
  artifact_id: string;
  status: string;
  findings: SecurityFinding[];
  metadata: any;
  reports: {
    json: any;
    sarif: any;
  };
  created_at: string;
  completed_at: string;
}

/**
 * Scan a model by URI
 */
export async function scanModel(
  authFetch: (url: string, options?: RequestInit) => Promise<Response>,
  request: ScanRequest
): Promise<ScanResponse> {
  const response = await authFetch('/modelguard/scan/model', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    let errorMessage = 'Scan failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get supported model formats
 */
export async function getSupportedFormats(
  authFetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<SupportedFormatsResponse> {
  const response = await authFetch('/modelguard/scan/formats');

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get supported formats');
  }

  return response.json();
}

/**
 * Get scan results by scan ID
 */
export async function getScanResults(
  authFetch: (url: string, options?: RequestInit) => Promise<Response>,
  scanId: string
): Promise<ScanReportResponse> {
  const response = await authFetch(`/modelguard/reports/${scanId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get scan results');
  }

  return response.json();
}

/**
 * Export scan results as JSON report
 */
export async function exportJsonReport(
  authFetch: (url: string, options?: RequestInit) => Promise<Response>,
  scanId: string
): Promise<Blob> {
  const response = await authFetch(`/modelguard/reports/${scanId}/json`, {
    method: 'POST'
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to export JSON report');
  }

  return response.blob();
}

/**
 * Export scan results as SARIF report
 */
export async function exportSarifReport(
  authFetch: (url: string, options?: RequestInit) => Promise<Response>,
  scanId: string
): Promise<Blob> {
  const response = await authFetch(`/modelguard/reports/${scanId}/sarif`, {
    method: 'POST'
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to export SARIF report');
  }

  return response.blob();
}

/**
 * Get scan report summary
 */
export async function getScanSummary(
  authFetch: (url: string, options?: RequestInit) => Promise<Response>,
  scanId: string
): Promise<any> {
  const response = await authFetch(`/modelguard/reports/${scanId}/summary`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get scan summary');
  }

  return response.json();
}

/**
 * Utility function to download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Utility function to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Utility function to format duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Utility function to get severity color classes
 */
export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'info': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Utility function to get approval status color classes
 */
export function getApprovalStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved': return 'text-green-600 bg-green-50 border-green-200';
    case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
    case 'pending_review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
