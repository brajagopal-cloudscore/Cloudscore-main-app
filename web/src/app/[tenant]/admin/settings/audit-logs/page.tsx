"use client";
import SideBar from "@/components/admin/sidebar/Sidebar";
import React, { useEffect, useState } from "react";
// Removed API imports - using static data instead
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
// Removed Navbar import - using static layout instead
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Removed type import - using inline type instead
interface IActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: {
    result: string;
    action: string;
  };
  ipAddress: string;
  userAgent: string;
  created_at: string;
  actor: {
    id: string;
    name: string;
    user: {
      name: string;
      email: string;
    };
  };
  status_type: string;
  result: string;
  message: string;
  context: {
    ip_address: string;
    user_agent: string;
    [key: string]: any;
  };
}
import Pagination from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontalIcon,
  Info,
  RefreshCcw,
  Copy,
  Check,
} from "lucide-react";
import { getAuditLogs, getAuditLogById } from "@/lib/actions/audit-logs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auditTypeEntityOptions } from "@/lib/utils/constants";
import MultiSelectFilter from "@/components/common/filters/multi-select";
import { DialogTitle } from "@radix-ui/react-dialog";
import { formatDateTime } from "@/lib/utils/dateTime";
import { formatDate } from "@/lib/utils/date";

// Static data replaced with API-backed fetching

const AuditLogs = () => {
  const [selectedLog, setSelectedLog] = useState<IActivityLog | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState<{
    entity: { id: string; label: string }[];
  }>({ entity: [] });

  const [activityLogs, setActivityLogs] = useState<{
    results: IActivityLog[];
    total: number;
  }>({ results: [], total: 0 });
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      setIsFetching(true);
      const pathParts = window.location.pathname.split("/");
      const tenant = pathParts[1];
      const data = await getAuditLogs({
        tenantSlug: tenant,
        page,
        pageSize,
        search: search || undefined,
        targetType: filters.entity.length ? filters.entity[0].id : undefined,
      });
      const mappedResults: IActivityLog[] = (data.results || []).map(
        (logData: any) => {
          const metadata = logData?.metadata || {};
          const ctx = logData?.context || {};
          return {
            id: logData?.id ?? "",
            action: logData?.action ?? "",
            entity: logData?.entity ?? "",
            entityId: logData?.entityId ?? "",
            userId: logData?.actorUserId ?? logData?.actor?.id ?? "",
            userName: logData?.actor?.user?.name ?? logData?.actor?.name ?? "",
            timestamp: logData?.created_at ?? "",
            details: {
              result: metadata?.result ?? "",
              action: logData?.action ?? "",
            },
            ipAddress: logData?.ipAddress ?? ctx?.ip_address ?? "",
            userAgent: logData?.userAgent ?? ctx?.ua ?? ctx?.user_agent ?? "",
            created_at: logData?.created_at ?? "",
            actor: {
              id: logData?.actor?.id ?? logData?.actorUserId ?? "",
              name: logData?.actor?.name ?? logData?.actor?.user?.name ?? "",
              user: {
                name: logData?.actor?.user?.name ?? logData?.actor?.name ?? "",
                email: logData?.actor?.user?.email ?? "",
              },
            },
            status_type: metadata?.status_type ?? "",
            result: metadata?.result ?? "",
            message: metadata?.message ?? "",
            context: {
              ip_address: ctx?.ip_address ?? logData?.ipAddress ?? "",
              user_agent:
                ctx?.user_agent ?? ctx?.ua ?? logData?.userAgent ?? "",
              ...ctx,
            },
          } as IActivityLog;
        }
      );
      setActivityLogs({ results: mappedResults, total: data.total || 0 });
    } catch (e) {
      console.error(e);
      setActivityLogs({ results: [], total: 0 });
    } finally {
      setIsFetching(false);
    }
  };

  // Get the current filter value as a string for dependency tracking
  const currentFilterId =
    filters.entity.length > 0 ? filters.entity[0].id : null;

  // Reset page to 1 when filter changes
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilterId]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, currentFilterId]);

  const refetch = () => fetchLogs();

  const openLogDetails = async (item: IActivityLog) => {
    try {
      const pathParts = window.location.pathname.split("/");
      const tenant = pathParts[1];
      const detail = await getAuditLogById(tenant, item.id);
      if (!detail) {
        setSelectedLog(item);
      } else {
        const metadata = (detail as any)?.metadata || {};
        const ctx = (detail as any)?.context || {};
        const mapped: IActivityLog = {
          id: (detail as any)?.id ?? item.id,
          action: (detail as any)?.action ?? item.action,
          entity: (detail as any)?.entity ?? item.entity,
          entityId: (detail as any)?.entityId ?? item.entityId,
          userId:
            (detail as any)?.actorUserId ??
            (detail as any)?.actor?.id ??
            item.userId,
          userName:
            (detail as any)?.actor?.user?.name ??
            (detail as any)?.actor?.name ??
            item.userName,
          timestamp: (detail as any)?.created_at ?? item.timestamp,
          details: {
            result: metadata?.result ?? item.details?.result ?? "",
            action: (detail as any)?.action ?? item.action,
          },
          metadata: detail?.metadata,
          ipAddress:
            (detail as any)?.ipAddress ?? ctx?.ip_address ?? item.ipAddress,
          userAgent:
            (detail as any)?.userAgent ??
            ctx?.ua ??
            ctx?.user_agent ??
            item.userAgent,
          created_at: (detail as any)?.created_at ?? item.created_at,
          actor: {
            id:
              (detail as any)?.actor?.id ??
              (detail as any)?.actorUserId ??
              item.actor?.id ??
              "",
            name:
              (detail as any)?.actor?.name ??
              (detail as any)?.actor?.user?.name ??
              item.actor?.name ??
              "",
            user: {
              name:
                (detail as any)?.actor?.user?.name ??
                (detail as any)?.actor?.name ??
                item.actor?.user?.name ??
                "",
              email:
                (detail as any)?.actor?.user?.email ??
                item.actor?.user?.email ??
                "",
            },
          },
          status_type:
            metadata?.status_type ?? (item as any)?.status_type ?? "",
          result: metadata?.result ?? (item as any)?.result ?? "",
          message: metadata?.message ?? (item as any)?.message ?? "",
          context: {
            ip_address:
              ctx?.ip_address ??
              (detail as any)?.ipAddress ??
              (item as any)?.context?.ip_address ??
              "",
            user_agent:
              ctx?.user_agent ??
              ctx?.ua ??
              (detail as any)?.userAgent ??
              (item as any)?.context?.user_agent ??
              "",
            ...ctx,
          },
        } as IActivityLog;
        setSelectedLog(mapped);
      }
    } catch (e) {
      console.error(e);
      setSelectedLog(item);
    }
  };

  const renderLogActions = (item: IActivityLog) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-transparent">
            <MoreHorizontalIcon className="h-4 w-4 " />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[152px] ">
          <DropdownMenuItem
            onClick={() => openLogDetails(item)}
            className="flex items-center gap-2 text-sm font-normal cursor-pointer "
          >
            <Info size={15} className=" font-normal" />
            Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const LogsTable = () => {
    const logs = activityLogs?.results || [];

    const renderTableBody = () => {
      if (isFetching) {
        return (
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2"></div>
                  <span>Loading audit logs...</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        );
      }

      if (!logs.length) {
        return (
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-lg font-medium text-muted-foreground">
                    No data available
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        );
      }

      return (
        <TableBody>
          {logs.map((log: IActivityLog, index: number) => (
            <TableRow
              key={log.id || index}
              className="h-10 border-b  last:border-b-0 "
            >
              <TableCell className="text-sm pl-4  font-normal">
                {formatDateTime(log.created_at)}
              </TableCell>
              <TableCell className="text-sm pl-4  font-normal">
                {log?.actor?.user?.name || "-"}
              </TableCell>
              <TableCell className="text-sm pl-4  font-normal">
                {log?.actor?.user?.email || "-"}
              </TableCell>
              <TableCell className="text-sm pl-4  font-normal">
                {log?.entity || "-"}
              </TableCell>
              <TableCell className="text-sm pl-4  font-normal">
                {log?.action || "-"}
              </TableCell>
              <TableCell className="text-sm pl-4  font-normal">
                {log?.context?.message || log?.action || "-"}
              </TableCell>
              <TableCell className="text-sm pl-4  font-normal">
                {renderLogActions(log)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <p className="text-[16px] text-muted-foreground">Filters: </p>
          <MultiSelectFilter
            filterLabel="Entity"
            items={auditTypeEntityOptions}
            selectedItems={filters.entity}
            onSelectionChange={(list: any) =>
              setFilters({
                // TODO: change this to make this filter multi-select
                entity: list.at(-1) ? [list.at(-1)] : [],
              })
            }
          />
          <div className="flex gap-4 items-center">
            {/* <Button
              size="sm"
              variant="outline"
              className="rounded-md bg-black text-white font-medium leading-5"
              onClick={() =>
                setFilters((curr) => ({ ...curr, isApplied: true }))
              }
              disabled={isFetching}
            >
              {isFetching && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Apply
            </Button> */}

            <Button
              size="sm"
              variant="outline"
              className=" border-none font-medium leading-5 rounded-md"
              onClick={() => {
                setFilters({ entity: [] });
              }}
            >
              Clear Filter
            </Button>
          </div>
        </div>

        <div className="">
          <Table>
            <TableHeader className="">
              <TableRow className="border-b ">
                <TableHead className=" font-medium h-10">Date</TableHead>
                <TableHead className=" font-medium h-10">Name</TableHead>
                <TableHead className=" font-medium h-10">Email</TableHead>
                <TableHead className=" font-medium h-10">Entity</TableHead>
                <TableHead className=" font-medium h-10">Type</TableHead>
                <TableHead className=" font-medium h-10">Message</TableHead>
                <TableHead className=" font-medium h-10">Action</TableHead>
              </TableRow>
            </TableHeader>
            {renderTableBody()}
          </Table>
        </div>

        <div className="py-2 pt-4 border-t  z-40">
          <Pagination
            className="ml-64 pl-[15px]"
            pageSize={pageSize}
            setPageSize={setPageSize}
            page={page}
            setPage={setPage}
            totalPages={Math.ceil((activityLogs?.total || 0) / pageSize)}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            isLoading={isFetching}
          />
        </div>
      </div>
    );
  };

  const LogLabelValue = ({
    label,
    value,
    isLongText = false,
    isJson = false,
  }: {
    label: string;
    value: string;
    isLongText?: boolean;
    isJson?: boolean;
  }) => {
    const displayValue = value || "-";
    const shouldShowCopy = isLongText && value && value !== "-";

    if (isJson) {
      return (
        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between">
            <p className="text-[14px] leading-5 font-sans  font-medium text-muted-foreground">
              {label}
            </p>
          </div>
          <div className=" border  rounded-md p-3 overflow-x-auto">
            <pre className="text-xs font-mono  whitespace-pre-wrap wrap-break-words">
              {displayValue}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-1 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[14px] leading-5 font-sans  font-medium">
            {label}
          </p>
        </div>
        {isLongText ? (
          <div className=" rounded-md p-2 break-all">
            <p className="text-[13px] font-mono wrap-break-words">
              {displayValue}
            </p>
          </div>
        ) : (
          <p className="text-[14px] font-normal font-sans leading-5 wrap-break-words">
            {displayValue}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col  p-5">
        <div className="flex w-full justify-between items-center">
          <div className="text-xl font-semibold font-sans  leading-[100%] mt-4">
            Audit Logs
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refetch} disabled={isFetching}>
              <RefreshCcw
                className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="w-full mt-6">
          <LogsTable />
        </div>
      </div>

      {selectedLog && (
        <Dialog
          open={selectedLog !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedLog(null);
          }}
        >
          <DialogTitle className="sr-only">Log Details</DialogTitle>
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] border-none  p-0 flex flex-col">
            <div className="p-6 overflow-y-auto flex-1">
              <DialogHeader className=" mb-4">
                <h2 className="text-[18px] leading-[100%] font-semibold text-start">
                  Log Details
                </h2>
              </DialogHeader>

              <div className="space-y-1">
                <LogLabelValue
                  label="# id"
                  value={selectedLog?.id || "-"}
                  isLongText={true}
                />
                <LogLabelValue
                  label="Action"
                  value={selectedLog?.action || "-"}
                />
                <LogLabelValue
                  label="Details"
                  value={
                    (selectedLog as any)?.message ||
                    (selectedLog as any)?.metadata?.message ||
                    "-"
                  }
                />
                <LogLabelValue
                  label="Data"
                  value={(() => {
                    const metadata = (selectedLog as any)?.metadata || {};
                    // Exclude context from metadata display since it's shown separately
                    const { context, ...metadataWithoutContext } = metadata;
                    const jsonStr = JSON.stringify(
                      metadataWithoutContext,
                      null,
                      2
                    );
                    return Object.keys(metadataWithoutContext).length > 0
                      ? jsonStr
                      : "-";
                  })()}
                  isJson={true}
                  isLongText={true}
                />

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-[16px] leading-[100%] font-semibold text-start mb-4 ">
                    Context
                  </p>
                  <div className="space-y-1">
                    <LogLabelValue
                      label="UA (User Agent)"
                      value={
                        (selectedLog as any)?.context?.ua ||
                        (selectedLog as any)?.userAgent ||
                        "-"
                      }
                      isLongText={true}
                    />
                    <LogLabelValue
                      label="Referer"
                      value={(selectedLog as any)?.context?.referer || "-"}
                      isLongText={true}
                    />
                    <LogLabelValue
                      label="IP Address"
                      value={
                        (selectedLog as any)?.context?.ip_address ||
                        (selectedLog as any)?.ipAddress ||
                        "-"
                      }
                    />
                    <LogLabelValue
                      label="Session Id"
                      value={(selectedLog as any)?.context?.session_id || "-"}
                      isLongText={true}
                    />
                    <LogLabelValue
                      label="Location type"
                      value={
                        (selectedLog as any)?.context?.location?.type || "-"
                      }
                    />
                    <LogLabelValue
                      label="URL"
                      value={
                        (selectedLog as any)?.context?.location?.url || "-"
                      }
                      isLongText={true}
                    />
                    <LogLabelValue
                      label="Domain"
                      value={
                        (selectedLog as any)?.context?.location?.domain || "-"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AuditLogs;
