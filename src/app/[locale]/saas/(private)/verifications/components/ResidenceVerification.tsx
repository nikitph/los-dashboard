"use client";

import React from "react";
import { IconButton } from "@/subframe/components/IconButton";
import { TextField } from "@/subframe/components/TextField";
import { Button } from "@/subframe/components/Button";
import { TextArea } from "@/subframe/components/TextArea";
import { Badge } from "@/subframe/components/Badge";
import { useTranslations } from "next-intl";
import { useCreateVerificationForm } from "@/app/[locale]/saas/(private)/verifications/hooks/useCreateVerificationForm";
import { VerificationType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select } from "@/subframe/components/Select";
import { indianStates } from "@/lib/utils";
import {
  RESIDENCE_TYPES,
  STRUCTURE_TYPES
} from "@/app/[locale]/saas/(private)/verifications/schemas/verificationSchema";
import { useUser } from "@/contexts/userContext";
import EnhancedImageUploader from "@/app/[locale]/saas/(private)/verifications/components/EnhancedImageUploader";

interface CreateVerificationFormProps {
  loanApplicationId: string;
  defaultType?: string;
}

/**
 * A form component for creating residence verifications with field-level permission control
 *
 * @param {CreateVerificationFormProps} props - Component props
 * @returns {JSX.Element} The residence verification form
 */
function ResidenceVerification({ loanApplicationId, defaultType = "RESIDENCE" }: CreateVerificationFormProps) {
  const t = useTranslations("Verification");
  const router = useRouter();
  const { user } = useUser();

  // Use the custom hook for form state management
  const { form, visibility, isSubmitting, onSubmit, selectedType } = useCreateVerificationForm({
    loanApplicationId,
    defaultType: defaultType as VerificationType,
  });

  // Format the verificationDate for display in the date fields
  const verificationDate = form.watch("verification.verificationDate");
  const day = verificationDate ? format(verificationDate, "dd") : "";
  const month = verificationDate ? format(verificationDate, "MM") : "";
  const year = verificationDate ? format(verificationDate, "yyyy") : "";

  // Get form values
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

  // Handle back button
  const handleBack = () => {
    router.back();
  };

  // Only render the form if the user has permission to create verifications
  if (!visibility.canCreate) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 p-8">
        <div className="text-xl font-semibold text-red-600">{t("permissions.noCreateAccess")}</div>
        <Button onClick={handleBack}>{t("form.actions.back")}</Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-6 bg-default-background px-6 py-6">
      <div className="flex w-full items-center gap-2">
        <IconButton size="small" icon="FeatherArrowLeft" onClick={handleBack} />
        <span className="font-heading-2 text-heading-2 text-default-font">{t("form.sections.residence")}</span>
      </div>

      {/* Wrap the form with Form component from shadcn/ui */}
      <Form {...form} namespace={"Verification"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col items-start gap-6">
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
                      <div className="text-gray-700">
                        {verificationDate ? format(verificationDate, "dd/MM/yyyy") : "-"}
                      </div>
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
          {(visibility.addressCity ||
            visibility.canUpdateAddressCity ||
            visibility.addressState ||
            visibility.canUpdateAddressState ||
            visibility.addressZipCode ||
            visibility.canUpdateAddressZipCode ||
            visibility.addressLine1 ||
            visibility.canUpdateAddressLine1) && (
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
          {(visibility.ownerFirstName ||
            visibility.canUpdateOwnerFirstName ||
            visibility.ownerLastName ||
            visibility.canUpdateOwnerLastName) && (
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
                                <div className="text-gray-600">
                                  {t("form.fields.residence.residenceType.placeholder")}
                                </div>
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
                                <div className="text-gray-600">
                                  {t("form.fields.residence.structureType.placeholder")}
                                </div>
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
              watch={form.watch}
              errors={[]}
              verificationId={"d54055d2-66d2-4fad-b28a-256eab56dd54"}
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

          {/* Action Buttons */}
          <div className="flex w-full items-center gap-2">
            <Button type="button" variant="neutral-secondary" onClick={handleBack} disabled={isSubmitting}>
              {t("form.actions.back")}
            </Button>
            {visibility.canUpdate && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("form.actions.creating") : "Proceed to Business Verification"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ResidenceVerification;
