import React from 'react';
import Link from 'next/link';
import { Archive, MoreHorizontal, Pencil, Trash2, Network } from 'lucide-react';
import { GoDotFill } from 'react-icons/go';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { Policy, Workspace } from '@/types';
import { checkWorkspacePermissions } from '@/lib/utils/roleBasedPermissions';
import { getStatusLabel, getStatusStyle } from '@/lib/utils/helpers';

interface WorkspaceTableProps {
  workspaces: Workspace[];
  userProfile: any;
  allPolicies: Policy[];
  openDropdownId: string | null;
  onDropdownOpenChange: (open: boolean, workspaceId: string) => void;
  onEditWorkspace: (workspace: Workspace) => void;
  onArchiveWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  setSelectedSources: (sources: any[]) => void;
  setSelectedComponents: (components: any[]) => void;
  isLoading?: boolean;
  onSort?: () => void; // Optional sort handler
}

const WorkspaceTable: React.FC<WorkspaceTableProps> = ({
  workspaces,
  userProfile,
  openDropdownId,
  onDropdownOpenChange,
  onEditWorkspace,
  onArchiveWorkspace,
  onDeleteWorkspace,
  setSelectedSources,
  setSelectedComponents,
  isLoading,
  onSort
}) => {

  const handleWorkspaceClick = (workspace: Workspace) => {
    setSelectedSources([]);
    setSelectedComponents([]);
    localStorage.setItem('selectedUser', JSON.stringify(workspace));
    localStorage.setItem('tab', 'home');
  };

  const handleDropdownAction = (action: () => void, workspaceId: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Close the dropdown immediately
      onDropdownOpenChange(false, workspaceId);

      // Reset pointer events
      document.body.style.pointerEvents = 'auto';

      // Execute the action after a small delay to ensure dropdown closes smoothly
      setTimeout(() => {
        action();
      }, 50);
    };
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span>Loading workspaces...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!workspaces.length) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-12">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-lg font-medium text-gray-500">No data available</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return workspaces.map((workspace) => (
      <TableRow
        key={workspace.id}
        className="h-10 border-b border-[#E4E4E7] last:border-b-0 hover:bg-gray-50"
      >
        <TableCell className="font-sm font-medium font-sans hover:cursor-pointer hover:text-[#0000EE] hover:underline">
          <div className="flex gap-1 items-center">
            <Network height={12} width={12} className="text-inherit" />
            <Link
              href={`/workspaces/${workspace.id}`}
              className="text-inherit text-sm font-normal leading-[20px] font-sans hover:underline"
              onClick={() => handleWorkspaceClick(workspace)}
            >
              {workspace.name}
            </Link>
          </div>
        </TableCell>

        <TableCell className="font-sm font-normal font-sans">
          <div className={`inline-flex items-center px-[9px] py-[2px] rounded-full font-semibold leading-normal transition-colors duration-200 ${getStatusStyle(workspace?.status as any)}`}>
            <GoDotFill size={15} />
            {getStatusLabel(workspace.status)}
          </div>
        </TableCell>

        <TableCell className="font-sm font-normal font-sans text-[#18181B]">
          {workspace.size}
        </TableCell>

        <TableCell className="text-[#18181B] font-sm font-normal leading-[20px] font-sans hover:text-gray-600">
          {new Date(workspace.lastModifiedDate).toLocaleDateString()}
        </TableCell>

        <TableCell className="text-[#18181B] font-sm font-normal leading-[20px] font-sans hover:text-gray-600">
          {workspace.lastModifiedBy}
        </TableCell>

        <TableCell className="text-right mr-4">
          <DropdownMenu
            open={openDropdownId === workspace.id}
            onOpenChange={(open) => onDropdownOpenChange(open, workspace.id)}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="text-[#18181B] h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                disabled={!checkWorkspacePermissions(workspace, userProfile)}
                onClick={handleDropdownAction(() => onEditWorkspace(workspace), workspace.id)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <div className="border-t border-gray-200 my-1"></div>

              <DropdownMenuItem
                disabled={!checkWorkspacePermissions(workspace, userProfile)}
                onClick={handleDropdownAction(() => {
                  onDeleteWorkspace(workspace.id);
                }, workspace.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow >
    ));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="h-10 border-b border-[#E4E4E7]">
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Storage Used (GB)</TableHead>
          <TableHead>
            {onSort ? (
              <div
                className="flex items-center cursor-pointer hover:text-gray-600"
                onClick={onSort}
              >
                Last Modified
                <span className="ml-1 text-xs">↕</span>
              </div>
            ) : (
              'Last Modified'
            )}
          </TableHead>
          <TableHead>Last Modified By</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-sm font-normal text-[#18181B]">
        {renderTableContent()}
      </TableBody>
    </Table>
  );
};

export default WorkspaceTable;
