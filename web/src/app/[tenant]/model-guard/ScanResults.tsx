"use client";

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Download, 
  ExternalLink,
  Clock,
  Shield,
  FileText,
  Database
} from 'lucide-react';
import { useAuthFetch } from '@/lib/api/auth-fetch';
import { exportJsonReport, exportSarifReport, downloadBlob } from '@/lib/api/model-guard';

interface SecurityFinding {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  recommendation?: string;
  evidence?: Record<string, any>;
  scanner: string;
  location?: string;
  created_at: string;
}

interface ScanResult {
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
  blocked_reason?: string;
  registry_synced?: boolean;
  scan_duration_ms: number;
  created_at: string;
  completed_at?: string;
  cached?: boolean;
  findings?: SecurityFinding[];
  metadata?: any;
}

interface ScanResultsProps {
  result: ScanResult;
}

export default function ScanResults({ result }: ScanResultsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const authFetch = useAuthFetch();

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Info className="h-4 w-4 text-blue-600" />;
      case 'info': return <Info className="h-4 w-4 text-gray-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'info': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending_review': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending_review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };


  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      const blob = await exportJsonReport(authFetch, result.scan_id);
      downloadBlob(blob, `model-guard-scan-${result.scan_id}.json`);
    } catch (error) {
      console.error('Failed to export JSON report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSarif = async () => {
    setIsExporting(true);
    try {
      const blob = await exportSarifReport(authFetch, result.scan_id);
      downloadBlob(blob, `model-guard-scan-${result.scan_id}.sarif`);
    } catch (error) {
      console.error('Failed to export SARIF report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Scan Results</h2>
          <div className="flex items-center gap-2">
            {result.cached && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Cached Result
              </span>
            )}
            <span className="text-sm text-gray-500">
              {formatDuration(result.scan_duration_ms)}
            </span>
          </div>
        </div>

        {/* Approval Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getApprovalStatusColor(result.approval_status)}`}>
            {getApprovalStatusIcon(result.approval_status)}
            <span className="font-medium capitalize">
              {result.approval_status.replace('_', ' ')}
            </span>
          </div>
          {result.blocked_reason && (
            <p className="text-sm text-red-600 mt-2">{result.blocked_reason}</p>
          )}
        </div>

        {/* Model Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Format</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 capitalize">{result.format}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Findings</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{result.findings_count}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Scanned</span>
            </div>
            <p className="text-sm text-gray-900">
              {new Date(result.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Severity Breakdown */}
        {result.findings_count > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Security Findings</h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                { severity: 'critical', count: result.critical_count },
                { severity: 'high', count: result.high_count },
                { severity: 'medium', count: result.medium_count },
                { severity: 'low', count: result.low_count },
                { severity: 'info', count: result.info_count }
              ].map(({ severity, count }) => (
                <div key={severity} className="text-center">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(severity)}`}>
                    {getSeverityIcon(severity)}
                    {count}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{severity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registry Sync Status */}
        {result.registry_synced && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span>Model synced to ControlNet registry</span>
          </div>
        )}
      </div>

      {/* Detailed Findings */}
      {result.findings_count > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Findings</h3>
          
          {result.findings && result.findings.length > 0 ? (
            <div className="space-y-4">
              {result.findings.map((finding, index) => (
                <div key={finding.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(finding.severity)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{finding.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                        
                        {finding.recommendation && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm font-medium text-blue-900 mb-1">Recommendation:</p>
                            <p className="text-sm text-blue-800">{finding.recommendation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>Scanner: {finding.scanner}</span>
                    <span>{new Date(finding.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Scan completed with <strong>{result.findings_count}</strong> findings
              </p>
              <p className="text-sm text-gray-500">
                Detailed findings are available in the exported reports
              </p>
            </div>
          )}
        </div>
      )}

      {/* Model Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Format</p>
            <p className="text-sm text-gray-900 capitalize">{result.format}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Scan Duration</p>
            <p className="text-sm text-gray-900">{formatDuration(result.scan_duration_ms)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Scan ID</p>
            <p className="text-sm text-gray-900 font-mono">{result.scan_id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Artifact ID</p>
            <p className="text-sm text-gray-900 font-mono">{result.artifact_id}</p>
          </div>
        </div>
      </div>


      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Results</h3>
        <div className="flex gap-3">
          <button 
            onClick={handleExportJson}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Download JSON Report'}
          </button>
          <button 
            onClick={handleExportSarif}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Download SARIF Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
