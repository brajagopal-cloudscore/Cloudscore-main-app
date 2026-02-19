"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Sidebar from "./sidebar/Sidebar";
import AdminSidebar from "../admin/sidebar/Sidebar";
interface LayoutWithConditionalSidebarProps {
  children: ReactNode;
  isAdminUser: boolean;
}

/**
 * Layout component that conditionally renders the sidebar and adjusts content padding.
 * Hides the main sidebar when the pathname matches the pattern: /[tenant]/applications/[applicationId] or any nested routes
 * This allows the application-specific sidebar to be displayed instead.
 */
export default function LayoutWithConditionalSidebar({
  children,
  isAdminUser,
}: LayoutWithConditionalSidebarProps) {
  const pathname = usePathname();

  // Check if the pathname matches patterns where sidebar should be hidden:
  // 1. /[tenant]/applications/[applicationId] or any nested routes
  // 2. /[tenant]/admin or any nested admin routes
  const adminPage =
    /^\/[^\/]+\/applications\/[^\/]+(\/.*)?$/.test(pathname) || // Application routes
    /^\/[^\/]+\/admin(\/.*)?$/.test(pathname); // Admin routes

  return (
    <>
      <div className="w-full  flex-1 flex overflow-hidden ">
        {adminPage ? <AdminSidebar /> : <Sidebar isAdminUser={isAdminUser} />}
        <div className={`flex-1  overflow-y-auto  `}>{children}</div>
      </div>
      {/* Left Sidebar */}
      {/* <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-40">
      </div> */}
      {/* Main Content */}
    </>
  );
}
