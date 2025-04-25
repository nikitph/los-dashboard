"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AppAbility } from "@/lib/casl/types";
import { defineAbilityFor } from "@/lib/casl/ability";
import { useUser } from "@/contexts/userContext";

const AbilityContext = createContext<AppAbility | undefined>(undefined);

export function useAbility() {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error("useAbility must be used within an AbilityProvider");
  }
  return ability;
}

type AbilityProviderProps = {
  children: ReactNode;
};

export function AbilityProvider({ children }: AbilityProviderProps) {
  const { user } = useUser();
  const [ability, setAbility] = useState<AppAbility>(() => defineAbilityFor(user));

  useEffect(() => {
    if (user) setAbility(defineAbilityFor(user));
  }, [user]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
