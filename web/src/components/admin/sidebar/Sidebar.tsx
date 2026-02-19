import React, { ReactNode, useState, useEffect, useMemo } from "react";
import {
  Home,
  Archive,
  Info,
  ArrowLeft,
  UserCheck,
  UserX,
  ShieldCheck,
  ScrollText,
  Headset,
  Settings,
  Shield,
  Scale,
  Blocks,
  Eye,
  FileText,
  Zap,
  BookOpen,
  AlertTriangle,
  BarChart3,
  Cog,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { GrCompliance } from "react-icons/gr";
interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}

interface SubNavItemProps {
  children: React.ReactNode;
  active?: boolean;
}
const NavItem = ({ icon, href, children, active = false }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2 font-normal h-8 font-sm py-2 px-2 rounded-md w-full text-left
      ${
        active
          ? "bg-muted font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.1)]"
          : "font-normal hover:bg-muted hover:text-inherit"
      }`}
    >
      <div
        className={`${active ? "text-inherit" : "text-muted-foreground group-hover:text-inherit"}`}
      >
        {icon}
      </div>
      <span className="">{children}</span>
    </Link>
  );
};

const SubNavItem = ({ children, active = false }: SubNavItemProps) => {
  return (
    <div
      className={`text-sm ${active ? "text-inherit font-medium" : "text-muted-foreground group-hover:text-inherit  font-normal"} leading-[100%]`}
    >
      {children}
    </div>
  );
};

const CollapsibleSection = ({
  title,
  children,
  icon,
  isOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  icon: ReactNode;
  onToggle: () => void;
}) => {
  return (
    <div className="">
      <button
        onClick={onToggle}
        className="flex items-center group justify-between w-full text-muted-foreground hover:text-inherit text-sm font-medium p-2"
      >
        <span className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </span>

        <ChevronDown
          size={16}
          className={`text-muted-foreground group-hover:text-inherit  transition-all duration-500 ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 space-y-2 pl-4 ${
          isOpen ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const params = useParams();
  const tenant = params.tenant as string;

  // // Helper function to determine which section should be open based on pathname
  // const getSectionForPath = (path: string) => {
  //   if (path.includes("/admin/users")) return "users";
  //   if (
  //     path.includes("/admin/settings") &&
  //     !path.includes("/admin/settings/policy-center") &&
  //     !path.includes("/admin/settings/eu-ai-act") &&
  //     !path.includes("/admin/integrations") &&
  //     !path.includes("/admin/settings/ai-trust-center") &&
  //     !path.includes("/admin/settings/ai-policies-updates")
  //   ) {
  //     return "settings";
  //   }
  //   if (
  //     path.includes("/admin/settings/policy-center") ||
  //     path.includes("/admin/settings/eu-ai-act") ||
  //     path.includes("/admin/integrations") ||
  //     path.includes("/admin/settings/ai-trust-center") ||
  //     path.includes("/admin/settings/ai-policies-updates")
  //   ) {
  //     return "compliance";
  //   }
  //   if (path.includes("/admin/agentic-governance")) return "controlnet";
  //   return null;
  // };

  // // Use the same pattern as ComplianceDashboard - simple object state for expanded sections
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>(() => {
    return {
      users: true,
      settings: true,
      compliance: true,
    };
    // Initialize with the appropriate section open based on current pathname
    // const currentSection = getSectionForPath(pathname);
    // return currentSection ? { [currentSection]: true } : {};
  });

  // // Auto-open section only when navigating to a new section that isn't already open
  // useEffect(() => {
  //   const currentSection = getSectionForPath(pathname);

  //   if (currentSection && !expandedSections[currentSection]) {
  //     // Only auto-open if the section for the current path is not already open
  //     setExpandedSections((prev) => ({
  //       ...prev,
  //       [currentSection]: true,
  //     }));
  //   }
  // }, [pathname]);

  const handleToggle = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const { activePolicy, policyStatus, tenant: tenantInfo } = useTenant();

  const isEuActive = useMemo(() => {
    return policyStatus.euAiAct;
  }, [policyStatus.euAiAct]);

  const isISOActive = useMemo(() => {
    return policyStatus.iso42001;
  }, [policyStatus.iso42001]);
  return (
    <div className="w-[256px]  border-r pl-2 p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-2">
        <NavItem
          href={`/${tenant}/admin/home`}
          icon={<Home size={16} strokeWidth={1.5} />}
          active={pathname.includes("/admin/home")}
        >
          <div
            className={`text-sm fonts flex items-center h-8 ${
              pathname.includes("/admin/home")
                ? " font-medium"
                : "text-muted-foreground font-normal"
            } leading-[100%]`}
          >
            Home
          </div>
        </NavItem>

        {/* Users */}
        <CollapsibleSection
          title="Users"
          icon={<User size={16} strokeWidth={1.5} />}
          isOpen={expandedSections["users"]}
          onToggle={() => handleToggle("users")}
        >
          <NavItem
            href={`/${tenant}/admin/users/active`}
            icon={<UserCheck size={16} strokeWidth={1.5} />}
            active={pathname.includes("/admin/users/active")}
          >
            <SubNavItem active={pathname.includes("/admin/users/active")}>
              Active Users
            </SubNavItem>
          </NavItem>
          <NavItem
            href={`/${tenant}/admin/users/deactivate`}
            icon={<UserX size={16} strokeWidth={1.5} />}
            active={pathname.includes("/admin/users/deactivate")}
          >
            <SubNavItem active={pathname.includes("/admin/users/deactivate")}>
              Deactivated Users
            </SubNavItem>
          </NavItem>
        </CollapsibleSection>

        {/* Settings */}
        <CollapsibleSection
          title="Settings"
          icon={<Settings size={16} strokeWidth={1.5} />}
          isOpen={expandedSections["settings"]}
          onToggle={() => handleToggle("settings")}
        >
          <NavItem
            href={`/${tenant}/admin/archived-applications`}
            icon={<Archive size={16} strokeWidth={1.5} />}
            active={pathname.includes("/admin/archived-applications")}
          >
            <SubNavItem
              active={pathname.includes("/admin/archived-applications")}
            >
              Archived Applications
            </SubNavItem>
          </NavItem>
          <NavItem
            href={`/${tenant}/admin/settings/audit-logs`}
            icon={<ScrollText size={16} strokeWidth={1.5} />}
            active={pathname.includes("/admin/settings/audit-logs")}
          >
            <SubNavItem
              active={pathname.includes("/admin/settings/audit-logs")}
            >
              Audit Logs
            </SubNavItem>
          </NavItem>
          {/* <NavItem
            href={`/${tenant}/admin/settings/info`}
            icon={<Info size={16} strokeWidth={1.5} />}
            active={pathname.includes("/admin/settings/info")}
          >
            <SubNavItem active={pathname.includes("/admin/settings/info")}>
              Organization Info
            </SubNavItem>
          </NavItem> */}
          {/* <NavItem
            href={`/${tenant}/admin/settings/policies`}
            icon={<ShieldCheck size={16} strokeWidth={1.5} />}
            active={pathname.includes("/admin/settings/policies")}
          >
            <SubNavItem active={pathname.includes("/admin/settings/policies")}>
              Organization Policies
            </SubNavItem>
          </NavItem> */}
        </CollapsibleSection>

        {/* Compliance */}
        {tenantInfo?.govIQEnabled ? (
          <>
            <CollapsibleSection
              title="Compliance"
              icon={<GrCompliance size={16} strokeWidth={1.5} />}
              isOpen={expandedSections["compliance"]}
              onToggle={() => handleToggle("compliance")}
            >
              <NavItem
                href={`/${tenant}/admin/settings/policy-center`}
                icon={<FileText size={16} strokeWidth={1.5} />}
                active={pathname.includes("/admin/settings/policy-center")}
              >
                <SubNavItem
                  active={pathname.includes("/admin/settings/policy-center")}
                >
                  Compliance Policies
                </SubNavItem>
              </NavItem>
              {isEuActive && (
                <>
                  <NavItem
                    href={`/${tenant}/admin/settings/eu-ai-act`}
                    icon={<Scale size={16} strokeWidth={1.5} />}
                    active={pathname.includes("/admin/settings/eu-ai-act")}
                  >
                    <SubNavItem
                      active={pathname.includes("/admin/settings/eu-ai-act")}
                    >
                      EU AI Act
                    </SubNavItem>
                  </NavItem>
                </>
              )}

              {isISOActive && (
                <>
                  <NavItem
                    href={`/${tenant}/admin/settings/iso-42001`}
                    icon={<Scale size={16} strokeWidth={1.5} />}
                    active={pathname.includes("/admin/settings/iso-42001")}
                  >
                    <SubNavItem
                      active={pathname.includes("/admin/settings/iso-42001")}
                    >
                      ISO 42001
                    </SubNavItem>
                  </NavItem>
                </>
              )}
              <NavItem
                href={`/${tenant}/admin/integrations`}
                icon={<Blocks size={16} strokeWidth={1.5} />}
                active={pathname.includes("/admin/integrations")}
              >
                <SubNavItem active={pathname.includes("/admin/integrations")}>
                  Integrations
                </SubNavItem>
              </NavItem>
              {/* <NavItem
            href={`/${tenant}/admin/settings/ai-trust-center`}
            icon={<Shield size={16} strokeWidth={1.5} />}
            active={pathname.includes("/admin/settings/ai-trust-center")}
          >
            <SubNavItem
            active={pathname.includes("/admin/settings/ai-trust-center")}
            >
            AI Trust Center
            </SubNavItem>
          </NavItem> */}
              <NavItem
                href={`/${tenant}/admin/settings/ai-policies-updates`}
                icon={<Settings size={16} strokeWidth={1.5} />}
                active={pathname.includes(
                  "/admin/settings/ai-policies-updates"
                )}
              >
                <SubNavItem
                  active={pathname.includes(
                    "/admin/settings/ai-policies-updates"
                  )}
                >
                  Global AI Policies Update
                </SubNavItem>
              </NavItem>
            </CollapsibleSection>
          </>
        ) : (
          <></>
        )}

        {/* Support */}
        <div className="mt-4">
          <NavItem
            href={`/${tenant}/admin/support`}
            icon={<Headset size={16} strokeWidth={1.5} />}
            active={pathname.includes("/admin/support")}
          >
            <SubNavItem active={pathname.includes("/admin/support")}>
              Support
            </SubNavItem>
          </NavItem>
        </div>

        <div className="mt-4 ">
          <NavItem
            href={`/${tenant}`}
            icon={<ArrowLeft size={16} strokeWidth={1.5} />}
            active={false}
          >
            <SubNavItem active={false}>Back to app</SubNavItem>
          </NavItem>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
