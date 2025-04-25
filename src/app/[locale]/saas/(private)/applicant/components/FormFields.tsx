import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { ApplicantFieldVisibility } from "../lib/defineApplicantFieldVisibility";
import { CreateApplicantInput, UpdateApplicantInput } from "../schemas/applicantSchema";

type FormType = CreateApplicantInput | UpdateApplicantInput;
type FormFieldsProps = {
  form: UseFormReturn<FormType>;
  visibility: ApplicantFieldVisibility;
  readOnly?: boolean;
  isEditMode?: boolean;
};

/**
 * Reusable form fields component for applicant forms
 * Renders form fields based on field visibility
 */
export function FormFields({ form, visibility, readOnly = false, isEditMode = false }: FormFieldsProps) {
  const t = useTranslations("Applicant");

  // Helper function to check if a field should be disabled
  const isFieldDisabled = (fieldName: string, canUpdateField: boolean) => {
    return readOnly || (isEditMode && !canUpdateField);
  };

  return (
    <div className="space-y-6">
      {/* User ID */}
      {visibility.userId && (
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.userId.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.userId.placeholder")}
                  {...field}
                  value={field.value || ""}
                  disabled={isFieldDisabled("userId", false)} // Always read-only in edit mode
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Bank ID */}
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
                  value={field.value || ""}
                  disabled={isFieldDisabled("bankId", false)} // Always read-only in edit mode
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Date of Birth */}
      {visibility.dateOfBirth && (
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("form.dateOfBirth.label")}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      disabled={isFieldDisabled("dateOfBirth", visibility.canUpdateDateOfBirth)}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>{t("form.dateOfBirth.placeholder")}</span>
                      )}
                      {/* <Calendar className="ml-auto h-4 w-4 opacity-50" /> */}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date: any) => field.onChange(date)}
                    disabled={(date: any) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Address State */}
      {visibility.addressState && (
        <FormField
          control={form.control}
          name="addressState"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.addressState.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.addressState.placeholder")}
                  {...field}
                  value={field.value || ""}
                  disabled={isFieldDisabled("addressState", visibility.canUpdateAddressState)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Address City */}
      {visibility.addressCity && (
        <FormField
          control={form.control}
          name="addressCity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.addressCity.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.addressCity.placeholder")}
                  {...field}
                  value={field.value || ""}
                  disabled={isFieldDisabled("addressCity", visibility.canUpdateAddressCity)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Address Full */}
      {visibility.addressFull && (
        <FormField
          control={form.control}
          name="addressFull"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.addressFull.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.addressFull.placeholder")}
                  {...field}
                  value={field.value || ""}
                  disabled={isFieldDisabled("addressFull", visibility.canUpdateAddressFull)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Address PinCode */}
      {visibility.addressPinCode && (
        <FormField
          control={form.control}
          name="addressPinCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.addressPinCode.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.addressPinCode.placeholder")}
                  {...field}
                  value={field.value || ""}
                  disabled={isFieldDisabled("addressPinCode", visibility.canUpdateAddressPinCode)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Aadhar Number */}
      {visibility.aadharNumber && (
        <FormField
          control={form.control}
          name="aadharNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.aadharNumber.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.aadharNumber.placeholder")}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow only numeric input
                    if (val === "" || /^\d*$/.test(val)) {
                      field.onChange(val);
                    }
                  }}
                  maxLength={12}
                  disabled={isFieldDisabled("aadharNumber", visibility.canUpdateAadharNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* PAN Number */}
      {visibility.panNumber && (
        <FormField
          control={form.control}
          name="panNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.panNumber.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.panNumber.placeholder")}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    field.onChange(val);
                  }}
                  maxLength={10}
                  disabled={isFieldDisabled("panNumber", visibility.canUpdatePanNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Aadhar Verification Status */}
      {visibility.aadharVerificationStatus && (
        <FormField
          control={form.control}
          name="aadharVerificationStatus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isFieldDisabled("aadharVerificationStatus", visibility.canUpdateAadharVerificationStatus)}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("form.aadharVerificationStatus.label")}</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* PAN Verification Status */}
      {visibility.panVerificationStatus && (
        <FormField
          control={form.control}
          name="panVerificationStatus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isFieldDisabled("panVerificationStatus", visibility.canUpdatePanVerificationStatus)}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("form.panVerificationStatus.label")}</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Photo URL */}
      {visibility.photoUrl && (
        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.photoUrl.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("form.photoUrl.placeholder")}
                  {...field}
                  value={field.value || ""}
                  disabled={isFieldDisabled("photoUrl", visibility.canUpdatePhotoUrl)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
