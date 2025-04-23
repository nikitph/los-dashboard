import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { LoanApplicationFieldVisibility } from "../lib/defineLoanApplicationFieldVisibility";
import { formatLoanStatus, formatLoanType } from "../lib/helpers";

interface FormFieldsProps {
  form: UseFormReturn<any>;
  visibility: LoanApplicationFieldVisibility;
  isDisabled?: boolean;
}

export function FormFields({ form, visibility, isDisabled = false }: FormFieldsProps) {
  const t = useTranslations("LoanApplication");

  return (
    <div className="space-y-6">
      {visibility.applicantId && (
        <FormField
          control={form.control}
          name="applicantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.applicantId.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.applicantId.placeholder")}
                  {...field}
                  disabled={isDisabled || !visibility.canUpdateApplicantId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {visibility.bankId && (
        <FormField
          control={form.control}
          name="bankId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.bankId.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.bankId.placeholder")}
                  {...field}
                  disabled={isDisabled || !visibility.canUpdateBankId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {visibility.loanType && (
        <FormField
          control={form.control}
          name="loanType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.loanType.label")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isDisabled || !visibility.canUpdateLoanType}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.loanType.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PERSONAL">{formatLoanType("PERSONAL")}</SelectItem>
                  <SelectItem value="VEHICLE">{formatLoanType("VEHICLE")}</SelectItem>
                  <SelectItem value="HOUSE_CONSTRUCTION">{formatLoanType("HOUSE_CONSTRUCTION")}</SelectItem>
                  <SelectItem value="PLOT_PURCHASE">{formatLoanType("PLOT_PURCHASE")}</SelectItem>
                  <SelectItem value="MORTGAGE">{formatLoanType("MORTGAGE")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {visibility.amountRequested && (
        <FormField
          control={form.control}
          name="amountRequested"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.amountRequested.label")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t("form.amountRequested.placeholder")}
                  {...field}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  disabled={isDisabled || !visibility.canUpdateAmountRequested}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {visibility.status && (
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.status.label")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isDisabled || !visibility.canUpdateStatus}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.status.placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PENDING">{formatLoanStatus("PENDING")}</SelectItem>
                  <SelectItem value="UNDER_REVIEW">{formatLoanStatus("UNDER_REVIEW")}</SelectItem>
                  <SelectItem value="APPROVED">{formatLoanStatus("APPROVED")}</SelectItem>
                  <SelectItem value="REJECTED">{formatLoanStatus("REJECTED")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
