"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types/globalTypes";
import { getServerSessionUser } from "@/lib/getServerUser";

type UserContextType = {
  user: User | null;
  loading: boolean;
  setCurrentRole: (role: { role: string; bankId: string | null }) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setCurrentRole: () => {},
});

export const UserProvider = ({ children, initialUser = null }: { children: ReactNode; initialUser?: User | null }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const setCurrentRole = (role: { role: string; bankId: string | null }) => {
    if (user) {
      setUser({
        ...user,
        currentRole: role,
      });
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Get the initial user server-side - this avoids the "null" flicker
        const serverUser = await getServerSessionUser();
        if (serverUser) {
          setUser(serverUser);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const serverUser = await getServerSessionUser();
        if (serverUser) setUser(serverUser);
        else setUser(null);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <UserContext.Provider value={{ user, loading, setCurrentRole }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
