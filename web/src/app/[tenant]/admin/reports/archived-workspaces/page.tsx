// 'use client';
// import SideBar from '@/components/admin/sidebar/Sidebar';
// import React, { useEffect, useState, useRef, memo } from 'react';
// import { useIsFetching, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import Navbar from '@/components/layout/navbar/Navbar';
// import { EditWorkspace, GetAllArchivedWorkspaces } from '@/lib/api/workspace';

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { convertKBToGB } from '@/lib/utils/helpers';
// import Pagination from '@/components/common/pagination';
// import { getTimestampAfter15Days } from '@/lib/utils/dateTime';
// import { Input as InputUI } from '@/components/ui/input';
// import { Button as ButtonUI } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { IoCloseCircleSharp } from 'react-icons/io5';
// import { MoreHorizontalIcon, Search } from 'lucide-react';
// import { debounce } from 'lodash';
// import ListSkeleton from '@/components/common/ListSkeleton';
// import { errorToast, successToast } from '@/lib/utils/toast';

// const ArchivedWorkspaces = () => {
//   const queryClient = useQueryClient();
//   const [filterValue, setFilterValue] = useState('');
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(50);
//   const isFetching = useIsFetching({
//     queryKey: ['allArchivedWorkspaces', page, pageSize, filterValue],
//   }) > 0;

//   const { data: allWorkspaceData } = useQuery({
//     queryKey: ['allArchivedWorkspaces', page, pageSize, filterValue],
//     queryFn: () =>
//       GetAllArchivedWorkspaces({
//         page,
//         pageSize,
//         workspaceStatus: 'archived',
//         search: filterValue,
//       }),
//     select: (data: any) => {
//       if (data && data.data) {
//         let _counts = 0;
//         let totalPages = 0;
//         if (data?.counts) {
//           _counts = data?.counts;
//         }
//         if (data?.total_pages) {
//           totalPages = data?.total_pages;
//         }
//         const workspaces = data.data.map((item: any) => ({
//           id: item.id,
//           name: item.workspace_name,
//           size: item.size ? convertKBToGB(item.size.toString()) : 'No data',
//           description: item.description,
//           archivedAt: item.updated_at,
//           archivedBy: item?.updated_by?.username,
//         }));
//         return {
//           allWorkspaces: workspaces,
//           counts: _counts,
//           totalPages: totalPages,
//         };
//       }
//       return {
//         allWorkspaces: [],
//         counts: 0,
//         totalPages: 0,
//       };
//     },
//     placeholderData: () => {
//       return {
//         allWorkspaces: [],
//         counts: 0,
//         totalPages: 0,
//       };
//     },
//   });

//   const { mutate: restoreWorkspace } = useMutation({
//     mutationFn: EditWorkspace,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['allArchivedWorkspaces'] });
//       successToast(null, 'Workspace', 'restored ');
//     },
//     onError: (error: any) => {
//       console.error('Error restoring workspace:', error);
//       errorToast(error);
//     },
//   });

//   const handleRestoreWorkspace = (workspace: any) => {
//     restoreWorkspace({
//       id: workspace,
//       workspace_status: 'notstarted',
//     });
//   };

//   const TopContent = memo(() => {
//     const [searchValue, setSearchValue] = useState(filterValue);
//     const debouncedSearch = useRef(
//       debounce((value: string) => {
//         setFilterValue(value);
//         setPage(1);
//       }, 800)
//     ).current;

//     useEffect(() => {
//       return () => debouncedSearch.cancel();
//     }, [debouncedSearch]);

//     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       const value = e.target.value;
//       setSearchValue(value);
//       debouncedSearch(value);
//     };

//     const handleClearSearch = () => {
//       setSearchValue('');
//       setFilterValue('');
//       setPage(1);
//     };

//     return (
//       <div className="flex flex-col gap-4 text-black">
//         <div className="flex items-center justify-between">
//           <div className="relative">
//             <InputUI
//               type="search"
//               placeholder="Search workspace..."
//               className="rounded-md w-[343px] h-[36px] pl-10 border-[#E4E4E7] text-sm font-normal text-[#71717A] focus:border-[#18181B] focus:ring-0 focus:outline-none"
//               aria-label="Search Workspaces"
//               value={searchValue}
//               onChange={handleSearchChange}
//             />
//             <Search
//               size={16}
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//             />
//             {searchValue && (
//               <button
//                 onClick={handleClearSearch}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2"
//                 aria-label="Clear search"
//               >
//                 <IoCloseCircleSharp className="h-4 w-4 text-gray-400 hover:text-gray-600" />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   });

//   TopContent.displayName = 'TopContent';

//   const BottomContent = () => {
//     return (
//       <Pagination
//         className="ml-[256px] pl-[15px]"
//         pageSize={pageSize}
//         setPageSize={setPageSize}
//         page={page}
//         setPage={setPage}
//         totalPages={Math.ceil((allWorkspaceData?.counts || 0) / pageSize)}
//         nextPage={
//           page < Math.ceil((allWorkspaceData?.counts || 0) / pageSize)
//             ? page + 1
//             : null
//         }
//         prevPage={page > 1 ? page - 1 : null}
//         onPageChange={(newPage: number) => setPage(newPage)}
//         onPageSizeChange={(newSize: number) => {
//           setPageSize(newSize);
//           setPage(1);
//         }}
//       />
//     );
//   };

//   const renderWorkspaceActions = (workspace: any) => {
//     return (
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <ButtonUI
//             variant="ghost"
//             className="h-8 w-8 p-0 hover:bg-transparent"
//           >
//             <MoreHorizontalIcon className="h-4 w-4 text-[#71717A]" />
//           </ButtonUI>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end" className="w-[160px] p-2">
//           <DropdownMenuItem
//             onClick={() => handleRestoreWorkspace(workspace.id)}
//             className="flex items-center gap-2 text-sm text-black cursor-pointer px-3 py-2 hover:bg-gray-50"
//           >
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 16 16"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 d="M13.3334 4L6.00008 11.3333L2.66675 8"
//                 stroke="black"
//                 strokeWidth="1.33333"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//             Restore
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     );
//   };

//   const WorkspaceTable = () => {
//     const isLoadingState = isFetching;
//     const workspaces = allWorkspaceData?.allWorkspaces || [];

//     return (
//       <div>
//         <div className="pb-4">
//           <TopContent />
//         </div>
//         <div className="border-b">
//           <Table>
//             <TableHeader>
//               <TableRow className="h-10 border-b border-[#E4E4E7]">
//                 <TableHead className="text-[#71717A] font-medium">Workspace name</TableHead>
//                 <TableHead className="text-[#71717A] font-medium">Storage used (GB)</TableHead>
//                 <TableHead className="text-[#71717A] font-medium">Archived at</TableHead>
//                 <TableHead className="text-[#71717A] font-medium">Archived by</TableHead>
//                 <TableHead className="text-[#71717A] font-medium">Permanent deletion date</TableHead>
//                 <TableHead className="text-[#71717A] font-medium">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {isLoadingState ? (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-8">
//                     <div className="flex items-center justify-center gap-2">
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
//                       <span>Loading archived workspaces...</span>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : workspaces.length > 0 ? (
//                 workspaces.map((workspace: any) => (
//                   <TableRow
//                     key={workspace.id}
//                     className="h-10 border-b border-[#E4E4E7] last:border-b-0 hover:bg-gray-50"
//                   >
//                     <TableCell className="text-sm pl-4 text-[#18181B] font-normal">
//                       {workspace.name}
//                     </TableCell>
//                     <TableCell className="text-sm pl-4 text-[#18181B] font-normal">
//                       {workspace.size}
//                     </TableCell>
//                     <TableCell className="text-sm pl-4 text-[#18181B] font-normal">
//                       {new Date(workspace?.archivedAt).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell className="text-sm pl-4 text-[#18181B] font-normal">
//                       {workspace.archivedBy}
//                     </TableCell>
//                     <TableCell className="text-sm pl-4 text-[#18181B] font-normal">
//                       {new Date(
//                         getTimestampAfter15Days(workspace.archivedAt)
//                       ).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell className="text-sm pl-4 text-[#18181B] font-normal">
//                       {renderWorkspaceActions(workspace)}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-12">
//                     <div className="flex flex-col items-center justify-center gap-2">
//                       <p className="text-lg font-medium text-gray-500">No data available</p>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//         <div className="sticky bottom-0 bg-white py-2 pt-4 border-t border-[#E4E4E7] z-50">
//           <BottomContent />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="flex text-black bg-white flex-col h-screen overflow-y-scroll justify-between w-full relative">
//         <div className="flex w-full flex-1 relative z-0">
//           <div className="fixed left-0 top-0 h-full">
//             <SideBar />
//           </div>

//           <div className="flex flex-col z-30 overflow-auto p-5 w-full mb-[30px] ml-[256px] pl-[15px] mt-4">
//             <div className="flex w-full justify-between items-center">
//               <div className="text-xl font-semibold font-sans text-[#3D3D3D] leading-[100%] mt-4">
//                 Archived Applications
//               </div>
//             </div>

//             <div className="w-full mt-4">
//               <WorkspaceTable />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ArchivedWorkspaces;
