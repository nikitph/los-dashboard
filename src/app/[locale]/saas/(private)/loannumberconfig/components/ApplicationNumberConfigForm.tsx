"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckboxCard } from "@/subframe/components/CheckboxCard";
import { TextField } from "@/subframe/components/TextField";
import { Badge } from "@/subframe/components/Badge";
import { IconButton } from "@/subframe/components/IconButton";
import { Button } from "@/subframe/components/Button";
import { Select } from "@/subframe/components/Select";
import { toast } from "sonner";
import {
  createApplicationNumberConfig,
  updateApplicationNumberConfig,
} from "@/app/[locale]/saas/(private)/loannumberconfig/actions/applicationNumberConfigActions";
import { useApplicationNumberConfigForm } from "@/app/[locale]/saas/(private)/loannumberconfig/hooks/useApplicationNumberConfigForm";
import { Form } from "@/components/ui/form";
import { toastError, toastSuccess } from "@/lib/toastUtils";

interface LoanNumberConfigFormProps {
  bankId: string;
  bankName: string;
  initialData?: any;
}

function LoanNumberConfigForm({ bankId, initialData, bankName }: LoanNumberConfigFormProps) {
  const t = useTranslations("ApplicationNumberConfigurations");
  const [isLoading, setIsLoading] = useState(false);

  const { form, visibility, isEditMode, previewNumber, separatorOptions, loanTypeOptions } =
    useApplicationNumberConfigForm({
      initialData,
      bankId,
      bankName,
    });

  // Watch form values for real-time updates
  const watchedValues = form.watch();

  const handleSubmit = async (data: any) => {
    console.log("data", data);
    setIsLoading(true);
    try {
      const response = isEditMode
        ? await updateApplicationNumberConfig({ ...data, id: initialData?.id })
        : await createApplicationNumberConfig(data);

      if (response.success) {
        toastSuccess({ title: t(isEditMode ? "toast.updated" : "toast.created"), description: response.message });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toastError({ title: t("errors.createFailed"), description: t("errors.createFailed") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    form.reset();
  };

  return (
    <div className="flex w-full flex-col items-start gap-6 bg-default-background px-6 py-6">
      <span className="font-heading-2 text-heading-2 text-default-font">Loan Application Number Configuration</span>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
          <div className="flex w-full items-start gap-6">
            {/* Left Column - Configuration Options */}
            <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6">
              {/* Configure Format Section */}
              <div className="flex w-full flex-col items-start gap-4">
                <span className="font-heading-3 text-heading-3 text-default-font">Configure Format</span>
                <div className="flex w-full flex-col items-start gap-2">
                  {/* Bank Name Prefix */}
                  {visibility.includePrefix && (
                    <CheckboxCard
                      checked={watchedValues.includePrefix || false}
                      onCheckedChange={(checked) => form.setValue("includePrefix", checked)}
                    >
                      <span className="font-body text-body text-default-font">Bank Name Prefix (First 3 letters)</span>
                    </CheckboxCard>
                  )}

                  {/* Branch Serial Number */}
                  {visibility.includeBranch && (
                    <CheckboxCard
                      checked={watchedValues.includeBranch || false}
                      onCheckedChange={(checked) => form.setValue("includeBranch", checked)}
                    >
                      <span className="font-body text-body text-default-font">Branch Serial Number</span>
                    </CheckboxCard>
                  )}

                  {/* Type of Loan */}
                  {visibility.includeLoanType && (
                    <CheckboxCard
                      checked={watchedValues.includeLoanType || false}
                      onCheckedChange={(checked) => form.setValue("includeLoanType", checked)}
                    >
                      <span className="font-body text-body text-default-font">Type of Loan</span>
                    </CheckboxCard>
                  )}

                  {/* Date of Application */}
                  {visibility.includeDate && (
                    <CheckboxCard
                      checked={watchedValues.includeDate || false}
                      onCheckedChange={(checked) => form.setValue("includeDate", checked)}
                    >
                      <span className="font-body text-body text-default-font">Date of Application</span>
                    </CheckboxCard>
                  )}

                  {/* Serial Number - Always included */}
                  <CheckboxCard checked={true} onCheckedChange={() => {}}>
                    <span className="font-body text-body text-default-font">Serial Number</span>
                  </CheckboxCard>
                </div>
              </div>

              {/* Format Settings Section */}
              <div className="flex w-full flex-col items-start gap-4">
                <span className="font-heading-3 text-heading-3 text-default-font">Format Settings</span>

                {/* Separator */}
                {visibility.separator && (
                  <Select
                    onValueChange={(value) => form.setValue("separator", value)}
                    value={watchedValues.separator || "HYPHEN"}
                    placeholder="Select separator"
                    className="w-full"
                    variant="outline"
                  >
                    {separatorOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select>
                )}

                {/* Bank Name */}
                {visibility.bankName && (
                  <TextField className="h-auto w-full flex-none" label="Bank Name" helpText="">
                    <TextField.Input
                      placeholder="First National Bank"
                      value={watchedValues.bankName || ""}
                      onChange={(event) => form.setValue("bankName", event.target.value)}
                    />
                  </TextField>
                )}

                {/* Branch Number */}
                {visibility.branchNumber && (
                  <TextField className="h-auto w-full flex-none" label="Branch Number" helpText="">
                    <TextField.Input
                      placeholder="001"
                      value={watchedValues.branchNumber || ""}
                      onChange={(event) => form.setValue("branchNumber", event.target.value)}
                    />
                  </TextField>
                )}

                {/* Loan Type */}
                {visibility.loanTypeCode && (
                  <Select
                    onValueChange={(value) => form.setValue("loanTypeCode", value)}
                    value={watchedValues.loanTypeCode || "PL"}
                    placeholder="Select loan type"
                    className="w-full"
                    variant="outline"
                  >
                    {loanTypeOptions.map((option) => (
                      <Select.Item key={option.value} value={option.code}>
                        {option.label} ({option.code})
                      </Select.Item>
                    ))}
                  </Select>
                )}
              </div>
            </div>

            {/* Right Column - Preview and Rules */}
            <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6">
              {/* Application Number Preview */}
              <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4">
                <span className="font-heading-3 text-heading-3 text-default-font">Application Number Preview</span>
                <div className="flex w-full items-center justify-center rounded-md border border-solid border-neutral-border bg-default-background px-4 py-2">
                  <span className="font-heading-3 text-heading-3 text-default-font">{previewNumber}</span>
                </div>
                <span className="font-caption text-caption text-subtext-color">
                  This is how the application number will appear in your system
                </span>
              </div>

              {/* Application Number Rules */}
              <div className="flex w-full flex-col items-start gap-4 rounded-md border border-dashed border-error-300 bg-error-50 px-4 py-4">
                <div className="flex w-full items-center justify-between">
                  <span className="font-heading-3 text-heading-3 text-default-font">Application Number Rules</span>
                  <Badge variant="error">INFO</Badge>
                </div>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <IconButton size="small" icon="FeatherInfo" onClick={() => {}} />
                    <span className="font-body text-body text-default-font">
                      Serial number is always included by default
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconButton size="small" icon="FeatherInfo" onClick={() => {}} />
                    <span className="font-body text-body text-default-font">
                      Bank name prefix uses the first 3 letters of the banks name
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconButton size="small" icon="FeatherInfo" onClick={() => {}} />
                    <span className="font-body text-body text-default-font">
                      Date format is DDMMYY (day, month, year)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconButton size="small" icon="FeatherInfo" onClick={() => {}} />
                    <span className="font-body text-body text-default-font">
                      Serial numbers are always padded with leading zeros
                    </span>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start gap-2">
                  <span className="font-body-bold text-body-bold text-default-font">Sample Application Numbers</span>
                  <div className="flex w-full flex-col items-start gap-1">
                    <span className="font-body text-body text-default-font">FNB-001-HL-230624-00001</span>
                    <span className="font-body text-body text-default-font">FNB/001/PL/230624/00002</span>
                    <span className="font-body text-body text-default-font">FNB_AL_00003</span>
                    <span className="font-body text-body text-default-font">001.230624.00004</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Tip and Actions */}
          <div className="mt-6 flex w-full flex-col items-start gap-4">
            <div className="flex w-full items-start gap-2 rounded-md bg-brand-50 px-4 py-4">
              <IconButton size="small" icon="FeatherLightbulb" onClick={() => {}} />
              <span className="font-body text-body text-default-font">
                Creating a structured application number format helps in quick identification and categorization of
                applications. Consider what information is most important for your banks workflow.
              </span>
            </div>
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="neutral-secondary" onClick={handleReset} disabled={isLoading} type="button">
                Reset
              </Button>
              <Button onClick={() => {}} disabled={isLoading} type="submit">
                {isLoading ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default LoanNumberConfigForm;
