"use client";

import { usePathname } from "next/navigation";
import { Divider } from "@/components/Divider";
import { Input } from "@/components/Input";
import { Banknote, Bell, BellDot, CircleUser, CreditCard, User } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Logo } from "../../../../public/Logo";
import { UserProfile } from "./UserProfile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/Sidebar";
import { Navigation, NavItem } from "./Navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

const settingsSections = [
  {
    name: "Account",
    href: "/saas/account",
    icon: User,
    openIcon: CircleUser,
  },
  {
    name: "Notifications",
    href: "/saas/notificationsettings",
    icon: Bell,
    openIcon: BellDot,
  },
] as const;

const otherSections = [
  {
    name: "Billing",
    href: "/saas/billingsettings",
    icon: CreditCard,
    openIcon: Banknote,
  },
] as const;

// Group all navigation sections
const allNavigationSections = [
  { title: "Personal", sections: settingsSections },
  { title: "Bank", sections: otherSections },
];

export function SettingsSidebar({ ...props }) {
  const pathname = usePathname();
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const locale = useLocale();

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
            <Link href={`/saas/dashboard`}>
              <Logo className="size-6 text-blue-500 dark:text-blue-500" />
            </Link>
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

        {/*/!* Main Navigation *!/*/}
        {/*<div className="">*/}
        {/*  <MotionHighlight mode="parent" controlledItems hover className="bg-gray-100 dark:bg-gray-800">*/}
        {/*    {mainNavigation.map((item) => (*/}
        {/*      <div key={item.name} className="mb-1 last:mb-0">*/}
        {/*        <File*/}
        {/*          name={item.name}*/}
        {/*          sideComponent={<item.icon className="ml-auto size-4 text-gray-500" />}*/}
        {/*          className={cx(*/}
        {/*            "text-gray-900 dark:text-gray-400",*/}
        {/*            isLinkActive(item.href) && "font-medium text-blue-600 dark:text-blue-400",*/}
        {/*          )}*/}
        {/*        />*/}
        {/*      </div>*/}
        {/*    ))}*/}
        {/*  </MotionHighlight>*/}
        {/*</div>*/}

        <Divider className="my-3" />
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Section Groups */}
            {allNavigationSections.map((group, groupIndex) => (
              <div key={group.title} className="mb-2">
                <div className="py-2">
                  <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{group.title}</h3>
                </div>
                <Navigation>
                  {group.sections.map((item) => (
                    <NavItem
                      key={item.href}
                      name={item.name}
                      href={item.href}
                      icon={item.icon}
                      openIcon={item.openIcon}
                      locale={locale}
                    />
                  ))}
                </Navigation>
                {/*{groupIndex < allNavigationSections.length - 1 && <Divider className="my-3" />}*/}
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        {/*<LoanSteps steps={updateSteps(currentStep)} currentStep={currentStep} />*/}
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
