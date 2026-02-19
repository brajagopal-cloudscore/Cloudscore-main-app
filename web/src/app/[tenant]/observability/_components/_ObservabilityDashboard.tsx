'use client';

// deprecated

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ObservabilityLog {
  id: string;
  requestId: string;
  timestamp: string;
  method?: string | null;
  path?: string | null;
  statusCode?: number | null;
  latencyMs?: number | null;
  application?: {
    id: string;
    name: string;
    slug?: string | null;
  } | null;
  endpoint?: {
    id: string;
    name: string;
    path: string;
    provider: string;
  } | null;
  policy?: {
    id: string;
    name: string;
    version: string;
  } | null;
  guardrailResults?: any;
}

interface Props {
  initialLogs: ObservabilityLog[];
  stats: any;
  tenant: string;
  tenantId: string;
  selectedApplicationId?: string;
}

export function ObservabilityDashboard({ initialLogs, stats, tenant, tenantId, selectedApplicationId }: Props) {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log =>
    log.requestId.toLowerCase().includes(search.toLowerCase()) ||
    (log.path?.toLowerCase().includes(search.toLowerCase())) ||
    (log.application?.name.toLowerCase().includes(search.toLowerCase()))
  );

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (statusCode?: number | null) => {
    if (!statusCode) return <Badge variant="outline">Unknown</Badge>;
    if (statusCode >= 200 && statusCode < 300) return <Badge variant="secondary">Success</Badge>;
    if (statusCode === 403) return <Badge variant="destructive">Blocked</Badge>;
    if (statusCode >= 400 && statusCode < 500) return <Badge variant="destructive">Client Error</Badge>;
    if (statusCode >= 500) return <Badge variant="destructive">Server Error</Badge>;
    return <Badge variant="outline">{statusCode}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Observability</h1>
        <p className="text-gray-600">Monitor AI requests with full governance → security traceability</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_requests || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_requests > 0 
                  ? Math.round((stats.successful_requests / stats.total_requests) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.successful_requests} successful</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Blocked Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.blocked_requests || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Security blocks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.avg_latency || 0)}ms</div>
              <p className="text-xs text-gray-500 mt-1">P95: {Math.round(stats.p95_latency || 0)}ms</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative w-[400px]">
        <Input
          type="search"
          placeholder="Search logs by request ID, path, or application..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                {search ? 'No logs found' : 'No requests in the last 24 hours'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    {/* Request Info */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {log.method || 'POST'}
                      </Badge>
                      <span className="font-mono text-sm">{log.path || 'Unknown'}</span>
                      {getStatusBadge(log.statusCode)}
                    </div>

                    {/* Governance Context */}
                    {log.application && (
                      <div className="text-sm">
                        <span className="text-gray-600">Application: </span>
                        <span className="font-medium">{log.application.name}</span>
                      </div>
                    )}

                    {/* Security Context */}
                    <div className="flex gap-4 text-sm">
                      {log.endpoint && (
                        <div>
                          <span className="text-gray-600">Endpoint: </span>
                          <span className="font-medium">{log.endpoint.name}</span>
                        </div>
                      )}
                      {log.policy && (
                        <div>
                          <span className="text-gray-600">Policy: </span>
                          <span className="font-medium">{log.policy.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Guardrail Results */}
                    {log.guardrailResults && typeof log.guardrailResults === 'object' && (log.guardrailResults as any).guardrails && (
                      <div className="pt-2 border-t">
                        <div className="text-xs font-medium text-gray-600 mb-1">Guardrail Executions:</div>
                        <div className="flex flex-wrap gap-1">
                          {((log.guardrailResults as any).guardrails as any[]).map((gr: any, idx: number) => (
                            <Badge
                              key={idx}
                              variant={gr.passed ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {gr.guardrail_key} • {gr.execution_time_ms}ms
                              {gr.passed ? ' ✓' : ' ✗'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Request ID: {log.requestId}</span>
                      {log.latencyMs && <span>Latency: {log.latencyMs}ms</span>}
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div>
                    {log.statusCode && log.statusCode >= 200 && log.statusCode < 300 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : log.statusCode === 403 ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

