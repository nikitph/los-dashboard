"use client";
import { usePathname } from "next/navigation";
import { Divider } from "@/components/Divider";
import { Input } from "@/components/Input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSubLink,
} from "@/components/Sidebar";
import { cx, focusRing } from "@/lib/utils";
import { RiArrowDownSFill } from "@remixicon/react";
import { Building, CarFront, CreditCard, DollarSign, FileCheck, FileText, Home, Users } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Logo } from "../../../../public/Logo";
import { UserProfile } from "./UserProfile";

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
    children: [
      {
        name: "List",
        href: "/saas/residencverificaion/lit",
      },
    ],
  },
  {
    name: "Physical Verification",
    href: "/saas/physicalverification/list",
    icon: FileCheck,
    children: [
      {
        name: "List",
        href: "/saas/physicaverificaion/lit",
      },
    ],
  },
] as const;

const eligibilitySections = [
  {
    name: "Mortgage Eligibility",
    href: "/saas/mortgageeligibility/list",
    icon: Building,
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
    children: [
      {
        name: "List",
        href: "/saas/ploteligibilitylist",
      },
    ],
  },
  {
    name: "Vehicle Eligibility",
    href: "/saas/vehicleeligibility/list",
    icon: CarFront,
    children: [
      {
        name: "List",
        href: "/saas/vehicleeligibility/lis",
      },
    ],
  },
] as const;

const otherSections = [
  {
    name: "Banks",
    href: "/saas/banks/list",
    icon: Building,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Determine the current model/section from the URL path
  useEffect(() => {
    const segments = pathname.split("/");
    if (segments.length >= 3) {
      const currentModel = segments[2]; // Now the model is the third segment after /saas/

      // Open the menu containing the current model
      allNavigationSections.forEach((group) => {
        group.sections.forEach((section) => {
          if (section.href.includes(currentModel)) {
            if (!openMenus.includes(section.name)) {
              setOpenMenus((prev) => [...prev, section.name]);
            }
          }
        });
      });
    }
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev: string[]) =>
      prev.includes(name) ? prev.filter((item: string) => item !== name) : [...prev, name],
    );
  };

  const steps: Step[] = [
    { label: "Personal Details", status: "current" },
    { label: "Income Details", status: "upcoming" },
    { label: "Loan Verification", status: "upcoming" },
    { label: "Eligibility", status: "upcoming" },
    { label: "Offer", status: "upcoming" },
    { label: "Verification", status: "upcoming" },
  ];

  const updateSteps = (stepIndex: number) => {
    return steps.map((step, index) => ({
      ...step,
      status: index === stepIndex ? "current" : index < stepIndex ? "completed" : "upcoming",
    })) as Step[];
  };

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
      <SidebarContent className={"[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
        <SidebarGroup>
          <SidebarGroupContent>
            <Input type="search" placeholder="Search items..." className="[&>input]:sm:py-1.5" />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href={item.href}
                    isActive={isLinkActive(item.href)}
                    icon={item.icon}
                    notifications={item.notifications}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>

        {allNavigationSections.map((group, index) => (
          <SidebarGroup key={group.title}>
            {index > 0 && (
              <div className="px-3 py-1">
                <Divider className="my-0 py-0" />
              </div>
            )}
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{group.title}</h3>
            </div>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.sections.map((section) => (
                  <SidebarMenuItem key={section.name}>
                    <button
                      onClick={() => toggleMenu(section.name)}
                      className={cx(
                        "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base text-gray-900 transition hover:bg-gray-200/50 sm:text-sm dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-gray-50",
                        isLinkActive(section.href) &&
                          "bg-gray-200/50 text-blue-600 dark:bg-gray-800 dark:text-blue-400",
                        focusRing,
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <section.icon className="size-[18px] shrink-0" aria-hidden="true" />
                        {section.name}
                      </div>
                      <RiArrowDownSFill
                        className={cx(
                          openMenus.includes(section.name) ? "rotate-0" : "-rotate-90",
                          "size-5 shrink-0 transform text-gray-400 transition-transform duration-150 ease-in-out dark:text-gray-600",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    {section.children && openMenus.includes(section.name) && (
                      <SidebarMenuSub>
                        <div className="absolute inset-y-0 left-4 w-px bg-gray-300 dark:bg-gray-800" />
                        {section.children.map((child) => (
                          <SidebarMenuItem key={child.name}>
                            <SidebarSubLink href={child.href} isActive={isLinkActive(child.href)}>
                              {child.name}
                            </SidebarSubLink>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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
