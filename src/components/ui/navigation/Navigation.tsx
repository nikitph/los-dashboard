"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { MotionHighlight, MotionHighlightItem } from "@/components/animate-ui/motion-highlight";

type NavItemProps = {
  name: string;
  href: string;
  locale?: string;
  icon: React.ComponentType<any>;
  openIcon?: React.ComponentType<any>;
  className?: string;
  sideComponent?: React.ReactNode;
};

function NavItem({
  name,
  href,
  icon: Icon,
  openIcon: OpenIcon,
  className,
  sideComponent,
  locale = "en",
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/${locale}${href}`;
  const IconComponent = isActive && OpenIcon ? OpenIcon : Icon;

  return (
    <MotionHighlightItem className="size-full">
      <Link
        href={`/${locale}${href}`}
        className={cn(
          "relative z-10 flex h-10 w-full cursor-pointer items-center gap-2 truncate rounded-lg p-2 transition-colors hover:bg-muted/50",
          isActive && "text-blue-600 dark:text-blue-400",
          className,
        )}
      >
        <span className="shrink-1 flex items-center gap-2 truncate [&_svg]:size-4 [&_svg]:shrink-0">
          <AnimatePresence mode="wait">
            <motion.span
              key={isActive ? "active" : "inactive"}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <IconComponent />
            </motion.span>
          </AnimatePresence>
          <span className="shrink-1 block truncate break-words text-sm">{name}</span>
        </span>
        {sideComponent}
      </Link>
    </MotionHighlightItem>
  );
}

type NavigationProps = React.ComponentProps<"nav"> & {
  children: React.ReactNode;
  activeClassName?: string;
};

function Navigation({ children, className, activeClassName, ...props }: NavigationProps) {
  return (
    <nav className={cn("relative overflow-auto rounded-xl border bg-background", className)} {...props}>
      <MotionHighlight
        controlledItems
        mode="parent"
        hover
        className={cn("pointer-events-none rounded-lg bg-muted", activeClassName)}
      >
        <div className="space-y-1 p-2">{children}</div>
      </MotionHighlight>
    </nav>
  );
}

// Simple File component for static items (no links)
type FileProps = {
  name: string;
  className?: string;
  sideComponent?: React.ReactNode;
  icon?: React.ComponentType<any>;
};

function File({ name, className, sideComponent, icon: Icon = FileIcon }: FileProps) {
  return (
    <MotionHighlightItem className="size-full">
      <div className={cn("relative z-10 flex h-10 w-full items-center gap-2 truncate rounded-lg p-2", className)}>
        <span className="shrink-1 flex items-center gap-2 truncate [&_svg]:size-4 [&_svg]:shrink-0">
          <Icon />
          <span className="shrink-1 block truncate break-words text-sm">{name}</span>
        </span>
        {sideComponent}
      </div>
    </MotionHighlightItem>
  );
}

export { Navigation, NavItem, File, type NavigationProps, type NavItemProps, type FileProps };
