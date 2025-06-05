"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/globalTypes";

type UserContextType = {
  user: User | null;
  signOut: () => Promise<void>;
  setCurrentRole: (role: { role: string; bankId: string | null }) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, initialUser = null }: { children: ReactNode; initialUser?: User | null }) => {
  const [user, setUser] = useState<User | null>(initialUser);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/en/saas/login";
  };

  const setCurrentRole = useCallback((role: { role: string; bankId: string | null }) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, currentRole: role } : null));
  }, []);

  return <UserContext.Provider value={{ user, signOut, setCurrentRole }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
