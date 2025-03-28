"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserRoles } from "@/contexts/actions/user-actions";

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
  setCurrentRole: (role: { role: string; bankId: string | null }) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setCurrentRole: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
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
    const fetchUserData = async (authUser: any) => {
      const { success, data: roles } = await getUserRoles(authUser.id);
      console.log("roles", roles, authUser.id);

      if (success && roles && roles.length > 0) {
        // Filter out roles with null bankId and exclude "APPLICANT" role. What remains should be the employee role
        // TODO this needs to be worked out when we have Applicant logins
        let currentRole = roles.filter((r) => r.bankId !== null && r.role !== "APPLICANT")[0];

        console.log("Current Role:", currentRole, roles);

        setUser({
          firstName: authUser.user_metadata?.first_name,
          lastName: authUser.user_metadata?.last_name,
          email: authUser.email,
          id: authUser.id,
          roles: roles,
          currentRole: currentRole,
        });
      }
      setLoading(false);
    };

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const authUser = data?.user;

      if (authUser) {
        await fetchUserData(authUser);
      } else {
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <UserContext.Provider value={{ user, loading, setCurrentRole }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
