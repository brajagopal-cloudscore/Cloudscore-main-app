"use client";
import SideBar from "@/components/admin/sidebar/Sidebar";
import React, { useEffect, useState, useRef, memo } from "react";
import { IoCloseCircleSharp } from "react-icons/io5";
import { MdPersonAddAlt } from "react-icons/md";
import "@/components/admin/admin.css";
import { errorToast, successToast } from "@/lib/utils/toast";
// Removed API imports - using static data instead
import { UserProfile } from "@/types";
import { validateEmail } from "@/lib/utils/validateEmail";
import { BsEyeFill } from "react-icons/bs";
import { BsEyeSlashFill } from "react-icons/bs";

import { Input as InputUI } from "@/components/ui/input";
// Removed export API import - using static behavior instead

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSymlink, Loader2, MoreHorizontalIcon, Pencil, Search } from "lucide-react";
// Removed unused imports - using static data instead
import ListSkeleton from "@/components/common/ListSkeleton";
import Pagination from "@/components/common/pagination";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button as ButtonUI } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RotateCw, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const ActiveUsers = () => {
  const [filterValue, setFilterValue] = React.useState("");
  const [open, setOpen] = useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = useState(50);
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.organization?.id;

  const [allUsersData, setAllUsersData] = useState<{
    users: any[];
    counts: number;
  }>({ users: [], counts: 0 });
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch users from server action
  const refetchUsers = React.useCallback(async () => {
    if (!orgId) return;

    try {
      setIsFetchingUsers(true);
      setIsFetching(true);
      const { getActiveUsers } = await import("@/lib/actions/users");
      const data = await getActiveUsers({
        page,
        pageSize,
        search: filterValue || undefined,
      });

      if (data.success) {
        setAllUsersData({
          users: data.users || [],
          counts: data.counts || 0,
        });
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      errorToast(error.message || "Failed to fetch users");
    } finally {
      setIsFetchingUsers(false);
      setIsFetching(false);
    }
  }, [orgId, page, pageSize, filterValue]);

  // Fetch users on mount and when dependencies change
  React.useEffect(() => {
    refetchUsers();
  }, [refetchUsers]);

  const [addUserData, setAddUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "member",
  });
  const [error, setError] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add user function
  const addUser = React.useCallback(
    async (data: any) => {
      if (!orgId) return;

      try {
        setIsLoading(true);
        const { createUser } = await import("@/lib/actions/users");
        await createUser(data);
        successToast(
          "User added successfully",
          "User",
          "added to both Clerk and database"
        );
        setOpen("");
        setAddUserData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          role: "member",
        });
        refetchUsers();
      } catch (error: any) {
        console.error("Error adding user:", error);
        errorToast(error.message || "Failed to add user");
      } finally {
        setIsLoading(false);
      }
    },
    [orgId, refetchUsers]
  );

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isUpdatingUserState, setIsUpdatingUserState] = useState(false);

  // Update user function
  const updateUser = React.useCallback(
    async ({
      updateUserPayload,
      id,
    }: {
      updateUserPayload: any;
      id: string;
    }) => {
      if (!orgId) return;

      try {
        setIsUpdatingUserState(true);
        const { updateUser: updateUserAction } = await import(
          "@/lib/actions/users"
        );
        await updateUserAction(id, updateUserPayload, orgId);

        if (!updateUserPayload.status) {
          successToast(
            "User deactivated successfully",
            "User",
            "deactivated "
          );
        } else {
          successToast(
            "User updated successfully",
            "User",
            "updated "
          );
        }
        setOpen("");
        setSelectedUser(null);
        setAddUserData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          role: "member",
        });
        refetchUsers();
      } catch (error: any) {
        console.error("Error updating user:", error);
        errorToast(error.message || "Failed to update user");
      } finally {
        setIsUpdatingUserState(false);
      }
    },
    [orgId, refetchUsers]
  );

  const isUpdatingUser = isUpdatingUserState;

  // Reset password function
  const resetPassword = React.useCallback(async (data: {
    password: string;
    userId: string;
    clerkId?: string;
  }) => {
    try {
      setIsResettingPassword(true);
      const { resetUserPassword } = await import("@/lib/actions/users");
      await resetUserPassword(data.userId, data.password);
      successToast("Password reset successfully", "Password", "reset ");
      setOpen("");
      setSelectedUser(null);
      setAddUserData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "member",
      });
      setError({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      errorToast(error.message || "Failed to reset password");
    } finally {
      setIsResettingPassword(false);
    }
  }, []);

  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const isPasswordStrong = (password: string) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return strongRegex.test(password);
  };

  const handleDeactivateUser = async (user: UserProfile) => {
    const _data = {
      username: user.username,
      status: false,
    };
    updateUser({ updateUserPayload: _data, id: user.id });
  };

  const formatDateForExport = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      // Format as DD-MM-YYYY HH:MM:SS UTC
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const seconds = String(date.getUTCSeconds()).padStart(2, "0");

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} UTC`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const csvData =
        "Name,Email,Role,Status,Created At\n" +
        allUsersData.users
          .map(
            (user) => {
              const displayName = user.name ||
                ((user as any).firstName && (user as any).lastName
                  ? `${(user as any).firstName} ${(user as any).lastName}`
                  : (user as any).firstName || (user as any).lastName || "");
              return `${displayName},${user.email || ""},${user.role || "member"},${user.status ? "Active" : "Inactive"},${formatDateForExport(user.created_at)}`;
            }
          )
          .join("\n");

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "active_users_export.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        successToast(null, "Active users", "exported ");
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
      errorToast("Export failed");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    resetPassword({
      password: addUserData.password,
      userId: selectedUser.id,
      clerkId: (selectedUser as any).clerkId,
    });
  };

  // Normalize role value to match RadioGroup options
  const normalizeRole = (role: string | undefined): string => {
    if (!role) return "member";
    // Trim whitespace and convert to lowercase for comparison
    const normalizedRole = role.trim().toLowerCase();

    // Check if it's an admin role - must check exact matches first, then contains
    if (
      normalizedRole === "org:admin" ||
      normalizedRole === "admin" ||
      (normalizedRole.includes("admin") && !normalizedRole.includes("member"))
    ) {
      return "org:admin";
    }
    // Default to member for all other cases (member, Member, org:member, etc.)
    return "member";
  };

  const handleEditUserClick = (user: UserProfile) => {
    // Split name into firstName and lastName, or use firstName/lastName if available
    const nameParts = (user as any).firstName && (user as any).lastName
      ? [(user as any).firstName, (user as any).lastName]
      : user.name ? user.name.split(" ") : ["", ""];
    const userRole = (user as any).role;
    const normalizedRole = normalizeRole(userRole);

    // Set all state synchronously
    setSelectedUser({
      ...user,
    });

    setAddUserData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: user.email,
      password: "",
      role: normalizedRole,
    });

    // Open dialog after state is set
    setOpen("edit user");
  };

  const handleResetPasswordClick = (user: UserProfile) => {
    setOpen("reset password");
    const nameParts = (user as any).firstName && (user as any).lastName
      ? [(user as any).firstName, (user as any).lastName]
      : user.name ? user.name.split(" ") : ["", ""];
    setAddUserData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: user.email,
      password: "",
      role: (user as any).role || "member",
    });
    setSelectedUser({
      ...user,
    });
    setError({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
  };

  const handleResetPasswordSubmit = async () => {
    if (!selectedUser) return;

    const _error = { ...error };

    if (addUserData.password === "") {
      _error.password = "Password is required!";
      setError(_error);
      return;
    }

    if (!isPasswordStrong(addUserData.password)) {
      _error.password = "Password is not strong enough";
      setError(_error);
      return;
    }

    _error.password = "";
    setError(_error);

    // Reset password directly
    await handleResetPassword();
  };

  const handleEditUserSubmit = async () => {
    if (!orgId || !user) return;

    const _error = error;
    const email = addUserData.email;
    if (addUserData.firstName === "") {
      _error.firstName = "First name is required";
    } else {
      _error.firstName = "";
    }

    if (!email) {
      _error.email =
        addUserData.email === ""
          ? "User email is required"
          : "Invalid email address";
    } else {
      _error.email = "";
    }

    setError({ ..._error });
    if (!validateEmail(email) || !addUserData.firstName || !user || !selectedUser)
      return;

    const fullName = `${addUserData.firstName} ${addUserData.lastName}`.trim();
    setOpen("");
    const _data = {
      username: fullName,
      name: fullName,
      firstName: addUserData.firstName,
      lastName: addUserData.lastName,
      email: email,
      status: true,
      role: addUserData.role,
    };

    updateUser({ updateUserPayload: _data, id: selectedUser.id });
  };

  const handleOpen = () => {
    setOpen("create user");
  };

  const TopContent = memo(() => {
    const [searchValue, setSearchValue] = useState(filterValue);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInternalUpdateRef = useRef(false);

    // Sync searchValue with filterValue when it changes externally
    React.useEffect(() => {
      if (!isInternalUpdateRef.current) {
        setSearchValue(filterValue);
      }
      isInternalUpdateRef.current = false;
    }, [filterValue]);

    // Debounce search with useEffect
    React.useEffect(() => {
      // Clear previous timeout
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timeout for debounced search
      debounceTimerRef.current = setTimeout(() => {
        isInternalUpdateRef.current = true;
        setFilterValue(searchValue);
        setPage(1);
      }, 500); // 500ms debounce delay

      // Cleanup on unmount or when searchValue changes
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [searchValue]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
    };

    const handleClearSearch = () => {
      setSearchValue("");
      setFilterValue("");
      setPage(1);
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="relative">
            <InputUI
              type="search"
              placeholder="Search by name...."
              className="rounded-md w-[343px] h-9 pl-10 text-sm font-normal focus:ring-0 focus:outline-none"
              aria-label="active users search"
              value={searchValue}
              onChange={handleSearchChange}
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            {searchValue && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                aria-label="clear active users search"
              >
                <IoCloseCircleSharp className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <ButtonUI onClick={handleExport} className="" disabled={isLoading}>
              {isLoading ? (
                <RotateCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileSymlink className="h-4 w-4" />
              )}
              <span className="text-sm">Export</span>
            </ButtonUI>
            {true && ( // Static permission - always allow
              <ButtonUI onClick={handleOpen} className="">
                <MdPersonAddAlt className="h-4 w-4" />
                <span className="text-sm">Add User</span>
              </ButtonUI>
            )}
          </div>
        </div>
      </div>
    );
  });

  TopContent.displayName = "TopContent";

  function validateEmailDomain(businessName: string, email: string) {
    const cleanedBusinessName = businessName.trim();
    const expectedDomain = cleanedBusinessName.toLowerCase();
    const emailParts = email.split("@");
    if (emailParts.length !== 2) {
      return false;
    }
    const emailDomain = emailParts[1].toLowerCase();
    return emailDomain.split(".").includes(expectedDomain);
  }

  const handleAddNewUser = async () => {
    if (!orgId || !user) return;

    const _error = error;
    const email = addUserData.email;
    if (addUserData.firstName === "") {
      _error.firstName = "First name is required";
    } else {
      _error.firstName = "";
    }
    // Validate email format
    if (!validateEmail(email)) {
      _error.email =
        addUserData.email === ""
          ? "User email is required"
          : "Invalid email address";
    } else {
      _error.email = "";
    }

    if (addUserData.password === "") {
      _error.password = "Password is required!";
    } else {
      if (!isPasswordStrong(addUserData.password)) {
        _error.password = "Password is not strong enough";
      } else {
        _error.password = "";
      }
    }
    setError({ ..._error });
    if (
      !validateEmail(email) ||
      !addUserData.password ||
      !addUserData.firstName ||
      !user ||
      !isPasswordStrong(addUserData.password)
    )
      return;

    const fullName = `${addUserData.firstName} ${addUserData.lastName}`.trim();
    const _data = {
      email,
      firstName: addUserData.firstName,
      lastName: addUserData.lastName,
      name: fullName,
      password: addUserData.password,
      username: fullName,
      tenant_id: orgId,
      role: addUserData.role,
    };
    addUser(_data);
  };

  const handleInputChange = (e: any) => {
    setAddUserData({ ...addUserData, [e.target.name]: e.target.value });
  };

  const BottomContent = () => {
    const totalPages = Math.ceil((allUsersData?.counts || 0) / pageSize);

    return (
      <Pagination
        className="ml-64 pl-[15px]"
        pageSize={pageSize}
        setPageSize={setPageSize}
        page={page}
        setPage={setPage}
        totalPages={Math.ceil((allUsersData?.counts || 0) / pageSize)}
        onPageChange={(newPage: number) => setPage(newPage)}
        onPageSizeChange={(newSize: number) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    );
  };

  const renderUserRole = (role: string) => {
    return (
      <div className="flex flex-col">
        <p className="text-bold text-sm capitalize">
          {role === "globaladmin" ? (
            "Global Admin"
          ) : (
            <span className="capitalize">{role?.split(":")?.length > 1 ? role?.split(":")[1] : role}</span>
          )}
        </p>
      </div>
    );
  };

  const renderUserActions = (user: any) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ButtonUI
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-transparent"
            disabled={isUpdatingUser} // Removed permission check - using static behavior
          >
            <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
          </ButtonUI>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 p-2">
          {(user as any).role !== "globaladmin" && (
            <DropdownMenuItem
              onClick={() => handleEditUserClick(user)}
              className="flex items-center gap-2 text-sm  cursor-pointer "
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => handleResetPasswordClick(user)}
            className="flex items-center gap-2 text-sm cursor-pointer "
          >
            <RotateCw className="h-4 w-4" />
            Reset password
          </DropdownMenuItem>
          {(user as any).role !== "globaladmin" && (
            <DropdownMenuItem
              onClick={() => handleDeactivateUser(user)}
              className="flex flex-row items-center border-t gap-2  border-t-[#E4E4E7] text-red-500 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const UserTable = () => {
    const isLoadingState = isFetching || isFetchingUsers;
    const users = allUsersData?.users || [];

    return (
      <div>
        <div className="pb-4">
          <TopContent />
        </div>
        <div className="border-b">
          <Table>
            <TableHeader>
              <TableRow className="h-10">
                <TableHead className="text-muted-foreground font-medium">
                  Full name
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Email
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Role
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingState ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b"></div>
                      <span>Loading active users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => {
                  const displayName = user.name ||
                    ((user as any).firstName && (user as any).lastName
                      ? `${(user as any).firstName} ${(user as any).lastName}`
                      : (user as any).firstName || (user as any).lastName || "--");
                  return (
                    <TableRow key={user.id} className="h-10 last:border-b-0">
                      <TableCell className="text-sm  font-normal">
                        {displayName}
                      </TableCell>
                      <TableCell className="text-sm  font-normal">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-sm  font-normal">
                        {renderUserRole((user as any)?.role || "--")}
                      </TableCell>
                      <TableCell className="text-sm  font-normal">
                        {renderUserActions(user)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-lg font-medium text-muted-foreground">
                        No data available
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="sticky bottom-0  py-2 pt-4 border-t  z-50">
          <BottomContent />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col  p-5">
        <div className="flex w-full justify-between items-center  ">
          <div className="text-xl font-semibold leading-[100%] mt-4 ">
            Active Users
          </div>
        </div>

        <div className="w-full mt-4">
          <UserTable />
        </div>
      </div>

      <Dialog
        open={open !== ""}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen("");
            setAddUserData({
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              role: "member",
            });
          }
        }}
        modal={true}
      >
        <DialogContent className="sm:max-w-[480px] p-0 dialog-content">
          <div className="p-6">
            <DialogHeader className="p-0 mb-6">
              <DialogTitle className="text-[16px] font-semibold ">
                {open === "edit user"
                  ? "Manage user"
                  : open === "create user"
                    ? "Add user"
                    : open === "reset password"
                      ? "Reset Password"
                      : ""}
              </DialogTitle>
            </DialogHeader>

            <div
              className={`${open === "create user" || open === "edit user" ? "space-y-2" : "space-y-4"}`}
            >
              {(open === "create user" || open === "edit user") && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm ">First Name</Label>
                    <InputUI
                      name="firstName"
                      value={addUserData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      className={` ${error.firstName ? "border-red-500" : ""}`}
                    />
                    {error.firstName && (
                      <span className="text-xs text-red-500">{error.firstName}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm ">Last Name</Label>
                    <InputUI
                      name="lastName"
                      value={addUserData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      className={` ${error.lastName ? "border-red-500" : ""}`}
                    />
                    {error.lastName && (
                      <span className="text-xs text-red-500">{error.lastName}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Email</Label>
                    <InputUI
                      name="email"
                      type="email"
                      value={addUserData.email}
                      onChange={handleInputChange}
                      className={` ${error.email ? "border-red-500" : ""}`}
                      placeholder="Enter email address"
                      disabled={open === 'create user' ? false : true}
                    />
                    {error.email && (
                      <span className="text-xs text-red-500">
                        {error.email}
                      </span>
                    )}
                  </div>

                  {open === "create user" && (
                    <div className="space-y-2">
                      <Label className="text-sm ">Password</Label>
                      <div className="relative">
                        <InputUI
                          name="password"
                          type={isVisible ? "text" : "password"}
                          value={addUserData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                          className={` ${error.password ? "border-red-500" : ""}`}
                          aria-label="password"
                        />
                        <button
                          type="button"
                          onClick={toggleVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {isVisible ? (
                            <BsEyeSlashFill className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <BsEyeFill className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      {error.password && (
                        <span className="text-xs text-red-500">
                          {error.password}
                        </span>
                      )}

                      <div className="mt-1 ">
                        <p className="text-[14px]  font-sans font-bold leading-5 text-muted-foreground ">
                          Your password must contain:
                        </p>
                        <ul className=" font-sans leading-5 gap-0 text-xs text-muted-foreground">
                          <li>• atleast 8 characters</li>
                          <li>• atleast 1 Lower case letters</li>
                          <li>• atleast 1 Upper case letters</li>
                          <li>• atleast 1 Number</li>
                          <li>• atleast 1 Special character</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 ">
                    <Label className="text-sm ">
                      {open === "create user"
                        ? "User Role"
                        : " User Permission"}
                    </Label>
                    <RadioGroup
                      key={`role-${open}-${addUserData.role}`}
                      value={addUserData.role || "member"}
                      onValueChange={(value) => {
                        setAddUserData({
                          ...addUserData,
                          role: value,
                        });
                      }}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="relative flex items-center">
                          <RadioGroupItem
                            value="member"
                            id="member"
                            className="w-4 h-4"
                          />
                          <Label
                            htmlFor="member"
                            className="text-sm  ml-2 cursor-pointer"
                          >
                            Member
                          </Label>
                        </div>
                      </div>

                      {open === "edit user" && (
                        <>
                          <div className="flex items-center space-x-2">
                            <div className="relative flex items-center">
                              <RadioGroupItem
                                value="org:admin"
                                id="admin"
                                className="  w-4 h-4"
                              />
                              <Label
                                htmlFor="admin"
                                className="text-sm  ml-2 cursor-pointer"
                              >
                                Admin
                              </Label>
                            </div>
                          </div>
                        </>
                      )}
                    </RadioGroup>
                  </div>
                </>
              )}

              {open === "reset password" && (
                <div className="space-y-2">
                  <div className="mb-2">
                    <Label className="text-sm text-black">User</Label>
                    <p className="text-sm text-[#71717A] mt-1">
                      {selectedUser?.name ||
                        ((selectedUser as any)?.firstName && (selectedUser as any)?.lastName
                          ? `${(selectedUser as any).firstName} ${(selectedUser as any).lastName}`
                          : selectedUser?.email)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">New Password</Label>
                    <div className="relative">
                      <InputUI
                        name="password"
                        type={isVisible ? "text" : "password"}
                        value={addUserData.password}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        aria-label="new password"
                        className={`h-10  ${error.password ? "border-red-500" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={toggleVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {isVisible ? (
                          <BsEyeSlashFill className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <BsEyeFill className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {error.password && (
                      <span className="text-xs text-red-500">
                        {error.password}
                      </span>
                    )}

                    <div className="mt-1">
                      <p className="text-[14px] font-sans font-bold leading-5 text-[#71717A]">
                        Your password must contain:
                      </p>
                      <ul className="font-sans leading-5 gap-0 text-xs text-[#71717A]">
                        <li>• at least 8 characters</li>
                        <li>• at least 1 Lower case letter</li>
                        <li>• at least 1 Upper case letter</li>
                        <li>• at least 1 Number</li>
                        <li>• at least 1 Special character</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div >

            <div className="flex justify-end gap-2 mt-8">
              <ButtonUI
                variant="outline"
                onClick={() => {
                  // Close dialog completely
                  setOpen("");
                  setAddUserData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    role: "member",
                  });
                  setError({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                  });
                  setSelectedUser(null);
                }}
                className="h-9 px-4  rounded"
                disabled={isAddingUser || isUpdatingUser || isResettingPassword}
              >
                Cancel
              </ButtonUI>
              <ButtonUI
                type="submit"
                onClick={() => {
                  if (open === "create user") {
                    handleAddNewUser();
                  } else if (open === "edit user") {
                    handleEditUserSubmit();
                  } else if (open === "reset password") {
                    handleResetPasswordSubmit();
                  } else {
                    setOpen("");
                  }
                }}
                className="h-9 px-4  rounded flex items-center gap-2"
                disabled={isAddingUser || isUpdatingUser || isResettingPassword}
              >
                {isAddingUser || isUpdatingUser || isResettingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {open === "create user"
                  ? "Add"
                  : open === "reset password"
                    ? "Reset Password"
                    : "Save"}
              </ButtonUI>
            </div>
          </div >
        </DialogContent>
      </Dialog>
    </>
  );
};

ActiveUsers.displayName = "ActiveUsers";

export default ActiveUsers;
