"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AppAbility, User } from "@/lib/casl/types";
import { defineAbilityFor } from "@/lib/casl/ability";

const AbilityContext = createContext<AppAbility | undefined>(undefined);

export function useAbility() {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error("useAbility must be used within an AbilityProvider");
  }
  return ability;
}

type AbilityProviderProps = {
  user?: User;
  children: ReactNode;
};

export function AbilityProvider({ user, children }: AbilityProviderProps) {
  const [ability, setAbility] = useState<AppAbility>(() => defineAbilityFor(user));

  useEffect(() => {
    setAbility(defineAbilityFor(user));
  }, [user]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
