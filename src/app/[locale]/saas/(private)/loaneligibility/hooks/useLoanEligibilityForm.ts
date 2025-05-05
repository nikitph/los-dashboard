import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAbility } from "@/lib/casl/abilityContext";
import { defineLoanEligibilityFieldVisibility } from "../lib/defineLoanEligiblityFieldVisibility";
import { ConfirmLoanEligibilityInput, confirmLoanEligibilitySchema } from "../schemas/loanEligibilitySchema";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { updateLoanApplicationTenure } from "../actions/updateLoanApplicationTenure";
import { toastError } from "@/lib/toastUtils";

type UseLoanEligibilityFormProps = {
  loanApplication: any;
  loanEligibilityData: any;
};

/**
 * Calculates the EMI (Equated Monthly Installment) based on loan amount and tenure
 *
 * @param {number} principal - The loan amount
 * @param {number} tenureMonths - The loan tenure in months
 * @param {number} annualRate - The annual interest rate (default: 12%)
 * @returns {number} The calculated monthly EMI
 */
function calculateEMI(principal: number, tenureMonths: number, annualRate = 12): number {
  const monthlyRate = annualRate / 12 / 100;
  return Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1),
  );
}

/**
 * Custom hook to manage the loan eligibility form state and logic
 *
 * @param {UseLoanEligibilityFormProps} props - Hook configuration
 * @param {any} props.loanApplication - The loan application data
 * @param {any} props.loanEligibilityData - The loan eligibility data
 * @returns Form state, handlers, and computed data for the loan eligibility form
 */
export function useLoanEligibilityForm({ loanApplication, loanEligibilityData }: UseLoanEligibilityFormProps) {
  const [value, setValue] = useState(() => {
    const eligible = Number(loanEligibilityData?.eligibleLoanAmount ?? 0);
    const proposed = Number(loanApplication?.amountRequested ?? 0);
    const lesser = Math.min(eligible, proposed);
    return lesser.toString();
  });
  const [selectedValue, setSelectedValue] = useState<string>("tenure2");
  const t = useTranslations("LoanEligibility");
  const router = useRouter();
  const locale = useLocale();

  // Get CASL ability and compute field visibility
  const ability = useAbility();
  const visibility = useMemo(() => defineLoanEligibilityFieldVisibility(ability), [ability]);

  // Calculate tenure options based on the proposed amount
  const options = useMemo(() => {
    const principal = parseFloat(value);
    if (isNaN(principal) || principal <= 0) return [];

    const tenures = [12, 24, 36, 48, 60];

    return tenures.map((months, i) => {
      const emi = calculateEMI(principal, months);
      return {
        id: `tenure${i + 1}`,
        tenure: months,
        unit: "months",
        emi: emi,
      };
    });
  }, [value]);

  // Get the selected tenure option
  const selectedOption = options.find((option) => option.id === selectedValue);

  // Set up form with Zod resolver
  const form = useForm<ConfirmLoanEligibilityInput>({
    resolver: zodResolver(confirmLoanEligibilitySchema),
    defaultValues: {
      loanApplicationId: loanApplication.id,
      proposedAmount: parseFloat(value) || 0,
      selectedTenure: selectedOption?.tenure || 0,
      calculatedEMI: selectedOption?.emi || 0,
      accepted: false,
    },
  });

  /**
   * Handles the proceed button click (accept loan)
   */
  const handleProceedClick = async () => {
    if (!selectedOption) return;
    if (value > loanEligibilityData.eligibleLoanAmount) {
      toastError({
        title: t("errors.proposedAmount.exceedsEligibleAmount.title"),
        description: t("errors.proposedAmount.exceedsEligibleAmount.description"),
      });
      return;
    }

    try {
      const response = await updateLoanApplicationTenure(
        loanApplication.id,
        selectedOption.tenure,
        selectedOption.emi,
        parseFloat(value),
      );
      console.log("response", response);

      // Navigate to loan confirmation page
      router.push(`/${locale}/saas/loanconfirmation?lid=${loanApplication.id}&status=a`);
    } catch (error) {
      console.error("Error updating loan application:", error);
    }
  };

  /**
   * Handles the decline button click (reject loan)
   */
  const handleDeclineClick = async () => {
    try {
      // Here you would implement decline logic
      // Navigate to loan confirmation page with rejected status
      router.push(`/${locale}/saas/loanconfirmation?lid=${loanApplication.id}&status=r`);
    } catch (error) {
      console.error("Error declining loan application:", error);
    }
  };

  return {
    form,
    visibility,
    value,
    setValue,
    selectedValue,
    setSelectedValue,
    options,
    selectedOption,
    handleProceedClick,
    handleDeclineClick,
    loanApplication,
    loanEligibilityData,
  };
}
