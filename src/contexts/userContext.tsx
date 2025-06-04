"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/globalTypes";

type UserContextType = {
  user: User | null;
  loading: boolean;
  setCurrentRole: (role: { role: string; bankId: string | null }) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, initialUser = null }: { children: ReactNode; initialUser?: User | null }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const loading = false;

  const setCurrentRole = useCallback((role: { role: string; bankId: string | null }) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, currentRole: role } : null));
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed, event:", event);
      if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return <UserContext.Provider value={{ user, loading, setCurrentRole }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
