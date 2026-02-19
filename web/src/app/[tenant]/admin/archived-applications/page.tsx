"use client";

import {
  useState,
  useTransition,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Search, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { successToast, errorToast } from "@/lib/utils/toast";
import { useTenant } from "@/contexts/TenantContext";
import Pagination from "@/components/common/pagination";
import {
  getArchivedApplicationsAction,
  restoreApplication,
  hardDeleteApplication,
} from "@/lib/actions/applications";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";

interface ArchivedApplication {
  id: string;
  name: string;
  slug: string | null | undefined;
  description: string | null | undefined;
  status: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string;
  archivedBy?: string;
}

function ArchivedApplications() {
  const { tenant } = useTenant();
  const [applications, setApplications] = useState<ArchivedApplication[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const router = useRouter();

  // Fetch archived applications from server action with server-side pagination
  const fetchArchivedApplications = useCallback(async () => {
    if (!tenant?.slug) return;

    try {
      setIsLoading(true);
      const data = await getArchivedApplicationsAction(
        tenant.slug,
        page,
        pageSize,
        search.trim() || undefined
      );
      setApplications(
        (data.applications || []).map((app) => ({
          ...app,
          slug: app.slug ?? undefined,
          description: app.description ?? undefined,
        }))
      );
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      errorToast("Failed to refresh archived applications list");
    } finally {
      setIsLoading(false);
    }
  }, [tenant, search, page, pageSize]);

  // Fetch applications on component mount and when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchArchivedApplications();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [fetchArchivedApplications]);

  // Reset to first page on search change
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPage(1);
    setPageSize(newSize);
  }, []);

  const handleRestore = async (applicationId: string) => {
    if (!tenant?.slug || !tenant?.id) return;

    startTransition(async () => {
      try {
        await restoreApplication(applicationId, tenant.id);
        successToast("", "Application", "restored");
        await fetchArchivedApplications();
        router.refresh();
      } catch (error: any) {
        errorToast(error.message || "Failed to restore application");
      }
    });
  };

  const handleHardDelete = async () => {
    if (!tenant?.slug || !tenant?.id || !applicationToDelete) return;

    startTransition(async () => {
      try {
        await hardDeleteApplication(applicationToDelete.id, tenant.id);
        successToast("", "Application", "permanently deleted");
        setDeleteModalOpen(false);
        setApplicationToDelete(null);
        await fetchArchivedApplications();
        router.refresh();
      } catch (error: any) {
        errorToast(error.message || "Failed to delete application");
      }
    });
  };

  const openDeleteModal = (app: ArchivedApplication) => {
    setApplicationToDelete({ id: app.id, name: app.name });
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold ">Archived Applications</h1>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-[343px]">
        <Input
          type="search"
          placeholder="Search archived applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Application Name</TableHead>
            <TableHead>Archived At</TableHead>
            <TableHead>Archived By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-12 text-muted-foreground"
              >
                {search
                  ? "No archived applications found"
                  : "No archived applications yet."}
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => {
              return (
                <TableRow key={app.id} className="">
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell className="text-sm pl-4  font-normal">
                    {new Date(
                      app?.archivedAt || app?.updatedAt
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm pl-4 font-normal">
                    {app.archivedBy || "Unknown"}
                  </TableCell>
                  <TableCell className="">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRestore(app.id)}
                          disabled={isPending}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteModal(app)}
                          disabled={isPending}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="pb-16">
        <span className="text-muted-foreground text-sm m-1 mt-2 block">
          Total Archived Apps: {applications.length}
        </span>
      </div>

      <Pagination
        className="ml-64 pl-[15px]"
        pageSize={pageSize}
        setPageSize={setPageSize}
        page={page}
        setPage={setPage}
        onPageSizeChange={handlePageSizeChange}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        isLoading={isLoading}
        variant="fixed"
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setApplicationToDelete(null);
        }}
        onConfirm={handleHardDelete}
        isLoading={isPending}
        title="Permanently Delete Application"
        itemName={applicationToDelete?.name || ""}
        itemType="application"
      />
    </div>
  );
}

export default ArchivedApplications;
