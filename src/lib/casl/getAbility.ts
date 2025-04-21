import { defineAbilityFor } from "./ability";
import { AppAbility } from "./types";
import { User } from "@/types/globalTypes";

export async function getAbility(user: User): Promise<AppAbility> {
  return defineAbilityFor(user);
}
