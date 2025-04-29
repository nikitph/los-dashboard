"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAbility } from "@/lib/casl/abilityContext";
import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { defineLoanObligationFieldVisibility } from "../lib/defineLoanObligationFieldVisibility";
import { LoanObligationFormValues } from "../schemas/loanObligationSchema";

interface FormFieldsProps {
  form: UseFormReturn<LoanObligationFormValues>;
  index?: number;
  isReadOnly?: boolean;
}

export function FormFields({ form, index, isReadOnly = false }: FormFieldsProps) {
  const ability = useAbility();
  const fieldVisibility = defineLoanObligationFieldVisibility(ability);
  const t = useTranslations("LoanObligations");

  console.log(fieldVisibility, "fields");

  // If this is a loan detail field (index is provided)
  if (typeof index === "number") {
    return (
      <>
        <td className="border p-2">
          <Input
            {...form.register(`loans.${index}.outstandingLoan`)}
            type="text"
            placeholder={t("form.outstandingLoanPlaceholder")}
            disabled={isReadOnly || !fieldVisibility.isLoanDetailFieldEditable("outstandingLoan")}
          />
          {form.formState.errors.loans?.[index]?.outstandingLoan && (
            /* @ts-ignore */
            <p className="mt-1 text-sm text-red-500">
              {t(form.formState.errors.loans[index]?.outstandingLoan?.message)}
            </p>
          )}
        </td>
        <td className="border p-2">
          <Input
            {...form.register(`loans.${index}.emiAmount`)}
            type="text"
            placeholder={t("form.emiAmountPlaceholder")}
            disabled={isReadOnly || !fieldVisibility.isLoanDetailFieldEditable("emiAmount")}
          />
          {form.formState.errors.loans?.[index]?.emiAmount && (
            /* @ts-ignore */
            <p className="mt-1 text-sm text-red-500">{t(form.formState.errors.loans[index]?.emiAmount?.message)}</p>
          )}
        </td>
        <td className="border p-2">
          <Input
            {...form.register(`loans.${index}.loanDate`)}
            type="date"
            placeholder="dd/mm/yyyy"
            disabled={isReadOnly || !fieldVisibility.isLoanDetailFieldEditable("loanDate")}
          />
          {form.formState.errors.loans?.[index]?.loanDate && (
            /* @ts-ignore */
            <p className="mt-1 text-sm text-red-500">{t(form.formState.errors.loans[index]?.loanDate?.message)}</p>
          )}
        </td>
        <td className="border p-2">
          <Input
            {...form.register(`loans.${index}.loanType`)}
            type="text"
            placeholder={t("form.loanTypePlaceholder")}
            disabled={isReadOnly || !fieldVisibility.isLoanDetailFieldEditable("loanType")}
          />
          {form.formState.errors.loans?.[index]?.loanType && (
            /* @ts-ignore */
            <p className="mt-1 text-sm text-red-500">{t(form.formState.errors.loans[index]?.loanType?.message)}</p>
          )}
        </td>
        <td className="border p-2">
          <Input
            {...form.register(`loans.${index}.bankName`)}
            type="text"
            placeholder={t("form.bankNamePlaceholder")}
            disabled={isReadOnly || !fieldVisibility.isLoanDetailFieldEditable("bankName")}
          />
          {form.formState.errors.loans?.[index]?.bankName && (
            /* @ts-ignore */
            <p className="mt-1 text-sm text-red-500">{t(form.formState.errors.loans[index]?.bankName?.message)}</p>
          )}
        </td>
      </>
    );
  }

  // Main form fields
  return (
    <>
      {fieldVisibility.fields.cibilScore.visible && (
        <div className="mb-6">
          <Label htmlFor="cibilScore" className="mb-2 block">
            {t("form.cibilScore")}
          </Label>
          <Input
            id="cibilScore"
            className="max-w-[240px]"
            {...form.register("cibilScore")}
            placeholder={t("form.cibilScorePlaceholder")}
            disabled={isReadOnly || !fieldVisibility.fields.cibilScore.editable}
          />
          {form.formState.errors.cibilScore && (
            /* @ts-ignore */
            <p className="mt-1 text-sm text-red-500">{t(form.formState.errors.cibilScore.message)}</p>
          )}
        </div>
      )}
    </>
  );
}
