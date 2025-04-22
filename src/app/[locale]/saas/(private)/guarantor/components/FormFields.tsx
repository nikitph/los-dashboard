import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility";

/**
 * Props for the GuarantorFormFields component
 */
interface FormFieldsProps {
  /**
   * React Hook Form control for form handling
   */
  control: Control<any>;

  /**
   * Field visibility settings based on user permissions
   */
  visibility: GuarantorFieldVisibility;

  /**
   * Whether the form is in read-only mode
   */
  readOnly?: boolean;
}

/**
 * Reusable component for rendering guarantor form fields
 * Conditionally displays fields based on user permissions via visibility map
 *
 * @param {FormFieldsProps} props - Component props
 * @returns {JSX.Element} Form fields component
 */
export function FormFields({ control, visibility, readOnly = false }: FormFieldsProps): React.ReactNode {
  const t = useTranslations("guarantor");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* First Name */}
        {visibility.firstName && (
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.firstName.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.firstName.placeholder")}
                    {...field}
                    disabled={readOnly || !visibility.canUpdateFirstName}
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
                <FormLabel>{t("form.lastName.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.lastName.placeholder")}
                    {...field}
                    disabled={readOnly || !visibility.canUpdateLastName}
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
                <FormLabel>{t("form.email.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("form.email.placeholder")}
                    {...field}
                    disabled={readOnly || !visibility.canUpdateEmail}
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
                <FormLabel>{t("form.mobileNumber.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder={t("form.mobileNumber.placeholder")}
                    {...field}
                    disabled={readOnly || !visibility.canUpdateMobileNumber}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-4 text-lg font-medium">{t("form.address.heading")}</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Address Line 1 */}
          {visibility.addressLine1 && (
            <FormField
              control={control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{t("form.addressLine1.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.addressLine1.placeholder")}
                      {...field}
                      disabled={readOnly || !visibility.canUpdateAddressLine1}
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
                <FormItem className="col-span-2">
                  <FormLabel>{t("form.addressLine2.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.addressLine2.placeholder")}
                      {...field}
                      disabled={readOnly || !visibility.canUpdateAddressLine2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* City */}
          {visibility.addressCity && (
            <FormField
              control={control}
              name="addressCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.addressCity.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.addressCity.placeholder")}
                      {...field}
                      disabled={readOnly || !visibility.canUpdateAddressCity}
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
                  <FormLabel>{t("form.addressState.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.addressState.placeholder")}
                      {...field}
                      disabled={readOnly || !visibility.canUpdateAddressState}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Zip Code */}
          {visibility.addressZipCode && (
            <FormField
              control={control}
              name="addressZipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.addressZipCode.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.addressZipCode.placeholder")}
                      {...field}
                      disabled={readOnly || !visibility.canUpdateAddressZipCode}
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
  );
}
