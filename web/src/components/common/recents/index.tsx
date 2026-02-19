import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterSection } from "./filter";
import { Pagination } from "./pagination";

import { Button } from "../../ui/button";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import { RecentEndpointsPaginatedResponse } from "@/lib/actions/recent";
import { Loading } from "./loading";
import { formatTimestamp } from "@/utils/formatTime";
import { Badge } from "@/components/ui/badge";

// Type definitions for observability log data
interface GuardInfo {
  id: string;
  name?: string;
  tier?: string;
  status: string;
  description?: string;
}

interface GuardrailResults {
  input_guards?: GuardInfo[];
  output_guards?: GuardInfo[];
  policy_decision?: string;
  blocked?: boolean;
  violated_guard?: { severity?: string; rule_id?: string };
  violated_rule?: { rule_id?: string };
  total_execution_time_ms?: number;
  _summary?: {
    decision?: string;
    was_blocked?: boolean;
    total_guards?: number;
    violation?: {
      phase?: string;
      message?: string;
      rule_id?: string;
      severity?: string;
    };
  };
}

interface RequestPayload {
  model?: string;
  messages?: Array<{ role: string; content: string }>;
  stream?: boolean;
}

interface RecentEndpointsTableProps {
  logs: RecentEndpointsPaginatedResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: Function;
}

export default function RecentEndpointsTable({
  logs,
  ...other
}: RecentEndpointsTableProps & { hideApplicationName?: boolean }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const { isLoading, isFetching, hideApplicationName = false } = other;

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const ALLOWED_REQUEST_CODE = [200, 201];

  if (!logs || isLoading || isFetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Endpoints</CardTitle>
          <CardDescription>
            <FilterSection
              isLoading={true}
              isFetching={true}
              refetch={() => {}}
              limit={0}
            ></FilterSection>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Model</TableHead>
                {hideApplicationName ? (
                  <></>
                ) : (
                  <>
                    <TableHead>Application</TableHead>
                  </>
                )}
                <TableHead>Latency</TableHead>
                <TableHead>Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Loading hideApplicationName={hideApplicationName}></Loading>
              <Loading hideApplicationName={hideApplicationName}></Loading>
              <Loading hideApplicationName={hideApplicationName}></Loading>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    );
  }
  const { data, ...rest } = logs;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Endpoints</CardTitle>
        <CardDescription>
          <FilterSection {...rest} {...other}></FilterSection>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Model</TableHead>
              {hideApplicationName === true ? (
                <></>
              ) : (
                <>
                  <TableHead>Application</TableHead>
                </>
              )}
              <TableHead>Latency</TableHead>
              <TableHead>Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || isLoading ? (
              <>
                <Loading></Loading>
                <Loading></Loading>
                <Loading></Loading>
              </>
            ) : (
              <>
                {/* <Loading></Loading> */}
                {data?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={hideApplicationName ? 6 : 7}
                      className="text-center py-6 text-sm text-muted-foreground"
                    >
                      No Logs Found
                    </TableCell>
                  </TableRow>
                ) : null}
                {data?.map((ele, idx) => {
                  const isAllowed = ALLOWED_REQUEST_CODE.includes(
                    ele.statusCode ?? 0
                  );

                  return (
                    <React.Fragment key={idx}>
                      <TableRow className="py-4!">
                        <TableCell>
                          <span className="text-sm">
                            {formatTimestamp(ele.createdAt)}
                          </span>
                        </TableCell>

                        <TableCell className="text-sm">
                          <Badge
                            variant={isAllowed ? "outline" : "destructive"}
                          >
                            {isAllowed ? "Allowed" : "Blocked"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={isAllowed ? "secondary" : "destructive"}
                            className="capitalize"
                          >
                            {(ele.guardrailResults as GuardrailResults)
                              ?._summary?.decision ??
                              (isAllowed ? "allow" : "block")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {(ele.requestPayload as RequestPayload)?.model ??
                            "Unknown"}
                        </TableCell>
                        {hideApplicationName === true ? (
                          <></>
                        ) : (
                          <TableCell className="text-sm">
                            {ele.applicationName}
                          </TableCell>
                        )}
                        <TableCell>
                          <span className="text-sm">
                            {ele.latencyMs ? `${ele.latencyMs}ms` : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={"outline"}
                            size="sm"
                            className="text-sm pre"
                            onClick={() => toggleRow(idx)}
                          >
                            View
                            {expandedRows.has(idx) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {expandedRows.has(idx) && (
                        <TableRow className="p-8">
                          <TableCell colSpan={8}>
                            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                              {/* Request Info */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground block">
                                    Request ID
                                  </span>
                                  <span className="font-mono text-xs">
                                    {ele.requestId ?? "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">
                                    Action
                                  </span>
                                  <Badge
                                    variant={
                                      isAllowed ? "outline" : "destructive"
                                    }
                                  >
                                    {isAllowed ? "✓ Allowed" : "✗ Blocked"}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">
                                    Timestamp
                                  </span>
                                  <span>
                                    {ele.timestamp
                                      ? formatTimestamp(ele.timestamp)
                                      : "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block">
                                    Execution Time
                                  </span>
                                  <span>
                                    {(ele.guardrailResults as GuardrailResults)
                                      ?.total_execution_time_ms
                                      ? `${(ele.guardrailResults as GuardrailResults).total_execution_time_ms!.toFixed(0)}ms`
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>

                              {/* Blocked Reason - Only show if blocked */}
                              {!isAllowed && ele.guardrailResults
                                ? (() => {
                                    const results =
                                      ele.guardrailResults as GuardrailResults;
                                    return (
                                      <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                                        <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                                          Blocked Reason
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                          <div>
                                            <span className="text-red-600 dark:text-red-400 block text-xs">
                                              Phase
                                            </span>
                                            <span className="capitalize">
                                              {results?._summary?.violation
                                                ?.phase ?? "N/A"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-red-600 dark:text-red-400 block text-xs">
                                              Rule ID
                                            </span>
                                            <span className="font-mono text-xs">
                                              {results?.violated_rule
                                                ?.rule_id ?? "N/A"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-red-600 dark:text-red-400 block text-xs">
                                              Severity
                                            </span>
                                            <Badge
                                              variant="destructive"
                                              className="text-xs"
                                            >
                                              {results?.violated_guard
                                                ?.severity ?? "N/A"}
                                            </Badge>
                                          </div>
                                          <div className="col-span-2 md:col-span-1">
                                            <span className="text-red-600 dark:text-red-400 block text-xs">
                                              Message
                                            </span>
                                            <span className="text-xs truncate block max-w-full">
                                              {results?._summary?.violation
                                                ?.message ?? "N/A"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()
                                : null}

                              {/* User Prompt */}
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  User Prompt
                                </div>
                                <div className="p-2 bg-background border rounded text-xs font-mono max-h-32 overflow-auto break-words whitespace-pre-wrap">
                                  {(() => {
                                    const payload =
                                      ele.requestPayload as RequestPayload;
                                    const messages = payload?.messages;
                                    if (!messages || !Array.isArray(messages))
                                      return "N/A";
                                    const userMessage = [...messages]
                                      .reverse()
                                      .find((m) => m.role === "user");
                                    return userMessage?.content ?? "N/A";
                                  })()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Pagination {...rest}></Pagination>
      </CardFooter>
    </Card>
  );
}
