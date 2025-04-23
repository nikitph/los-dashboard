"use client";

import { usePathname } from "next/navigation";
import { Divider } from "@/components/Divider";
import { Input } from "@/components/Input";
import { File, Files, Folder } from "@/components/animate-ui/files";
import { cx } from "@/lib/utils";
import {
  Building,
  Building2,
  CarFront,
  Check,
  CreditCard,
  CreditCard as Card,
  DollarSign,
  DollarSign as Dollar,
  FileCheck,
  FileText,
  Home,
  HomeIcon,
  Users,
} from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Logo } from "../../../../public/Logo";
import { UserProfile } from "./UserProfile";
import { MotionHighlight } from "@/components/animate-ui/motion-highlight";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/Sidebar";

const mainNavigation = [
  {
    name: "Dashboard",
    href: "/saas/dashboard",
    icon: Home,
    notifications: false,
  },
] as const;

const applicantSections = [
  {
    name: "Applicants",
    href: "/saas/applicants/list",
    icon: Users,
    openIcon: Users,
    children: [
      {
        name: "List",
        href: "/saas/applicants/list",
      },
      {
        name: "Create",
        href: "/saas/applicants/create",
      },
    ],
  },
  {
    name: "Loan Applications",
    href: "/saas/loan-applications/list",
    icon: FileText,
    openIcon: FileText,
    children: [
      {
        name: "List",
        href: "/saas/loan-applications/list",
      },
    ],
  },
  {
    name: "Income",
    href: "/saas/income/list",
    icon: DollarSign,
    openIcon: Dollar,
    children: [
      {
        name: "List",
        href: "/saas/income/list",
      },
    ],
  },
  {
    name: "Loan Eligibility",
    href: "/saas/loaneligibility/list",
    icon: FileCheck,
    openIcon: Check,
    children: [
      {
        name: "List",
        href: "/saas/loaneligibility/list",
      },
    ],
  },
] as const;

const verificationSections = [
  {
    name: "Business Verification",
    href: "/saas/businessverification/list",
    icon: Building,
    openIcon: Building2,
    children: [
      {
        name: "List",
        href: "/saas/businessverification/list",
      },
    ],
  },
  {
    name: "Residence Verification",
    href: "/saas/residenceverification/list",
    icon: Home,
    openIcon: HomeIcon,
    children: [
      {
        name: "List",
        href: "/saas/residenceverification/list",
      },
    ],
  },
  {
    name: "Physical Verification",
    href: "/saas/physicalverification/list",
    icon: FileCheck,
    openIcon: Check,
    children: [
      {
        name: "List",
        href: "/saas/physicalverification/list",
      },
    ],
  },
] as const;

const eligibilitySections = [
  {
    name: "Mortgage Eligibility",
    href: "/saas/mortgageeligibility/list",
    icon: Building,
    openIcon: Building2,
    children: [
      {
        name: "List",
        href: "/saas/mortgageeligibility/list",
      },
    ],
  },
  {
    name: "Property Eligibility",
    href: "/saas/propertyeligibility/list",
    icon: Home,
    openIcon: HomeIcon,
    children: [
      {
        name: "List",
        href: "/saas/propertyeligibility/list",
      },
    ],
  },
  {
    name: "Plot Eligibility",
    href: "/saas/ploteligibility/list",
    icon: Home,
    openIcon: HomeIcon,
    children: [
      {
        name: "List",
        href: "/saas/ploteligibility/list",
      },
    ],
  },
  {
    name: "Vehicle Eligibility",
    href: "/saas/vehicleeligibility/list",
    icon: CarFront,
    openIcon: CarFront,
    children: [
      {
        name: "List",
        href: "/saas/vehicleeligibility/list",
      },
    ],
  },
] as const;

const otherSections = [
  {
    name: "Banks",
    href: "/saas/banks/list",
    icon: Building,
    openIcon: Building2,
    children: [
      {
        name: "List",
        href: "/saas/banks/list",
      },
    ],
  },
  {
    name: "Quotes",
    href: "/saas/quotes/list",
    icon: CreditCard,
    openIcon: Card,
    children: [
      {
        name: "List",
        href: "/saas/quotes/list",
      },
    ],
  },
] as const;

// Group all navigation sections
const allNavigationSections = [
  { title: "Applicant Management", sections: applicantSections },
  { title: "Verifications", sections: verificationSections },
  { title: "Eligibility", sections: eligibilitySections },
  { title: "Other", sections: otherSections },
];

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const [openFolders, setOpenFolders] = useState<string[]>([]);

  useEffect(() => {
    // Determine which folders should be open based on current path
    const segments = pathname.split("/");
    if (segments.length >= 3) {
      const currentModel = segments[2];

      const newOpenFolders: string[] = [];
      allNavigationSections.forEach((group) => {
        group.sections.forEach((section) => {
          if (section.href.includes(currentModel)) {
            newOpenFolders.push(section.name);
          }
        });
      });

      setOpenFolders(newOpenFolders);
    }
  }, [pathname]);

  // Check if a link is active based on the current pathname
  const isLinkActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
            <Logo className="size-6 text-blue-500 dark:text-blue-500" />
          </span>
          <div>
            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-50">Credit IQ</span>
            <span className="block text-xs text-gray-900 dark:text-gray-50">SaaS dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className={"px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
        <SidebarGroup>
          <SidebarGroupContent>
            <Input type="search" placeholder="Search items..." className="[&>input]:sm:py-1.5" />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <div className="">
          <MotionHighlight mode="parent" controlledItems hover className="bg-gray-100 dark:bg-gray-800">
            {mainNavigation.map((item) => (
              <div key={item.name} className="mb-1 last:mb-0">
                <File
                  name={item.name}
                  sideComponent={<item.icon className="ml-auto size-4 text-gray-500" />}
                  className={cx(
                    "text-gray-900 dark:text-gray-400",
                    isLinkActive(item.href) && "font-medium text-blue-600 dark:text-blue-400",
                  )}
                />
              </div>
            ))}
          </MotionHighlight>
        </div>

        <Divider className="my-3" />

        {/* Section Groups */}
        {allNavigationSections.map((group, groupIndex) => (
          <div key={group.title} className="mb-4">
            <div className="px-2 py-2">
              <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{group.title}</h3>
            </div>

            <MotionHighlight mode="parent" controlledItems hover className="bg-gray-100 dark:bg-gray-800">
              <Files
                className="border-0 bg-transparent shadow-none"
                activeClassName="bg-transparent"
                open={openFolders}
                onOpenChange={setOpenFolders}
              >
                {group.sections.map((section) => {
                  const OpenIcon = section.openIcon;
                  const CloseIcon = section.icon;

                  // Define custom icons for the folder
                  const customIcons = {
                    open: <OpenIcon className="size-4 text-blue-500" />,
                    close: <CloseIcon className="size-4" />,
                  };

                  return (
                    <Folder
                      key={section.name}
                      name={section.name}
                      sideComponent={<span className="ml-auto text-gray-500" />}
                      className={cx(
                        "text-gray-900 dark:text-gray-400",
                        isLinkActive(section.href) && "font-medium text-blue-600 dark:text-blue-400",
                      )}
                      icons={customIcons}
                    >
                      {section.children?.map((child) => (
                        <File
                          key={child.name}
                          name={child.name}
                          className={cx(
                            "text-gray-700 dark:text-gray-400",
                            isLinkActive(child.href) && "font-medium text-blue-600 dark:text-blue-400",
                          )}
                          href={child.href}
                          isActive={isLinkActive(child.href)}
                        />
                      ))}
                    </Folder>
                  );
                })}
              </Files>
            </MotionHighlight>

            {groupIndex < allNavigationSections.length - 1 && <Divider className="my-3" />}
          </div>
        ))}

        {/*<LoanSteps steps={updateSteps(currentStep)} currentStep={currentStep} />*/}
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
