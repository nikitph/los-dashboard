import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { GuarantorFieldVisibility } from "../../lib/defineGuarantorFieldVisibility";

// Common type for the form field names
export type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2?: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  loanApplicationId: string;
  id?: string;
};

interface FormFieldsProps {
  form: UseFormReturn<FormValues>;
  visibility: GuarantorFieldVisibility;
  isEditMode: boolean;
}

/**
 * Form fields component for Guarantor form
 * Renders fields conditionally based on user permissions
 *
 * @param {FormFieldsProps} props - Component props
 * @returns {JSX.Element} Rendered form fields
 */
export function FormFields({ form, visibility, isEditMode }: FormFieldsProps) {
  const t = useTranslations("Guarantor");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* First Name */}
        {visibility.firstName && (
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.firstName.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.firstName.placeholder")}
                    {...field}
                    disabled={isEditMode && !visibility.canUpdateFirstName}
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
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.lastName.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.lastName.placeholder")}
                    {...field}
                    disabled={isEditMode && !visibility.canUpdateLastName}
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
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.email.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("form.email.placeholder")}
                    {...field}
                    disabled={isEditMode && !visibility.canUpdateEmail}
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
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.mobileNumber.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.mobileNumber.placeholder")}
                    {...field}
                    disabled={isEditMode && !visibility.canUpdateMobileNumber}
                  />
                </FormControl>
                <FormDescription>{t("form.mobileNumber.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Address Line 1 */}
        {visibility.addressLine1 && (
          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>{t("form.addressLine1.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.addressLine1.placeholder")}
                    {...field}
                    disabled={isEditMode && !visibility.canUpdateAddressLine1}
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
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>{t("form.addressLine2.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.addressLine2.placeholder")}
                    {...field}
                    disabled={isEditMode && !visibility.canUpdateAddressLine2}
                  />
                </FormControl>
                <FormDescription>{t("form.addressLine2.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* City */}
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
                    disabled={isEditMode && !visibility.canUpdateAddressCity}
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
            control={form.control}
            name="addressState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.addressState.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.addressState.placeholder")}
                    {...field}
                    disabled={isEditMode && !visibility.canUpdateAddressState}
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
            control={form.control}
            name="addressZipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.addressZipCode.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.addressZipCode.placeholder")}
                    {...field}
                    disabled={isEditMode && !visibility.canUpdateAddressZipCode}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
