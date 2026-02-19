"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, usePathname } from "next/navigation";
import {
  Cog,
  Shield,
  Database,
  DollarSign,
  History,
  Lock,
  AlertTriangle,
  Handshake,
  BarChart3,
  ShieldCheck,
  AlertCircle,
  Scale,
  SquareKanban,
  ClipboardCheck,
  FileText,
  BookOpen,
  Users,
  Leaf,
  Info,
  Eye,
  LineChart,
  Settings,
  Target,
  ChevronDown,
  ChevronRight,
  Key,
  Sparkles,
  Home,
} from "lucide-react";
import { getApplicationMetadata } from "@/lib/queries/applications";
import { useTenant } from "@/contexts/TenantContext";
import { RiGovernmentFill } from "react-icons/ri";
import { AiTwotoneControl } from "react-icons/ai";
interface NavItemProps {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  active: boolean;
}

interface SubNavItemProps {
  children: React.ReactNode;
  active?: boolean;
}

const NavItem = ({ onClick, icon, children, active = false }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
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
    </button>
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

const ApplicationSidebar = ({
  applicationMetadata,
}: {
  applicationMetadata: { goviqEnabled: boolean; controlnetEnabled: boolean };
}) => {
  const router = useRouter();
  const { applicationId, tenant } = useParams();
  const pathname = usePathname();
  const { isEUEnabled } = useTenant();
  const getCurrentComponent = () => {
    const pathSegments = pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];
    const secondLastSegment = pathSegments[pathSegments.length - 2];

    if (pathSegments.includes("goviq")) {
      switch (true) {
        case lastSegment === "overview":
          return "overview";
        case lastSegment === "application-scope":
          return "application-scope";
        case lastSegment === "use-case":
          return "use-case";
        case lastSegment === "technology-details":
          return "technology-details";
        case lastSegment === "data-governance":
          return "data-governance";
        case lastSegment === "record-keeping":
          return "record-keeping";
        case lastSegment === "models-info":
          return "models-info";
        case lastSegment === "risk" ||
          pathSegments.includes("risk") ||
          lastSegment === "missing":
          return "risk";
        case lastSegment === "stakeholders-role":
          return "stakeholders-role";
        case lastSegment === "compliance-grid":
          return "compliance-grid";
        case lastSegment === "information-protection":
          return "information-protection";
        default:
          return "overview";
      }
    } else if (pathSegments.includes("control-net")) {
      // Check for nested routes first
      if (
        secondLastSegment === "view-policy" ||
        secondLastSegment === "update-policy"
      ) {
        return secondLastSegment;
      }

      switch (lastSegment) {
        case "overview":
          return "control-net-overview";
        case "endpoints":
          return "endpoints";
        case "guardrails":
          return "guardrails";
        case "policies":
          return "policies";
        case "datasets":
          return "datasets";
        case "red-teaming":
          return "red-teaming";
        case "playground":
          return "playground";
        case "create-new-policy":
          return "create-new-policy";
        case "update-policy":
          return "update-policy";
        default:
          return "null";
      }
    } else if (lastSegment === "settings") {
      return "settings";
    }

    return "home";
  };
  const component = useMemo(() => getCurrentComponent(), [pathname]);

  const hasGovIQ = useMemo(
    () => applicationMetadata.goviqEnabled,
    [applicationMetadata]
  );
  const hasControlNet = useMemo(
    () => applicationMetadata.controlnetEnabled,
    [applicationMetadata]
  );

  // State for expanded sections - Open both sections by default if modules are enabled
  const [expandedSections, setExpandedSections] = useState<any>(() => {
    return {
      goviq: hasGovIQ,
      controlnet: hasControlNet,
    };
  });

  // Update expanded sections when application changes
  useEffect(() => {
    setExpandedSections({
      goviq: hasGovIQ,
      controlnet: hasControlNet,
    });
  }, [hasGovIQ, hasControlNet]);

  const handleToggle = (section: string) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Navigation function to handle routing
  const navigateToRoute = useCallback(
    (route: string) => {
      router.push(`/${tenant}/applications/${applicationId}/${route}`);
    },
    [tenant, applicationId]
  );

  const controlNetPoliciesBasePath = useMemo(
    () => `/${tenant}/applications/${applicationId}/control-net/policies`,
    [applicationId, tenant]
  );

  const { policyStatus } = useTenant();

  return (
    <div className=" fixed left-0 top-[52px] bottom-0 w-[256px] z-10 border-r bg-background  pl-2 p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* <NavItem
          onClick={() => navigateToRoute(`/`)}
          icon={<Home size={16} strokeWidth={1.5} />}
          active={component === "home"}
        >
          <SubNavItem active={component === "home"}>Home</SubNavItem>
        </NavItem> */}
        <div className="space-y-1">
          {/* GovIQ Collapsible Section - Only show if bGovIQ is true */}
          {hasGovIQ && (
            <>
              <CollapsibleSection
                icon={<RiGovernmentFill size={16} strokeWidth={1.5} />}
                title="GovIQ"
                isOpen={expandedSections["goviq"]}
                onToggle={() => handleToggle("goviq")}
              >
                <NavItem
                  onClick={() => navigateToRoute("goviq/overview")}
                  icon={<SquareKanban size={16} strokeWidth={1.5} />}
                  active={component === "overview"}
                >
                  <SubNavItem active={component === "overview"}>
                    Overview
                  </SubNavItem>
                </NavItem>
                <NavItem
                  onClick={() => navigateToRoute("goviq/application-scope")}
                  icon={<BookOpen size={16} strokeWidth={1.5} />}
                  active={component === "application-scope"}
                >
                  <SubNavItem active={component === "application-scope"}>
                    Application Scope
                  </SubNavItem>
                </NavItem>
                <NavItem
                  onClick={() => navigateToRoute("goviq/use-case")}
                  icon={<Handshake size={16} strokeWidth={1.5} />}
                  active={component === "use-case"}
                >
                  <SubNavItem active={component === "use-case"}>
                    Use Case
                  </SubNavItem>
                </NavItem>

                <NavItem
                  onClick={() => navigateToRoute("goviq/risk")}
                  icon={<ClipboardCheck size={16} strokeWidth={1.5} />}
                  active={component === "risk"}
                >
                  <SubNavItem active={component === "risk"}>Risk</SubNavItem>
                </NavItem>
                <NavItem
                  onClick={() => navigateToRoute("goviq/technology-details")}
                  icon={<Database size={16} strokeWidth={1.5} />}
                  active={component === "technology-details"}
                >
                  <SubNavItem active={component === "technology-details"}>
                    Technology Details
                  </SubNavItem>
                </NavItem>

                <NavItem
                  onClick={() => navigateToRoute("goviq/data-governance")}
                  icon={<Shield size={16} strokeWidth={1.5} />}
                  active={component === "data-governance"}
                >
                  <SubNavItem active={component === "data-governance"}>
                    Data Governance
                  </SubNavItem>
                </NavItem>
                {isEUEnabled ? (
                  <>
                    <NavItem
                      onClick={() => navigateToRoute("goviq/record-keeping")}
                      icon={<FileText size={16} strokeWidth={1.5} />}
                      active={component === "information-protection"}
                    >
                      <SubNavItem
                        active={component === "information-protection"}
                      >
                        Information Protection
                      </SubNavItem>
                    </NavItem>

                    <NavItem
                      onClick={() => navigateToRoute("goviq/record-keeping")}
                      icon={<FileText size={16} strokeWidth={1.5} />}
                      active={component === "record-keeping"}
                    >
                      <SubNavItem active={component === "record-keeping"}>
                        Record Keeping
                      </SubNavItem>
                    </NavItem>
                  </>
                ) : (
                  <></>
                )}
                <NavItem
                  onClick={() => navigateToRoute("goviq/models-info")}
                  icon={<Database size={16} strokeWidth={1.5} />}
                  active={component === "models-info"}
                >
                  <SubNavItem active={component === "models-info"}>
                    Models Info
                  </SubNavItem>
                </NavItem>

                <NavItem
                  onClick={() => navigateToRoute("goviq/stakeholders-role")}
                  icon={<Users size={16} strokeWidth={1.5} />}
                  active={component === "stakeholders-role"}
                >
                  <SubNavItem active={component === "stakeholders-role"}>
                    Stakeholders
                  </SubNavItem>
                </NavItem>
                <NavItem
                  onClick={() => navigateToRoute("goviq/compliance-grid")}
                  icon={<ClipboardCheck size={16} strokeWidth={1.5} />}
                  active={component === "compliance-grid"}
                >
                  <SubNavItem active={component === "compliance-grid"}>
                    Compliance Grid
                  </SubNavItem>
                </NavItem>

                {/* <NavItem
                  onClick={() => onComponentChange('regulatory-risk')}
                  icon={<AlertTriangle size={16} strokeWidth={1.5} />}
                  active={component === 'regulatory-risk'}
                >
                  <SubNavItem active={component === 'regulatory-risk'}>Regulatory & Risk Impact</SubNavItem>
                </NavItem> */}

                {/* <NavItem
                  onClick={() => onComponentChange('explainability-performance')}
                  icon={<LineChart size={16} strokeWidth={1.5} />}
                  active={component === 'explainability-performance'}
                >
                  <SubNavItem active={component === 'explainability-performance'}>Explainability & Performance</SubNavItem>
                </NavItem> */}

                {/* <NavItem
                  onClick={() => onComponentChange('financial-cost')}
                  icon={<DollarSign size={16} strokeWidth={1.5} />}
                  active={component === 'financial-cost'}
                >
                  <SubNavItem active={component === 'financial-cost'}>Financial & Resource Cost</SubNavItem>
                </NavItem> */}

                {/* <NavItem
                  onClick={() => onComponentChange('lifecycle-audit')}
                  icon={<History size={16} strokeWidth={1.5} />}
                  active={component === 'lifecycle-audit'}
                >
                  <SubNavItem active={component === 'lifecycle-audit'}>Lifecycle & Audit Trail</SubNavItem>
                </NavItem> */}

                {/* <NavItem
                  onClick={() => onComponentChange('security-access')}
                  icon={<Lock size={16} strokeWidth={1.5} />}
                  active={component === 'security-access'}
                >
                  <SubNavItem active={component === 'security-access'}>Security & Access</SubNavItem>
                </NavItem> */}
              </CollapsibleSection>
            </>
          )}

          {/* ControlNet Collapsible Section - Only show if bControlNet is true */}
          {hasControlNet && (
            <>
              <CollapsibleSection
                icon={<AiTwotoneControl size={16} strokeWidth={1.5} />}
                title="ControlNet"
                isOpen={expandedSections["controlnet"]}
                onToggle={() => handleToggle("controlnet")}
              >
                <NavItem
                  onClick={() => navigateToRoute("control-net/overview")}
                  icon={<SquareKanban size={16} strokeWidth={1.5} />}
                  active={component === "control-net-overview"}
                >
                  <SubNavItem active={component === "control-net-overview"}>
                    Overview
                  </SubNavItem>
                </NavItem>
                {/* <NavItem
                  onClick={() => navigateToRoute('control-net/endpoints')}
                  icon={<Settings size={16} strokeWidth={1.5} />}
                  active={component === 'endpoints'}
                >
                  <SubNavItem active={component === 'endpoints'}>Endpoints</SubNavItem>
                </NavItem> */}

                <NavItem
                  onClick={() => navigateToRoute("control-net/policies")}
                  icon={<FileText size={16} strokeWidth={1.5} />}
                  active={
                    [
                      "policies",
                      "create-new-policy",
                      "view-policy",
                      "update-policy",
                    ].includes(component) ||
                    pathname.startsWith(controlNetPoliciesBasePath)
                  }
                >
                  <SubNavItem
                    active={
                      [
                        "policies",
                        "create-new-policy",
                        "view-policy",
                        "update-policy",
                      ].includes(component) ||
                      pathname.startsWith(controlNetPoliciesBasePath)
                    }
                  >
                    Policies
                  </SubNavItem>
                </NavItem>
                <NavItem
                  onClick={() => navigateToRoute("control-net/guardrails")}
                  icon={<Shield size={16} strokeWidth={1.5} />}
                  active={component === "guardrails"}
                >
                  <SubNavItem active={component === "guardrails"}>
                    Guardrails
                  </SubNavItem>
                </NavItem>
                <NavItem
                  onClick={() => navigateToRoute("control-net/datasets")}
                  icon={<Database size={16} strokeWidth={1.5} />}
                  active={component === "datasets"}
                >
                  <SubNavItem active={component === "datasets"}>
                    Datasets
                  </SubNavItem>
                </NavItem>
                <NavItem
                  onClick={() => navigateToRoute("control-net/red-teaming")}
                  icon={<Target size={16} strokeWidth={1.5} />}
                  active={component === "red-teaming"}
                >
                  <SubNavItem active={component === "red-teaming"}>
                    Red Teaming
                  </SubNavItem>
                </NavItem>
                <NavItem
                  onClick={() => navigateToRoute("control-net/playground")}
                  icon={<Sparkles size={16} strokeWidth={1.5} />}
                  active={component === "playground"}
                >
                  <SubNavItem active={component === "playground"}>
                    Playground
                  </SubNavItem>
                </NavItem>
              </CollapsibleSection>
            </>
          )}

          {/* Horizontal line before Settings */}

          {/* Settings - Always visible */}
          {/* <NavItem
            onClick={() => navigateToRoute("settings")}
            icon={<Cog size={16} strokeWidth={1.5} />}
            active={component === "settings"}
          >
            <SubNavItem active={component === "settings"}>Settings</SubNavItem>
          </NavItem> */}

          {/* Show message if no modules are enabled */}
          {!hasGovIQ && !hasControlNet && (
            <div className="p-4 mt-4 text-center text-gray-500 bg-gray-100 rounded-md">
              <p className="text-sm">
                No modules enabled for this application.
              </p>
              <p className="text-xs mt-1">
                Edit the application to enable GovIQ or ControlNet modules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationSidebar;
