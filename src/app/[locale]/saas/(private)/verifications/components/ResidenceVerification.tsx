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

  return (
    <div className="flex w-full flex-col items-start gap-6 bg-default-background px-6 py-6">
      <div className="flex w-full items-center gap-2">
        <IconButton size="small" icon="FeatherArrowLeft" onClick={handleBack} />
        <span className="font-heading-2 text-heading-2 text-default-font">{t("form.sections.residence")}</span>
      </div>

      {/* Wrap the form with Form component from shadcn/ui */}
      <Form {...form} namespace={"Verification"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full items-start gap-6">
            {/* Date Fields - Custom implementation since date is split into multiple inputs */}
            <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
              <span className="font-body-bold text-body-bold text-default-font">
                {t("form.fields.verificationDate.label")}
              </span>
              <div className="flex w-full items-center gap-2">
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
              </div>
            </div>

            {/* Time Field */}
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
                      <TextField className="h-auto w-full flex-none" label="" helpText="">
                        <TextField.Input placeholder={t("form.fields.verificationTime.placeholder")} {...field} />
                      </TextField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="flex w-full flex-col items-start gap-2">
            <span className="font-body-bold text-body-bold text-default-font">{t("form.sections.address")}</span>
            <div className="flex w-full items-start gap-4">
              <FormField
                control={form.control}
                name="residenceVerification.addressState"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      placeholder={<div className={"text-gray-600"}>{t("form.fields.addressState.placeholder")}</div>}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residenceVerification.addressCity"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <TextField className="h-auto w-full flex-none" label="" helpText="">
                        <TextField.Input placeholder={t("form.fields.addressCity.placeholder")} {...field} />
                      </TextField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residenceVerification.addressZipCode"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <TextField className="h-auto w-full flex-none" label="" helpText="">
                        <TextField.Input placeholder={t("form.fields.addressZipCode.placeholder")} {...field} />
                      </TextField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="residenceVerification.addressLine1"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <TextField className="h-auto w-full flex-none" label="" helpText="">
                      <TextField.Input placeholder={t("form.fields.addressLine1.placeholder")} {...field} />
                    </TextField>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Location from Main Road */}
          <FormField
            control={form.control}
            name="residenceVerification.locationFromMain"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-body-bold text-body-bold text-default-font">
                  {t("form.fields.locationFromMain.label")}
                </FormLabel>
                <FormControl>
                  <TextField className="h-auto w-full flex-none" label="" helpText="">
                    <TextField.Input placeholder={t("form.fields.locationFromMain.placeholder")} {...field} />
                  </TextField>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Owner Information */}
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full items-start gap-4">
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
                <span className="font-body-bold text-body-bold text-default-font">
                  {t("view.fields.residence.owner")}
                </span>
                <div className="flex w-full items-center gap-4">
                  <FormField
                    control={form.control}
                    name="residenceVerification.ownerFirstName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <TextField className="h-auto w-full flex-none" label="" helpText="">
                            <TextField.Input
                              placeholder={t("form.fields.residence.ownerFirstName.placeholder")}
                              {...field}
                            />
                          </TextField>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="residenceVerification.ownerLastName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <TextField className="h-auto w-full flex-none" label="" helpText="">
                            <TextField.Input
                              placeholder={t("form.fields.residence.ownerLastName.placeholder")}
                              {...field}
                            />
                          </TextField>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Resident Information */}
            <div className="flex w-full items-start gap-4">
              <FormField
                control={form.control}
                name="residenceVerification.residentSince"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-body-bold text-body-bold text-default-font">
                      {t("form.fields.residence.residentSince.label")}
                    </FormLabel>
                    <FormControl>
                      <TextField className="h-auto w-full flex-none" label="" helpText="">
                        <TextField.Input
                          placeholder={t("form.fields.residence.residentSince.placeholder")}
                          {...field}
                        />
                      </TextField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residenceVerification.residenceType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-body-bold text-body-bold text-default-font">
                      {t("form.fields.residence.residenceType.label")}
                    </FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Structure and Photo */}
            <div className="flex w-1/2 items-start gap-4 pe-2">
              <FormField
                control={form.control}
                name="residenceVerification.structureType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-body-bold text-body-bold text-default-font">
                      {t("form.fields.residence.structureType.label")}
                    </FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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

          {/* Remarks */}
          <FormField
            control={form.control}
            name="verification.remarks"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-body-bold text-body-bold text-default-font">
                  {t("form.fields.remarks.label")}
                </FormLabel>
                <FormControl>
                  <TextArea className="h-auto w-full flex-none" label="" helpText="">
                    <TextArea.Input placeholder={t("form.fields.remarks.placeholder")} {...field} />
                  </TextArea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Result */}
          <FormField
            control={form.control}
            name="verification.result"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-body-bold text-body-bold text-default-font">
                  {t("form.fields.result.label")}
                </FormLabel>
                <div className="flex w-full items-center gap-2">
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
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex w-full items-center gap-2">
            <Button type="button" variant="neutral-secondary" onClick={handleBack} disabled={isSubmitting}>
              {t("form.actions.back")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("form.actions.creating") : "Proceed to Business Verification"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ResidenceVerification;
