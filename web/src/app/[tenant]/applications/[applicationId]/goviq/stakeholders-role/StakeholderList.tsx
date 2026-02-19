'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// UI Components
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Custom Components
import Pagination from '@/components/common/pagination';
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal';

// Icons
import {
  Info,
  Search,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';

// Utils
import { useDebounce } from '@/hooks/useDebounce';
import StakeholderRoleModals, { getRoleLabel, getUserLabel } from './Modal';
import DynamicDetailsViewModal from '@/components/modal/DynamicDetailsViewModal';

interface StakeholderRoleProps {
  hasQAReadPermission?: boolean;
  hasQAWritePermission?: boolean;
  setComponent?: any;
}

// Constants
const DEFAULT_PAGE_SIZE = 50;
const INITIAL_PAGE = 1;

// Updated interfaces for the new structure
interface UserRole {
  id: string;
  user: string;
  role: string;
}

interface StakeholdersRole {
  id: string;
  userRoles: UserRole[];
}

interface AddStakeholderRoleData {
  userRoles: UserRole[];
}

interface ValidationError {
  userRoles?: string;
  users?: { [key: string]: string };
  roles?: { [key: string]: string };
}

// Interface for individual table rows
interface UserRoleTableRow {
  stakeholderId: string;
  userRoleId: string;
  user: string;
  role: string;
  stakeholderData: StakeholdersRole; // Reference to original stakeholder data
}

const INITIAL_ADD_QA_TEST_DATA: AddStakeholderRoleData = {
  userRoles: [],
};

// Helper function to generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Main Component
const StakeholdersRolePage: React.FC<StakeholderRoleProps> = ({
  hasQAReadPermission = true,
  hasQAWritePermission = true,
  setComponent,
}) => {
  const router = useRouter();

  // Mock data and functions (replace with your actual context)
  const [stakeholderRole, setStakeholderRole] = useState<StakeholdersRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(true);

  // Mock CRUD functions (replace with your actual context functions)
  const createQATest = async (data: AddStakeholderRoleData) => {
    console.log('data', data)
    setLoading(true);
    try {
      const newStakeholder: StakeholdersRole = {
        id: generateId(),
        userRoles: data.userRoles,
      };
      setStakeholderRole(prev => [...prev, newStakeholder]);
    } finally {
      setLoading(false);
    }
  };

  const updateQATest = async (id: string, data: StakeholdersRole) => {
    setLoading(true);
    try {
      setStakeholderRole(prev => prev.map(item =>
        item.id === id ? data : item
      ));
    } finally {
      setLoading(false);
    }
  };

  const deleteQATest = async (id: string) => {
    setLoading(true);
    try {
      setStakeholderRole(prev => prev.filter(item => item.id !== id));
    } finally {
      setLoading(false);
    }
  };

  // Transform stakeholder data into individual user-role rows
  const transformToTableRows = (stakeholders: StakeholdersRole[]): UserRoleTableRow[] => {
    const rows: UserRoleTableRow[] = [];

    stakeholders.forEach(stakeholder => {
      stakeholder.userRoles.forEach(userRole => {
        rows.push({
          stakeholderId: stakeholder.id,
          userRoleId: userRole.id,
          user: userRole.user,
          role: userRole.role,
          stakeholderData: stakeholder
        });
      });
    });

    return rows;
  };

  const searchUserRoleRows = (query: string, rows: UserRoleTableRow[]) => {
    if (!query.trim()) return rows;

    return rows.filter(row =>
      getUserLabel(row.user).toLowerCase().includes(query.toLowerCase()) ||
      getRoleLabel(row.role).toLowerCase().includes(query.toLowerCase())
    );
  };

  // State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(INITIAL_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Modal states
  const [openModal, setOpenModal] = useState('');
  const [deleteQATestModal, setDeleteQATestModal] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Data states
  const [selectedStakeholderRole, setSelectedQATest] = useState<StakeholdersRole | null>(null);
  const [editQATestData, setEditQATestData] = useState<StakeholdersRole | null>(null);
  const [addQATestData, setAddQATestData] = useState<AddStakeholderRoleData>(INITIAL_ADD_QA_TEST_DATA);
  const [qaTestToDelete, setQATestToDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationError>({});

  const debouncedSearch = useDebounce(search, 500);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(INITIAL_PAGE);
  }, [debouncedSearch]);

  // Transform data to table rows and apply filtering
  const tableRows = useMemo(() => {
    return transformToTableRows(stakeholderRole);
  }, [stakeholderRole]);

  const filteredRows = useMemo(() => {
    return searchUserRoleRows(debouncedSearch, tableRows);
  }, [tableRows, debouncedSearch]);

  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, page, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  // Validation
  const validateStakeholderData = (data: AddStakeholderRoleData): ValidationError => {
    const newErrors: ValidationError = {
      users: {},
      roles: {}
    };

    if (data.userRoles.length === 0) {
      newErrors.userRoles = 'At least one user and role is required';
      return newErrors;
    }

    data.userRoles.forEach(userRole => {
      if (!userRole.user.trim()) {
        newErrors.users![userRole.id] = 'User name is required';
      }
      if (!userRole.role.trim()) {
        newErrors.roles![userRole.id] = 'Role is required';
      }
    });

    // Clean up empty error objects
    if (Object.keys(newErrors.users!).length === 0) delete newErrors.users;
    if (Object.keys(newErrors.roles!).length === 0) delete newErrors.roles;

    return newErrors;
  };

  // Modal handlers
  const handleOpenModal = useCallback((modalType: string) => {
    setOpenModal(modalType);
    setErrors({});
  }, []);

  const handleCloseModal = useCallback(() => {
    setOpenModal('');
    setErrors({});
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteQATestModal(false);
    setQATestToDelete(null);
  }, []);

  // CRUD Event Handlers
  const handleViewQATest = useCallback((stake: StakeholdersRole) => {
    setSelectedQATest(stake);
    setIsDetailsModalOpen(true);
  }, []);

  const handleEditQATest = useCallback((stake: StakeholdersRole) => {
    setEditQATestData(stake);
    handleOpenModal('edit qa test');
  }, [handleOpenModal]);

  const handleDeleteQATest = useCallback((stake: StakeholdersRole) => {
    setQATestToDelete(stake.id);
    setDeleteQATestModal(true);
  }, []);

  // Create QA test handlers
  const handleCreateInputChange = useCallback((data: AddStakeholderRoleData) => {
    setAddQATestData(data);

    // Clear validation errors when user makes changes
    setErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors.userRoles) delete newErrors.userRoles;
      if (newErrors.users) {
        data.userRoles.forEach(ur => {
          if (ur.user.trim() && newErrors.users![ur.id]) {
            delete newErrors.users![ur.id];
          }
        });
      }
      if (newErrors.roles) {
        data.userRoles.forEach(ur => {
          if (ur.role.trim() && newErrors.roles![ur.id]) {
            delete newErrors.roles![ur.id];
          }
        });
      }
      return newErrors;
    });
  }, []);

  const handleCreateSave = useCallback(async () => {
    const validationErrors = validateStakeholderData(addQATestData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createQATest(addQATestData);
      setAddQATestData(INITIAL_ADD_QA_TEST_DATA);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating QA test:', error);
    }
  }, [addQATestData, handleCloseModal]);

  const handleCreateClose = useCallback(() => {
    setAddQATestData(INITIAL_ADD_QA_TEST_DATA);
    handleCloseModal();
  }, [handleCloseModal]);

  // Edit QA test handlers
  const handleEditQATestChange = useCallback((stake: StakeholdersRole) => {
    setEditQATestData(stake);
  }, []);

  const handleEditSave = useCallback(async (stake: StakeholdersRole) => {
    const validationErrors = validateStakeholderData({
      userRoles: stake.userRoles,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await updateQATest(stake.id, stake);
      setEditQATestData(null);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating QA test:', error);
    }
  }, [handleCloseModal]);

  const handleEditClose = useCallback(() => {
    setEditQATestData(null);
    handleCloseModal();
  }, [handleCloseModal]);

  // Delete QA test handlers
  const handleDeleteConfirm = useCallback(async () => {
    if (!qaTestToDelete) return;

    try {
      await deleteQATest(qaTestToDelete);
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Error deleting QA test:', error);
    }
  }, [handleCloseDeleteModal, qaTestToDelete]);

  // Render table row actions
  const renderActions = useCallback((row: UserRoleTableRow) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          disabled={!hasQAReadPermission}
          onClick={() => handleViewQATest(row.stakeholderData)}
        >
          <Info className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!hasQAWritePermission}
          onClick={() => handleEditQATest(row.stakeholderData)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <div className="border-t border-gray-200 my-1"></div>
        <DropdownMenuItem
          disabled={!hasQAWritePermission}
          onClick={() => handleDeleteQATest(row.stakeholderData)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ), [hasQAReadPermission, hasQAWritePermission, handleViewQATest, handleEditQATest, handleDeleteQATest]);

  // Show loading state while initializing
  if (!initialized && loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span>Loading QA environment testing data...</span>
        </div>
      </div>
    );
  }

  // Render loading state
  const renderLoadingState = () => (
    <TableRow>
      <TableCell colSpan={3} className="text-center py-8">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span>Loading QA environment testing data...</span>
        </div>
      </TableCell>
    </TableRow>
  );

  // Render empty state
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={3} className="text-center py-12">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-lg font-medium text-gray-500">
            {search ? 'No stakeholder roles found' : 'No stakeholder roles available'}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );

  // Render table rows
  const renderTableRows = () => {
    if (loading) return renderLoadingState();
    if (!paginatedRows.length) return renderEmptyState();

    return paginatedRows.map((row: UserRoleTableRow, index: number) => (
      <TableRow
        key={`${row.stakeholderId}-${row.userRoleId}-${index}`}
        className="h-10 border-b border-[#E4E4E7] last:border-b-0 hover:bg-gray-50"
      >
        <TableCell className="font-sm font-normal font-sans text-[#18181B]">
          {getUserLabel(row.user)}
        </TableCell>
        <TableCell className="font-sm font-normal font-sans text-[#18181B]">
          {getRoleLabel(row.role)}
        </TableCell>
        <TableCell className="font-sm font-normal font-sans text-[#18181B]">
          {renderActions(row)}
        </TableCell>
      </TableRow>
    ));
  };

  // Get QA test to delete name for modal
  const qaTestToDeleteData = qaTestToDelete ?
    stakeholderRole.find(q => q.id === qaTestToDelete) : null;

  return (
    <div className="m-4">
      <div className="h-screen overflow-y-auto scrollbar-hide scroll-smooth w-full">
        <div className="mx-auto space-y-4">
          <div className="mb-6 flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Stakeholders & Role</h1>
          </div>
          {/* Search Input */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search users or roles"
                name="qa-testing-search"
                className="rounded-md w-[343px] h-[36px] pl-10 border-[#E4E4E7] text-sm font-normal text-[#71717A] focus:border-[#18181B] focus:ring-0 focus:outline-none"
                aria-label="qa-testing-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            {hasQAWritePermission && (
              <Button
                onClick={() => handleOpenModal('create qa test')}
                className="h-9 px-4 bg-black text-white hover:bg-black/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            )}
          </div>

          {/* Data Table */}
          <div className="w-full py-2 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="h-10 border-b border-[#E4E4E7]">
                  <TableHead className="text-[#71717A] font-medium">
                    User
                  </TableHead>
                  <TableHead className="text-[#71717A] font-medium">
                    Role
                  </TableHead>
                  <TableHead className="text-[#71717A] font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableRows()}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredRows.length > 0 && (
            <div className="sticky bottom-0 bg-white py-2 pt-4 border-t border-[#E4E4E7] z-50">
              <Pagination
                className="ml-[256px] pl-[15px]"
                pageSize={pageSize}
                setPageSize={setPageSize}
                page={page}
                setPage={setPage}
                nextPage={page < totalPages ? page + 1 : null}
                prevPage={page > 1 ? page - 1 : null}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                totalPages={totalPages}
                isLoading={loading}
              />
            </div>
          )}
        </div>
      </div>

      <DynamicDetailsViewModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        data={selectedStakeholderRole}
        title="Stakeholders & Role Details"
        fields={[
          {
            key: 'userRoles',
            label: 'Users & Roles',
            type: 'custom',
            render: (data: StakeholdersRole) => (
              <div className="space-y-2">
                {data?.userRoles?.map((ur, index) => (
                  <div key={ur.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{getUserLabel(ur.user)}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {getRoleLabel(ur.role)}
                    </span>
                  </div>
                ))}
              </div>
            )
          },
        ]}
      />

      {/* QA Test CRUD Modals */}
      <StakeholderRoleModals
        // Modal state
        openModal={openModal}

        // Data
        editQATestData={editQATestData}
        addQATestData={addQATestData}
        errors={errors}

        // Loading states
        isEditPending={loading}
        isCreatePending={loading}

        // Event handlers
        onEditClose={handleEditClose}
        onCreateClose={handleCreateClose}
        onEditSave={handleEditSave}
        onCreateSave={handleCreateSave}
        onEditQATestChange={handleEditQATestChange}
        onCreateInputChange={handleCreateInputChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteQATestModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={loading}
        title="Are you sure you want to delete this Stakeholder role?"
        itemType="Stakeholder Role"
        itemName={qaTestToDeleteData ? `${qaTestToDeleteData.userRoles.length} user(s)` : ''}
      />
    </div>
  );
};

export default StakeholdersRolePage;
