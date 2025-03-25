"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { prisma } from "@/lib/prisma";

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  id: string;
  roles: { role: string; bankId: string | null }[];
  currentRole: { role: string; bankId: string | null };
};

type UserContextType = {
  user: User | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({ user: null, loading: true });

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: data } = await supabase.auth.getUser();

      console.log("data", data);
      const authUser = data?.user;

      if (authUser) {
        const roles = await prisma.userRoles.findMany({
          where: {
            userId: authUser.id,
          },
          select: {
            role: true,
            bankId: true,
          },
        });

        setUser({
          firstName: authUser.user_metadata?.first_name,
          lastName: authUser.user_metadata?.last_name,
          email: authUser.email,
          id: authUser.id,
          roles: roles,
          currentRole: roles[0],
        });
      }
      setLoading(false);
    };

    getUser();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = session.user;
        const roles = await prisma.userRoles.findMany({
          where: {
            userId: authUser.id,
          },
          select: {
            role: true,
            bankId: true,
          },
        });
        setUser({
          firstName: authUser.user_metadata?.first_name,
          lastName: authUser.user_metadata?.last_name,
          email: authUser.email,
          id: authUser.id,
          roles: roles,
          currentRole: roles[0],
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
