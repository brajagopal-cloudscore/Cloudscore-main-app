import React from 'react';
import { Loader, Plus, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface StakeholderRoleModalsProps {
  // Modal state
  openModal: string;

  // Data
  editQATestData: StakeholdersRole | null;
  addQATestData: AddStakeholderRoleData;
  errors: ValidationError;

  // Loading states
  isEditPending: boolean;
  isCreatePending: boolean;

  // Event handlers
  onEditClose: () => void;
  onCreateClose: () => void;
  onEditSave: (qaTest: StakeholdersRole) => void;
  onCreateSave: () => void;
  onEditQATestChange: (qaTest: StakeholdersRole) => void;
  onCreateInputChange: (data: AddStakeholderRoleData) => void;
}

// Available roles for the dropdown
const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'reviewer', label: 'Reviewer' },
  { value: 'developer', label: 'Developer' },
  { value: 'monitoring_lead', label: 'Monitoring Lead' },
  { value: 'approver', label: 'Approver' },
  { value: 'tester', label: 'Tester' },
  { value: 'analyst', label: 'Analyst' },
];

const USER_OPTIONS = [
  { value: 'john_doe', label: 'John Doe' },
  { value: 'jane_smith', label: 'Jane Smith' },
  { value: 'mike_johnson', label: 'Mike Johnson' },
  { value: 'sarah_wilson', label: 'Sarah Wilson' },
  { value: 'david_brown', label: 'David Brown' },
  { value: 'lisa_davis', label: 'Lisa Davis' },
  { value: 'robert_garcia', label: 'Robert Garcia' },
  { value: 'emily_martinez', label: 'Emily Martinez' },
  { value: 'james_anderson', label: 'James Anderson' },
  { value: 'maria_rodriguez', label: 'Maria Rodriguez' },
  { value: 'christopher_lee', label: 'Christopher Lee' },
  { value: 'amanda_taylor', label: 'Amanda Taylor' },
  { value: 'daniel_thomas', label: 'Daniel Thomas' },
  { value: 'jessica_white', label: 'Jessica White' },
  { value: 'michael_harris', label: 'Michael Harris' },
  { value: 'jennifer_clark', label: 'Jennifer Clark' },
  { value: 'william_lewis', label: 'William Lewis' },
  { value: 'stephanie_walker', label: 'Stephanie Walker' },
  { value: 'kevin_hall', label: 'Kevin Hall' },
  { value: 'nicole_allen', label: 'Nicole Allen' },
  { value: 'alex_martinez', label: 'Alex Martinez' },
  { value: 'ryan_cooper', label: 'Ryan Cooper' },
  { value: 'samantha_bell', label: 'Samantha Bell' },
  { value: 'brandon_murphy', label: 'Brandon Murphy' },
  { value: 'rachel_ward', label: 'Rachel Ward' },
  { value: 'jonathan_rivera', label: 'Jonathan Rivera' },
  { value: 'michelle_torres', label: 'Michelle Torres' },
  { value: 'andrew_parker', label: 'Andrew Parker' },
  { value: 'kimberly_evans', label: 'Kimberly Evans' },
  { value: 'matthew_collins', label: 'Matthew Collins' },
  { value: 'ashley_stewart', label: 'Ashley Stewart' },
  { value: 'joshua_sanchez', label: 'Joshua Sanchez' },
  { value: 'natalie_morris', label: 'Natalie Morris' },
  { value: 'tyler_reed', label: 'Tyler Reed' },
  { value: 'megan_cook', label: 'Megan Cook' },
  { value: 'nathan_bailey', label: 'Nathan Bailey' },
  { value: 'lindsay_cooper', label: 'Lindsay Cooper' },
  { value: 'eric_richardson', label: 'Eric Richardson' },
  { value: 'crystal_cox', label: 'Crystal Cox' },
  { value: 'jordan_howard', label: 'Jordan Howard' },
];

// Helper function to get user label from value
export const getUserLabel = (userValue: string) => {
  const user = USER_OPTIONS.find(u => u.value === userValue);
  return user ? user.label : userValue;
};

// Helper function to get role label from value
export const getRoleLabel = (roleValue: string) => {
  const role = ROLE_OPTIONS.find(r => r.value === roleValue);
  return role ? role.label : roleValue;
};

const StakeholderRoleModals: React.FC<StakeholderRoleModalsProps> = ({
  // Modal state
  openModal,

  // Data
  editQATestData,
  addQATestData,
  errors,

  // Loading states
  isEditPending,
  isCreatePending,

  // Event handlers
  onEditClose,
  onCreateClose,
  onEditSave,
  onCreateSave,
  onEditQATestChange,
  onCreateInputChange,
}) => {

  // Helper function to generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Add new user role for create modal
  const handleAddUserRole = () => {
    const newUserRole: UserRole = {
      id: generateId(),
      user: '',
      role: ''
    };

    const updatedData = {
      ...addQATestData,
      userRoles: [...addQATestData.userRoles, newUserRole]
    };

    onCreateInputChange(updatedData);
  };

  // Remove user role for create modal
  const handleRemoveUserRole = (id: string) => {
    const updatedData = {
      ...addQATestData,
      userRoles: addQATestData.userRoles.filter(ur => ur.id !== id)
    };

    onCreateInputChange(updatedData);
  };

  // Update user role for create modal
  const handleUpdateUserRole = (id: string, field: 'user' | 'role', value: string) => {
    const updatedData = {
      ...addQATestData,
      userRoles: addQATestData.userRoles.map(ur =>
        ur.id === id ? { ...ur, [field]: value } : ur
      )
    };

    onCreateInputChange(updatedData);
  };

  // Add new user role for edit modal
  const handleEditAddUserRole = () => {
    if (!editQATestData) return;

    const newUserRole: UserRole = {
      id: generateId(),
      user: '',
      role: ''
    };

    const updatedData = {
      ...editQATestData,
      userRoles: [...editQATestData.userRoles, newUserRole]
    };

    onEditQATestChange(updatedData);
  };

  // Remove user role for edit modal
  const handleEditRemoveUserRole = (id: string) => {
    if (!editQATestData) return;

    const updatedData = {
      ...editQATestData,
      userRoles: editQATestData.userRoles.filter(ur => ur.id !== id)
    };

    onEditQATestChange(updatedData);
  };

  // Update user role for edit modal
  const handleEditUpdateUserRole = (id: string, field: 'user' | 'role', value: string) => {
    if (!editQATestData) return;

    const updatedData = {
      ...editQATestData,
      userRoles: editQATestData.userRoles.map(ur =>
        ur.id === id ? { ...ur, [field]: value } : ur
      )
    };

    onEditQATestChange(updatedData);
  };

  // Initialize with one empty user role if none exist
  React.useEffect(() => {
    if (openModal === 'create qa test' && addQATestData.userRoles.length === 0) {
      handleAddUserRole();
    }
  }, [openModal]);

  return (
    <>
      {/* Edit QA Test Modal */}
      <Dialog
        open={openModal === 'edit qa test'}
        onOpenChange={(open) => !open && onEditClose()}
      >
        <DialogTitle className="sr-only">Edit Stakeholder & Role</DialogTitle>
        <DialogContent className="sm:max-w-[700px] text-black p-0 gap-0 z-50 max-h-[90vh] overflow-y-auto">
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Edit Stakeholder & Role
            </h3>
          </div>

          {editQATestData && (
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Users & Roles*</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEditAddUserRole}
                    className="h-8 px-3"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add User
                  </Button>
                </div>

                {editQATestData.userRoles.map((userRole, index) => (
                  <div key={userRole.id} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5 space-y-2">
                      <Label htmlFor={`edit-user-${userRole.id}`} className="text-sm font-medium">
                        User*
                      </Label>
                      <Input
                        id={`edit-user-${userRole.id}`}
                        className={`${errors.users?.[userRole.id] ? 'border-destructive' : ''} h-9`}
                        value={userRole.user}
                        onChange={(e) => handleEditUpdateUserRole(userRole.id, 'user', e.target.value)}
                        placeholder="Enter user name"
                      />
                      {errors.users?.[userRole.id] && (
                        <p className="text-sm text-red-500 text-destructive">
                          {errors.users[userRole.id]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-5 space-y-2">
                      <Label htmlFor={`edit-role-${userRole.id}`} className="text-sm font-medium">
                        Role*
                      </Label>
                      <Select
                        value={userRole.role}
                        onValueChange={(value) => handleEditUpdateUserRole(userRole.id, 'role', value)}
                      >
                        <SelectTrigger className={`${errors.roles?.[userRole.id] ? 'border-destructive' : ''} h-9`}>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.roles?.[userRole.id] && (
                        <p className="text-sm text-red-500 text-destructive">
                          {errors.roles[userRole.id]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 flex justify-end">
                      {editQATestData.userRoles.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRemoveUserRole(userRole.id)}
                          className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {errors.userRoles && (
                  <p className="text-sm text-red-500 text-destructive">
                    {errors.userRoles}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-gray-600 dark:bg-gray-900 dark:hover:bg-blue-900 transition-colors"
              variant="secondary"
              disabled={isEditPending}
              onClick={() => editQATestData && onEditSave(editQATestData)}
            >
              {isEditPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create QA Test Modal */}
      <Dialog
        open={openModal === 'create qa test'}
        onOpenChange={(open) => !open && onCreateClose()}
      >
        <DialogTitle className="sr-only">Create Stakeholder & Role</DialogTitle>
        <DialogContent className="sm:max-w-[700px] text-black p-0 gap-0 max-h-[90vh] overflow-y-auto">
          <div className="p-6 pb-4 space-y-1 border-b">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Create Stakeholder & Role
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Users & Roles*</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddUserRole}
                  className="h-8 px-3"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add User
                </Button>
              </div>

              {addQATestData.userRoles.map((userRole, index) => (
                <div key={userRole.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5 space-y-2">
                    <Label htmlFor={`user-${userRole.id}`} className="text-sm font-medium">
                      User*
                    </Label>
                    <Select
                      value={userRole.user}
                      onValueChange={(value) => handleUpdateUserRole(userRole.id, 'user', value)}
                    >
                      <SelectTrigger className={`${errors.users?.[userRole.id] ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.users?.[userRole.id] && (
                      <p className="text-sm text-red-500 text-destructive">
                        {errors.users[userRole.id]}
                      </p>
                    )}
                  </div>

                  <div className="col-span-5 space-y-2">
                    <Label htmlFor={`role-${userRole.id}`} className="text-sm font-medium">
                      Role*
                    </Label>
                    <Select
                      value={userRole.role}
                      onValueChange={(value) => handleUpdateUserRole(userRole.id, 'role', value)}
                    >
                      <SelectTrigger className={`${errors.roles?.[userRole.id] ? 'border-red-500 focus-visible:border-red-500 border-destructive' : ''} h-9`}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.roles?.[userRole.id] && (
                      <p className="text-sm text-red-500 text-destructive">
                        {errors.roles[userRole.id]}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 flex justify-end">
                    {addQATestData.userRoles.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUserRole(userRole.id)}
                        className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {errors.userRoles && (
                <p className="text-sm text-red-500 text-destructive">
                  {errors.userRoles}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={onCreateClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-black text-white hover:bg-gray-600 dark:bg-gray-900 dark:hover:bg-blue-900 transition-colors"
              disabled={isCreatePending}
              onClick={onCreateSave}
            >
              {isCreatePending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StakeholderRoleModals;
