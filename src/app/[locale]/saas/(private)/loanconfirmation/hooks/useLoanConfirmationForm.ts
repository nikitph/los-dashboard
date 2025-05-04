import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAbility } from "@/lib/casl/abilityContext";
import { defineLoanConfirmationFieldVisibility } from "../lib/defineLoanConfirmationFieldVisibility";
import { CreateLoanConfirmationInput, createLoanConfirmationSchema } from "../schemas/loanConfirmationSchema";
import { LoanApplication } from "@prisma/client";
import { useRouter } from "next/navigation";

type UseLoanConfirmationFormProps = {
  loanApplication: LoanApplication;
  status: "a" | "r" | "e";
};

/**
 * Custom hook to manage the loan confirmation form state and logic
 *
 * @param {UseLoanConfirmationFormProps} props - Hook configuration
 * @param {LoanApplication} props.loanApplication - The loan application data
 * @param {string} props.status - The status of the loan application (a=accepted, r=rejected, e=escalated)
 * @returns Form state and handlers for the loan confirmation form
 */
export function useLoanConfirmationForm({ loanApplication, status }: UseLoanConfirmationFormProps) {
  const [remark, setRemark] = useState("");
  const router = useRouter();

  // Get CASL ability and compute field visibility
  const ability = useAbility();
  const visibility = useMemo(() => defineLoanConfirmationFieldVisibility(ability), [ability]);

  // Set up form with Zod resolver
  const form = useForm<CreateLoanConfirmationInput>({
    resolver: zodResolver(createLoanConfirmationSchema),
    defaultValues: {
      loanApplicationId: loanApplication.id,
      status,
      remark: "",
    },
  });

  /**
   * Gets the appropriate message based on loan status
   * @returns {string} The message key for the current status
   */
  const getMessage = () => {
    switch (status) {
      case "a":
        return "messages.accepted";
      case "r":
        return "messages.rejected";
      case "e":
        return "messages.escalated";
      default:
        return "messages.processing";
    }
  };

  /**
   * Gets the appropriate button label based on loan status
   * @returns {string} The button label key for the current status
   */
  const getButtonLabel = () => {
    switch (status) {
      case "a":
        return "buttons.proceedToInspection";
      case "r":
        return "buttons.finishApplication";
      case "e":
        return "buttons.proceedToLoanOfficer";
      default:
        return "buttons.proceed";
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleProceedClick = () => {
    // Here we would implement the actual proceed logic
    // based on the status, potentially calling server actions
    console.log("Proceed button clicked for LId:", loanApplication.id);
    console.log("Status:", status);
    console.log("Remark:", remark);
    // Example: callProceedAction({ loanApplicationId: loanApplication.id, status, remark });
  };

  return {
    form,
    visibility,
    remark,
    setRemark,
    getMessage,
    getButtonLabel,
    handleBackClick,
    handleProceedClick,
    loanApplication,
  };
}
