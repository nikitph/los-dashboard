"use server";

import LoanConfirmationForm from "@/app/[locale]/saas/(private)/loanconfirmation/components/LoanConfirmationForm";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getAbility } from "@/lib/casl/getAbility";
import { redirect } from "next/navigation";
import { getLoanApplication } from "./actions/getLoanApplication";
import React from "react";

/**
 * Page component for the loan confirmation process
 *
 * @param {Object} props - Component props
 * @param {Object} props.searchParams - URL search parameters
 * @returns {Promise<JSX.Element>} LoanConfirmationPage component
 */
export default async function LoanConfirmationPage({
  searchParams,
}: {
  searchParams: { lid?: string; status: string };
}): Promise<React.ReactNode> {
  const user = await getServerSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Check permissions
  const ability = await getAbility(user);
  if (!ability.can("update", "LoanApplication")) {
    redirect("/unauthorized");
  }

  const resolvedSearchParams = await searchParams;

  const status = resolvedSearchParams?.status as "a" | "r" | "e";
  const loanApplicationId = resolvedSearchParams?.lid;

  // Validate status parameter
  if (!status || !["a", "r", "e"].includes(status)) {
    redirect("/invalid-parameters");
  }

  // Get loan application data
  let loanApplication = null;
  if (loanApplicationId) {
    try {
      const response = await getLoanApplication(loanApplicationId);
      if (response.success && response.data) {
        loanApplication = response.data;
      } else {
        // Handle error, e.g., loan application not found
        redirect("/not-found");
      }
    } catch (error) {
      console.error("Error fetching loan application:", error);
      redirect("/error");
    }
  } else {
    // Loan application ID is required
    redirect("/invalid-parameters");
  }

  return (
    <div>
      <LoanConfirmationForm loanApplication={loanApplication} status={status} />
    </div>
  );
}
