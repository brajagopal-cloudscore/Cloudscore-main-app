"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { OrganizationSwitcher } from "@/components/common/OrganizationSwitcher";
import Image from "next/image";
import Link from "next/link";
import kentronIcon from "@/assets/images/hlogo.svg";
import { usePathname, useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { getApplication } from "@/lib/api/applications";
import { useTheme } from "next-themes";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

export default function Theme() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        if (theme === "light") {
          setTheme("dark");
        } else {
          setTheme("light");
        }
      }}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-0 rotate-0 transition-all dark:scale-100 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
    </Button>
  );
}

export function TenantHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const tenant = params.tenant as string;
  const [applicationName, setApplicationName] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { orgRole } = useAuth();

  // Extract applicationId from URL when on application pages
  const applicationId = params.applicationId as string | undefined;

  useEffect(() => {
    setIsMounted(true);

    // Only fetch application name if we're on an application page and have an applicationId
    if (applicationId && tenant) {
      const fetchApplicationName = async () => {
        try {
          const application = await getApplication(tenant, applicationId);
          setApplicationName(application.sProjectName);
        } catch (error) {
          console.error("Error fetching application name:", error);
          setApplicationName(null);
        }
      };

      fetchApplicationName();
    } else {
      setApplicationName(null);
    }
  }, [applicationId, tenant]);

  const shouldHideLogo = /^\/[^\/]+\/applications\/[^\/]+(\/.*)?$/.test(
    pathname
  );
  const isAdminPage = React.useMemo(
    () => pathname.includes("/admin"),
    [pathname]
  );

  return (
    <div className="sticky top-0  h-14 border-b z-20 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        {shouldHideLogo ? (
          <div className="flex items-center gap-2">
            <button
              className="border-none bg-transparent p-0"
              onClick={() => router.push(`/${tenant}/applications`)}
            >
              <ChevronLeft className="h-4 w-5 text-muted-foreground" />
            </button>
            <span className="text-lg font-medium text-muted-foreground">
              {isMounted ? applicationName || "Application" : "Application"}
            </span>
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center justify-center bg-white rounded-full h-9  w-9"
          >
            <Image
              src={kentronIcon}
              className="h-8 w-8"
              alt="Kentron AI"
              width={32}
              height={32}
            />
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Theme />

        <OrganizationSwitcher />
        {!isAdminPage && orgRole === "org:admin" && (
          <Link
            target="_blank"
            href={`/${tenant}/admin/home`}
            className="flex items-center"
          >
            <Button
              variant="outline"
              className="h-9 px-3 text-sm font-medium rounded-md transition-colors font-sans"
            >
              ADMIN
            </Button>
          </Link>
        )}
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    </div>
  );
}
