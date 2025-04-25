import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";
import { CoApplicantFieldVisibility } from "../lib/defineCoApplicantFieldVisibility";

/**
 * FormFields component props
 */
interface FormFieldsProps {
  control: Control<any>;
  visibility: CoApplicantFieldVisibility;
  disabled?: boolean;
}

/**
 * Reusable form fields component for CoApplicant forms
 *
 * @param {FormFieldsProps} props - Component properties including form control and field visibility
 * @returns {JSX.Element} Form fields for CoApplicant data
 */
export function FormFields({ control, visibility, disabled = false }: FormFieldsProps) {
  const t = useTranslations("CoApplicant");

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t("form.sections.basic")}</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* First Name */}
          {visibility.firstName && (
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.firstName")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={disabled || !visibility.canUpdateFirstName}
                      placeholder={t("form.firstName.placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Last Name */}
          {visibility.lastName && (
            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.lastName")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={disabled || !visibility.canUpdateLastName}
                      placeholder={t("form.lastName.placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Email */}
          {visibility.email && (
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.email")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      disabled={disabled || !visibility.canUpdateEmail}
                      placeholder={t("form.email.placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Mobile Number */}
          {visibility.mobileNumber && (
            <FormField
              control={control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.mobileNumber")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={disabled || !visibility.canUpdateMobileNumber}
                      placeholder={t("form.mobileNumber.placeholder")}
                    />
                  </FormControl>
                  <FormDescription>{t("form.mobileNumber.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {/* Address Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t("form.sections.address")}</h3>
        <div className="grid grid-cols-1 gap-4">
          {/* Address Line 1 */}
          {visibility.addressLine1 && (
            <FormField
              control={control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.addressLine1")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={disabled || !visibility.canUpdateAddressLine1}
                      placeholder={t("form.addressLine1.placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Address Line 2 */}
          {visibility.addressLine2 && (
            <FormField
              control={control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.addressLine2")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={disabled || !visibility.canUpdateAddressLine2}
                      placeholder={t("form.addressLine2.placeholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* City */}
            {visibility.addressCity && (
              <FormField
                control={control}
                name="addressCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.addressCity")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={disabled || !visibility.canUpdateAddressCity}
                        placeholder={t("form.addressCity.placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* State */}
            {visibility.addressState && (
              <FormField
                control={control}
                name="addressState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.addressState")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={disabled || !visibility.canUpdateAddressState}
                        placeholder={t("form.addressState.placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* ZIP Code */}
            {visibility.addressZipCode && (
              <FormField
                control={control}
                name="addressZipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.addressZipCode")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={disabled || !visibility.canUpdateAddressZipCode}
                        placeholder={t("form.addressZipCode.placeholder")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* Hidden Loan Application ID */}
      <FormField
        control={control}
        name="loanApplicationId"
        render={({ field }) => <input type="hidden" {...field} />}
      />
    </div>
  );
}
