"use client";
import SideBar from "@/components/admin/sidebar/Sidebar";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import Pagination from "@/components/common/pagination";
import { getFormattedDateString } from "@/lib/utils/helpers";
import { useDebounce } from "@/hooks/useDebounce";
import { IoCloseCircleSharp } from "react-icons/io5";
import ListSkeleton from "@/components/common/ListSkeleton";

interface IdentityMappingData {
  email: string;
  name: string;
  workspace_id: string;
  tenant_id: string;
  load_timestamp: string;
  updated_timestamp: string;
  workspace_name: string;
}

const UsersIdentityMapping = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const debouncedSearch = useDebounce(search, 1000);

  const { data: allIdentityData, isLoading } = useQuery({
    queryKey: ["identityMapping", page, pageSize, debouncedSearch],
    select: (response: any) => {
      if (response) {
        const data = response.data?.data || [];
        let _counts = response.data?.counts || 0;
        let _totalPages = response.data?.total_pages || 1;

        if (data && data.length > 0) {
          const _identityData: IdentityMappingData[] = data.map(
            (item: any) => ({
              email: item.email,
              name: item.name || "",
              updated_timestamp: item.updated_timestamp,
            })
          );
          return {
            identityData: _identityData,
            counts: _counts,
            totalPages: _totalPages,
          };
        }
      }
    },
  });

  return (
    <div className="flex text-black bg-white flex-col  justify-between w-full relative">
      <div className="flex w-full flex-1 relative z-0">
        <div className="flex flex-col  p-5 w-full mt-4">
          <div className="flex w-full justify-between items-center">
            <div className="text-xl font-semibold font-sans text-[#3D3D3D] leading-[100%] mt-4">
              Users Identity Mapping
            </div>
          </div>

          <div className="w-full mt-4">
            <div className="flex flex-col gap-4  text-black">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search"
                    className="rounded-md w-[343px] h-[36px] pl-10 border-[#E4E4E7] text-sm font-normal text-[#71717A] focus:border-[#18181B] focus:ring-0 focus:outline-none"
                    aria-label="Search Query"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      aria-label="Clear search"
                    >
                      <IoCloseCircleSharp className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="h-10 border-b border-[#E4E4E7]">
                  <TableHead className="px-2">Name</TableHead>
                  <TableHead className="px-2">Email</TableHead>
                  <TableHead className="px-2">Last Sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm font-normal text-[#18181B]">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span>Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : allIdentityData?.identityData &&
                  allIdentityData.identityData.length > 0 ? (
                  allIdentityData.identityData.map(
                    (item: IdentityMappingData, index: number) => (
                      <TableRow
                        key={`${item.email}-${item.workspace_id}-${index}`}
                        className="h-10 border-b border-[#E4E4E7] last:border-b-0 hover:bg-gray-50"
                      >
                        <TableCell className="font-sm font-normal font-sans text-[#18181B]">
                          {item.name || "N/A"}
                        </TableCell>
                        <TableCell className="font-sm font-normal font-sans text-[#18181B]">
                          {item.email}
                        </TableCell>
                        <TableCell className="text-[#18181B] font-sm font-normal leading-[20px] font-sans">
                          {getFormattedDateString(
                            item.updated_timestamp,
                            true,
                            true
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-lg font-medium text-gray-500">
                          No data available
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {allIdentityData?.identityData &&
              allIdentityData.identityData.length > 0 && (
                <div className="sticky bottom-0 bg-white py-2 border-t border-[#E4E4E7]">
                  <Pagination
                    className="ml-[256px] pl-[15px]"
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    page={page}
                    setPage={setPage}
                    nextPage={
                      page < (allIdentityData?.totalPages || 1)
                        ? page + 1
                        : null
                    }
                    prevPage={page > 1 ? page - 1 : null}
                    onPageChange={(newPage: number) => setPage(newPage)}
                    onPageSizeChange={(newSize: number) => setPageSize(newSize)}
                    totalPages={allIdentityData?.totalPages || 1}
                    isLoading={isLoading}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

UsersIdentityMapping.displayName = "UsersIdentityMapping";

export default UsersIdentityMapping;
