"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/userContext";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

export type DropdownUserProfileProps = {
  children: React.ReactNode;
  align?: "center" | "start" | "end";
};

export function DropdownUserProfile({ children, align = "start" }: DropdownUserProfileProps) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const { user } = useUser();
  const router = useRouter();
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
        return;
      }
      router.push("/saas/signup");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  if (!mounted) {
    return null;
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="sm:!min-w-[calc(var(--radix-dropdown-menu-trigger-width))]">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>Theme</DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) => {
                    setTheme(value);
                  }}
                >
                  <DropdownMenuRadioItem aria-label="Switch to Light Mode" value="light" iconType="check">
                    <Sun className="size-4 shrink-0" aria-hidden="true" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem aria-label="Switch to Dark Mode" value="dark" iconType="check">
                    <Moon className="size-4 shrink-0" aria-hidden="true" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem aria-label="Switch to System Mode" value="system" iconType="check">
                    <Monitor className="size-4 shrink-0" aria-hidden="true" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href="/saas/account">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleSignOut();
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
