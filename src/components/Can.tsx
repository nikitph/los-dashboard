"use client";

import { ReactNode } from "react";
import { useAbility } from "@/contexts/abilityContext";
import { Actions, Subjects } from "@/lib/casl/types";

type CanProps = {
  I: Actions;
  do: Actions;
  on: Subjects;
  this?: any;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ I, do: action, on, this: field, children, fallback = null }: CanProps) {
  const ability = useAbility();

  return ability.can(action, on, field) ? <>{children}</> : <>{fallback}</>;
}
