"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getUserRoles } from "@/contexts/actions/user-actions";

export async function getServerSessionUser() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user) {
    const { success, data: roles } = await getUserRoles(user.id);

    if (success && roles && roles.length > 0) {
      // Filter out roles with null bankId and exclude "APPLICANT" role. What remains should be the employee role
      // TODO this needs to be worked out when we have Applicant logins
      let currentRole = roles.filter((r) => r.bankId !== null && r.role !== "APPLICANT")[0];

      console.log("Current Role:", currentRole, roles);

      return {
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        email: user.email,
        phoneNumber: user.phone,
        id: user.id,
        roles: roles,
        currentRole: currentRole,
      };
    }
  }

  if (error || !user) return null;
}
