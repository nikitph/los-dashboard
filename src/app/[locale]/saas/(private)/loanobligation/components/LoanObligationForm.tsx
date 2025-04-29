"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAbility } from "@/lib/casl/abilityContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLoanObligationForm } from "../hooks/useLoanObligationForm";
import { defineLoanObligationFieldVisibility } from "../lib/defineLoanObligationFieldVisibility";
import { LoanObligationFormValues } from "../schemas/loanObligationSchema";
import { FormFields } from "./FormFields";

interface LoanObligationFormProps {
  applicantId: string;
  initialData?: LoanObligationFormValues;
  isReadOnly?: boolean;
  onSuccess?: (data: any) => void;
  redirectPath?: string;
}

export default function LoanObligationForm({
  applicantId,
  initialData,
  isReadOnly = false,
  onSuccess,
  redirectPath,
}: LoanObligationFormProps) {
  const router = useRouter();
  const ability = useAbility();
  const t = useTranslations("LoanObligations");
  const fieldVisibility = defineLoanObligationFieldVisibility(ability);

  const { form, fields, isSubmitting, onSubmit, addLoan, removeLoan, calculateTotalLoan, calculateTotalEmi } =
    useLoanObligationForm({
      applicantId,
      initialData,
      onSuccess,
      redirectPath,
    });

  return (
    <div className="container mx-auto bg-transparent">
      <form onSubmit={onSubmit}>
        {/* CIBIL Score Field */}
        <FormFields form={form} isReadOnly={isReadOnly} />

        {/* Loans Table */}
        <div className="mb-6 overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-12 border p-2 text-left"></th>
                <th className="border p-2 text-left">{t("form.outstandingLoan")}</th>
                <th className="border p-2 text-left">{t("form.emiAmount")}</th>
                <th className="border p-2 text-left">{t("form.loanDate")}</th>
                <th className="border p-2 text-left">{t("form.loanType")}</th>
                <th className="border p-2 text-left">{t("form.bankName")}</th>
                <th className="border p-2 text-left">{t("actions.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="border p-2">{index + 1}.</td>
                  <FormFields form={form} index={index} isReadOnly={isReadOnly} />
                  <td className="border p-2">
                    {!isReadOnly && fields.length > 1 && fieldVisibility.actions.removeLoanDetail && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeLoan(index)}
                        className="h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isReadOnly && fieldVisibility.actions.addLoanDetail && (
          <Button type="button" variant="link" onClick={addLoan} className="mb-6 text-blue-600 hover:text-blue-800">
            + {t("actions.addMore")}
          </Button>
        )}

        {/* Totals */}
        {fieldVisibility.fields.totalLoan.visible && fieldVisibility.fields.totalEmi.visible && (
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="totalLoan" className="mb-2 block">
                {t("form.totalLoan")}
              </Label>
              <Input type="text" id="totalLoan" className="bg-gray-50" value={calculateTotalLoan()} readOnly />
            </div>
            <div>
              <Label htmlFor="totalEmi" className="mb-2 block">
                {t("form.totalEmi")}
              </Label>
              <Input type="text" id="totalEmi" className="bg-gray-50" value={calculateTotalEmi()} readOnly />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("actions.back")}
          </Button>

          {!isReadOnly && (
            <Button type="submit" variant="default" className="bg-black text-white" disabled={isSubmitting}>
              {isSubmitting ? t("actions.submitting") : t("actions.proceedToIncomeDetails")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
