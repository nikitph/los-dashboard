"use server";

import { defineAbilityFor } from "@/lib/casl/ability";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

// This is a convenience route that redirects to the create page
// Following the architecture guidelines for having both create/ and new/ routes
export default async function NewLoanObligationPage() {
  // Get current user and define their abilities
  const user = await getServerSessionUser();
  const ability = defineAbilityFor(user);
  const locale = await getLocale();

  console.log(ability, "ability");

  // Check if user can create loan obligations
  if (!ability.can("create", "LoanObligation")) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Unauthorized</h1>
        <p>You do not have permission to create loan obligations.</p>
      </div>
    );
  }

  // Redirect to the applicants page to select an applicant first
  redirect(`${locale}/saas/loanobligation/create`);
}
