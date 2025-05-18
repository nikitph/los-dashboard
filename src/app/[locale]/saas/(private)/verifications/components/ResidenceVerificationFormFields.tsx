"use client";

import React from "react";
import { TextField } from "@/subframe/components/TextField";
import { TextArea } from "@/subframe/components/TextArea";
import { Badge } from "@/subframe/components/Badge";
import { IconButton } from "@/subframe/components/IconButton";
import { format } from "date-fns";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select } from "@/subframe/components/Select";
import { indianStates } from "@/lib/utils";
import {
  RESIDENCE_TYPES,
  STRUCTURE_TYPES,
  VerificationFormValues
} from "@/app/[locale]/saas/(private)/verifications/schemas/verificationSchema";
import EnhancedImageUploader from "@/app/[locale]/saas/(private)/verifications/components/EnhancedImageUploader";
import {
  VerificationFieldVisibility
} from "@/app/[locale]/saas/(private)/verifications/lib/defineVerificationFieldVisibility";
import { UseFormReturn } from "react-hook-form";

/**
 * Props for the ResidenceVerificationFormFields component
 */
interface ResidenceVerificationFormFieldsProps {
  /**
   * React Hook Form instance
   */
  form: UseFormReturn<VerificationFormValues>;

  /**
   * Field visibility settings based on user permissions
   */
  visibility: VerificationFieldVisibility;

  /**
   * Formatted date values for the date fields
   */
  formattedDate: {
    day: string;
    month: string;
    year: string;
  };

  /**
   * Current user information
   */
  user: any;

  /**
   * Translation function
   */
  t: (key: string) => string;

  loanApplicationId: string;
}

/**
 * Form fields for residence verification with field-level permission control
 *
 * @param {ResidenceVerificationFormFieldsProps} props - Component props
 * @returns {JSX.Element} The residence verification form fields
 */
const ResidenceVerificationFormFields: React.FC<ResidenceVerificationFormFieldsProps> = ({
  form,
  visibility,
  formattedDate,
  user,
  t,
  loanApplicationId,
}) => {
  // Destructure formatted date
  const { day, month, year } = formattedDate;

  // Get form values
  const verificationDate = form.watch("verification.verificationDate");
  const verificationTime = form.watch("verification.verificationTime");
  const verificationResult = form.watch("verification.result");

  // Handle date changes
  const handleDateChange = (part: "day" | "month" | "year", value: string) => {
    if (!/^\d*$/.test(value)) return;

    const currentDate = form.getValues("verification.verificationDate") || new Date();
    const newDate = new Date(currentDate);

    if (part === "day") {
      const day = parseInt(value || "1");
      newDate.setDate(day > 0 && day <= 31 ? day : 1);
    } else if (part === "month") {
      const month = parseInt(value || "1");
      newDate.setMonth((month > 0 && month <= 12 ? month : 1) - 1);
    } else if (part === "year") {
      const year = parseInt(value || new Date().getFullYear().toString());
      newDate.setFullYear(year > 1900 ? year : new Date().getFullYear());
    }

    form.setValue("verification.verificationDate", newDate, { shouldValidate: true });
  };

  // Helper function to check if address section should be shown
  const shouldShowAddressSection = () => {
    return (
      visibility.addressCity ||
      visibility.canUpdateAddressCity ||
      visibility.addressState ||
      visibility.canUpdateAddressState ||
      visibility.addressZipCode ||
      visibility.canUpdateAddressZipCode ||
      visibility.addressLine1 ||
      visibility.canUpdateAddressLine1
    );
  };

  // Helper function to check if owner information section should be shown
  const shouldShowOwnerSection = () => {
    return (
      visibility.ownerFirstName ||
      visibility.canUpdateOwnerFirstName ||
      visibility.ownerLastName ||
      visibility.canUpdateOwnerLastName
    );
  };

  return (
    <>
      {/* Verification Basic Information - Date, Time */}
      {(visibility.verificationDate ||
        visibility.canUpdateVerificationDate ||
        visibility.verificationTime ||
        visibility.canUpdateVerificationTime) && (
        <div className="flex w-full items-start gap-6">
          {/* Date Fields - Only show if user has read or update permission */}
          {(visibility.verificationDate || visibility.canUpdateVerificationDate) && (
            <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
              <span className="font-body-bold text-body-bold text-default-font">
                {t("form.fields.verificationDate.label")}
              </span>
              <div className="flex w-full items-center gap-2">
                {visibility.canUpdateVerificationDate ? (
                  <>
                    <TextField className="h-auto w-20 flex-none" label="" helpText="">
                      <TextField.Input
                        placeholder="DD"
                        value={day}
                        onChange={(e) => handleDateChange("day", e.target.value)}
                        maxLength={2}
                      />
                    </TextField>
                    <TextField className="h-auto w-20 flex-none" label="" helpText="">
                      <TextField.Input
                        placeholder="MM"
                        value={month}
                        onChange={(e) => handleDateChange("month", e.target.value)}
                        maxLength={2}
                      />
                    </TextField>
                    <TextField className="h-auto w-24 flex-none" label="" helpText="">
                      <TextField.Input
                        placeholder="YYYY"
                        value={year}
                        onChange={(e) => handleDateChange("year", e.target.value)}
                        maxLength={4}
                      />
                    </TextField>
                    <IconButton
                      size="small"
                      icon="FeatherCalendar"
                      onClick={() => {
                        form.setValue("verification.verificationDate", new Date(), { shouldValidate: true });
                      }}
                    />
                  </>
                ) : visibility.verificationDate ? (
                  <div className="text-gray-700">{verificationDate ? format(verificationDate, "dd/MM/yyyy") : "-"}</div>
                ) : null}
              </div>
            </div>
          )}

          {/* Time Field - Only show if user has read or update permission */}
          {(visibility.verificationTime || visibility.canUpdateVerificationTime) && (
            <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
              <FormField
                control={form.control}
                name="verification.verificationTime"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-body-bold text-body-bold text-default-font">
                      {t("form.fields.verificationTime.label")}
                    </FormLabel>
                    <FormControl>
                      {visibility.canUpdateVerificationTime ? (
                        <TextField className="h-auto w-full flex-none" label="" helpText="">
                          <TextField.Input placeholder={t("form.fields.verificationTime.placeholder")} {...field} />
                        </TextField>
                      ) : visibility.verificationTime ? (
                        <div className="text-gray-700">{field.value || "-"}</div>
                      ) : null}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* Address Fields - Only show if user has permission to see or update address fields */}
      {shouldShowAddressSection() && (
        <div className="flex w-full flex-col items-start gap-2">
          <span className="font-body-bold text-body-bold text-default-font">{t("form.sections.address")}</span>
          <div className="flex w-full items-start gap-4">
            {/* State Field */}
            {(visibility.addressState || visibility.canUpdateAddressState) && (
              <FormField
                control={form.control}
                name="residenceVerification.addressState"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {visibility.canUpdateAddressState ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          placeholder={
                            <div className={"text-gray-600"}>{t("form.fields.addressState.placeholder")}</div>
                          }
                          defaultValue="Madhya Pradesh"
                          className={"w-[200px] overflow-auto"}
                          variant={"outline"}
                        >
                          {indianStates.map((state) => (
                            <Select.Item key={state} value={state}>
                              {state}
                            </Select.Item>
                          ))}
                        </Select>
                      ) : visibility.addressState ? (
                        <div className="text-gray-700">{field.value || "-"}</div>
                      ) : null}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* City Field */}
            {(visibility.addressCity || visibility.canUpdateAddressCity) && (
              <FormField
                control={form.control}
                name="residenceVerification.addressCity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      {visibility.canUpdateAddressCity ? (
                        <TextField className="h-auto w-full flex-none" label="" helpText="">
                          <TextField.Input placeholder={t("form.fields.addressCity.placeholder")} {...field} />
                        </TextField>
                      ) : visibility.addressCity ? (
                        <div className="text-gray-700">{field.value || "-"}</div>
                      ) : null}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Zip Code Field */}
            {(visibility.addressZipCode || visibility.canUpdateAddressZipCode) && (
              <FormField
                control={form.control}
                name="residenceVerification.addressZipCode"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      {visibility.canUpdateAddressZipCode ? (
                        <TextField className="h-auto w-full flex-none" label="" helpText="">
                          <TextField.Input placeholder={t("form.fields.addressZipCode.placeholder")} {...field} />
                        </TextField>
                      ) : visibility.addressZipCode ? (
                        <div className="text-gray-700">{field.value || "-"}</div>
                      ) : null}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Address Line 1 Field */}
          {(visibility.addressLine1 || visibility.canUpdateAddressLine1) && (
            <FormField
              control={form.control}
              name="residenceVerification.addressLine1"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    {visibility.canUpdateAddressLine1 ? (
                      <TextField className="h-auto w-full flex-none" label="" helpText="">
                        <TextField.Input placeholder={t("form.fields.addressLine1.placeholder")} {...field} />
                      </TextField>
                    ) : visibility.addressLine1 ? (
                      <div className="text-gray-700">{field.value || "-"}</div>
                    ) : null}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}

      {/* Location from Main Road */}
      {(visibility.locationFromMain || visibility.canUpdateLocationFromMain) && (
        <FormField
          control={form.control}
          name="residenceVerification.locationFromMain"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="font-body-bold text-body-bold text-default-font">
                {t("form.fields.locationFromMain.label")}
              </FormLabel>
              <FormControl>
                {visibility.canUpdateLocationFromMain ? (
                  <TextField className="h-auto w-full flex-none" label="" helpText="">
                    <TextField.Input placeholder={t("form.fields.locationFromMain.placeholder")} {...field} />
                  </TextField>
                ) : visibility.locationFromMain ? (
                  <div className="text-gray-700">{field.value || "-"}</div>
                ) : null}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Owner Information */}
      {shouldShowOwnerSection() && (
        <div className="flex w-full flex-col items-start gap-4">
          <div className="flex w-full items-start gap-4">
            <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
              <span className="font-body-bold text-body-bold text-default-font">
                {t("view.fields.residence.owner")}
              </span>
              <div className="flex w-full items-center gap-4">
                {/* Owner First Name */}
                {(visibility.ownerFirstName || visibility.canUpdateOwnerFirstName) && (
                  <FormField
                    control={form.control}
                    name="residenceVerification.ownerFirstName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          {visibility.canUpdateOwnerFirstName ? (
                            <TextField className="h-auto w-full flex-none" label="" helpText="">
                              <TextField.Input
                                placeholder={t("form.fields.residence.ownerFirstName.placeholder")}
                                {...field}
                              />
                            </TextField>
                          ) : visibility.ownerFirstName ? (
                            <div className="text-gray-700">{field.value || "-"}</div>
                          ) : null}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Owner Last Name */}
                {(visibility.ownerLastName || visibility.canUpdateOwnerLastName) && (
                  <FormField
                    control={form.control}
                    name="residenceVerification.ownerLastName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          {visibility.canUpdateOwnerLastName ? (
                            <TextField className="h-auto w-full flex-none" label="" helpText="">
                              <TextField.Input
                                placeholder={t("form.fields.residence.ownerLastName.placeholder")}
                                {...field}
                              />
                            </TextField>
                          ) : visibility.ownerLastName ? (
                            <div className="text-gray-700">{field.value || "-"}</div>
                          ) : null}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Resident Information */}
          <div className="flex w-full items-start gap-4">
            {/* Resident Since */}
            {(visibility.residentSince || visibility.canUpdateResidentSince) && (
              <FormField
                control={form.control}
                name="residenceVerification.residentSince"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-body-bold text-body-bold text-default-font">
                      {t("form.fields.residence.residentSince.label")}
                    </FormLabel>
                    <FormControl>
                      {visibility.canUpdateResidentSince ? (
                        <TextField className="h-auto w-full flex-none" label="" helpText="">
                          <TextField.Input
                            placeholder={t("form.fields.residence.residentSince.placeholder")}
                            {...field}
                          />
                        </TextField>
                      ) : visibility.residentSince ? (
                        <div className="text-gray-700">{field.value || "-"}</div>
                      ) : null}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Residence Type */}
            {(visibility.residenceType || visibility.canUpdateResidenceType) && (
              <FormField
                control={form.control}
                name="residenceVerification.residenceType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-body-bold text-body-bold text-default-font">
                      {t("form.fields.residence.residenceType.label")}
                    </FormLabel>
                    <FormControl>
                      {visibility.canUpdateResidenceType ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          placeholder={
                            <div className="text-gray-600">{t("form.fields.residence.residenceType.placeholder")}</div>
                          }
                          className="w-full"
                          variant="outline"
                        >
                          {RESIDENCE_TYPES.map((type) => (
                            <Select.Item key={type} value={type}>
                              {t(`form.fields.residence.residenceType.options.${type.toLowerCase()}`)}
                            </Select.Item>
                          ))}
                        </Select>
                      ) : visibility.residenceType ? (
                        <div className="text-gray-700">
                          {field.value
                            ? t(`form.fields.residence.residenceType.options.${field.value.toLowerCase()}`)
                            : "-"}
                        </div>
                      ) : null}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Structure Type */}
          {(visibility.structureType || visibility.canUpdateStructureType) && (
            <div className="flex w-1/2 items-start gap-4 pe-2">
              <FormField
                control={form.control}
                name="residenceVerification.structureType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-body-bold text-body-bold text-default-font">
                      {t("form.fields.residence.structureType.label")}
                    </FormLabel>
                    <FormControl>
                      {visibility.canUpdateStructureType ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          placeholder={
                            <div className="text-gray-600">{t("form.fields.residence.structureType.placeholder")}</div>
                          }
                          className="w-full"
                          variant="outline"
                        >
                          {STRUCTURE_TYPES.map((type) => (
                            <Select.Item key={type} value={type}>
                              {t(`form.fields.residence.structureType.options.${type.toLowerCase()}`)}
                            </Select.Item>
                          ))}
                        </Select>
                      ) : visibility.structureType ? (
                        <div className="text-gray-700">
                          {field.value
                            ? t(`form.fields.residence.structureType.options.${field.value.toLowerCase()}`)
                            : "-"}
                        </div>
                      ) : null}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* Image Uploader - Only show if user has permission to upload documents */}
      {visibility.canUpdate && (
        <EnhancedImageUploader
          register={form.register}
          setValue={form.setValue}
          documentType={"PROPERTY_PHOTO"}
          watch={form.watch}
          errors={[]}
          loanApplicationId={loanApplicationId}
          fieldName="photographUrl"
          label="Photograph of property"
          currentUserId={user?.id}
        />
      )}

      {/* Remarks */}
      {(visibility.remarks || visibility.canUpdateRemarks) && (
        <FormField
          control={form.control}
          name="verification.remarks"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="font-body-bold text-body-bold text-default-font">
                {t("form.fields.remarks.label")}
              </FormLabel>
              <FormControl>
                {visibility.canUpdateRemarks ? (
                  <TextArea className="h-auto w-full flex-none" label="" helpText="">
                    <TextArea.Input placeholder={t("form.fields.remarks.placeholder")} {...field} />
                  </TextArea>
                ) : visibility.remarks ? (
                  <div className="min-h-[100px] rounded border p-2 text-gray-700">{field.value || "-"}</div>
                ) : null}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Result */}
      {(visibility.result || visibility.canUpdateResult) && (
        <FormField
          control={form.control}
          name="verification.result"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="font-body-bold text-body-bold text-default-font">
                {t("form.fields.result.label")}
              </FormLabel>
              <div className="flex w-full items-center gap-2">
                {visibility.canUpdateResult ? (
                  <>
                    <Select
                      value={field.value ? "positive" : "negative"}
                      onValueChange={(val) => field.onChange(val === "positive")}
                      icon="FeatherCheckCircle"
                    >
                      <Select.Item value="positive">{t("view.result.positive")}</Select.Item>
                      <Select.Item value="negative">{t("view.result.negative")}</Select.Item>
                    </Select>
                    <Badge variant={field.value ? "success" : "error"}>
                      {field.value ? "Verification successful" : "Verification failed"}
                    </Badge>
                  </>
                ) : visibility.result ? (
                  <Badge variant={field.value ? "success" : "error"}>
                    {field.value ? "Verification successful" : "Verification failed"}
                  </Badge>
                ) : null}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default ResidenceVerificationFormFields;
