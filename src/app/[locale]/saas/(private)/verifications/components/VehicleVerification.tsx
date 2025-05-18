"use client";

import React, { useState } from "react";
import { IconButton } from "@/subframe/components/IconButton";
import { TextField } from "@/subframe/components/TextField";
import { Button } from "@/subframe/components/Button";
import { TextArea } from "@/subframe/components/TextArea";
import { useLocale, useTranslations } from "next-intl";
import { useCreateVerificationForm } from "@/app/[locale]/saas/(private)/verifications/hooks/useCreateVerificationForm";
import { VerificationType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select } from "@/subframe/components/Select";
import { useUser } from "@/contexts/userContext";
import { Badge } from "@/subframe/components/Badge";
import DocumentsUpload from "./DocumentsUpload";
// Constants for vehicle types
const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Commercial", "Two Wheeler", "Truck"];

// Document types for vehicle verification
const DOCUMENT_TYPES = [
  { label: "Tax Invoice", id: "taxInvoice" },
  { label: "Delivery Chaalan", id: "deliveryChaalan" },
  { label: "Stamped Receipt", id: "stampedReceipt" },
  { label: "RC", id: "rc" },
  { label: "Inspection Report", id: "inspectionReport" },
  { label: "Vehicle Photo", id: "vehiclePhoto" },
];

interface CreateVerificationFormProps {
  loanApplicationId: string;
  defaultType?: string;
}

/**
 * A form component for creating vehicle verifications with field-level permission control
 *
 * @param {CreateVerificationFormProps} props - Component props
 * @returns {JSX.Element} The vehicle verification form
 */
function VehicleVerification({ loanApplicationId, defaultType = "VEHICLE" }: CreateVerificationFormProps) {
  const t = useTranslations("Verification");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useUser();
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, boolean>>({});

  // Use the custom hook for form state management
  const { form, visibility, isSubmitting, onSubmit, selectedType, formattedDate } = useCreateVerificationForm({
    loanApplicationId,
    defaultType: defaultType as VerificationType,
  });

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

  // Handle document selection
  const handleDocumentSelection = (documentId: string) => {
    if (uploadedDocuments[documentId]) {
      // Document already uploaded - can't select again
      return;
    }
    setSelectedDocument(documentId === selectedDocument ? null : documentId);
  };

  // Handle document upload completion
  const handleDocumentUploaded = (documentId: string) => {
    setUploadedDocuments((prev) => ({
      ...prev,
      [documentId]: true,
    }));
    setSelectedDocument(null);
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
        <span className="font-heading-2 text-heading-2 text-default-font">{t("form.sections.vehicle")}</span>
      </div>

      {/* Wrap the form with Form component from shadcn/ui */}
      <Form {...form} namespace={"Verification"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col items-start gap-6">
          {/* Verification Basic Information - Date, Time */}
          {(visibility.verificationDate ||
            visibility.canUpdateVerificationDate ||
            visibility.verificationTime ||
            visibility.canUpdateVerificationTime) && (
            <div className="flex w-full flex-wrap items-start gap-4">
              {/* Date Fields - Only show if user has read or update permission */}
              {(visibility.verificationDate || visibility.canUpdateVerificationDate) && (
                <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
                  <span className="font-body-bold text-body-bold text-default-font">
                    {t("form.fields.verificationDate.label")}
                  </span>
                  <div className="flex items-center gap-2">
                    {visibility.canUpdateVerificationDate ? (
                      <>
                        <TextField label="" helpText="">
                          <TextField.Input
                            placeholder="DD"
                            value={formattedDate.day}
                            onChange={(e) => handleDateChange("day", e.target.value)}
                            maxLength={2}
                          />
                        </TextField>
                        <TextField label="" helpText="">
                          <TextField.Input
                            placeholder="MM"
                            value={formattedDate.month}
                            onChange={(e) => handleDateChange("month", e.target.value)}
                            maxLength={2}
                          />
                        </TextField>
                        <TextField label="" helpText="">
                          <TextField.Input
                            placeholder="YYYY"
                            value={formattedDate.year}
                            onChange={(e) => handleDateChange("year", e.target.value)}
                            maxLength={4}
                          />
                        </TextField>
                        <IconButton
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

          {/* Vehicle Information */}
          <div className="flex w-full flex-wrap items-start gap-4">
            {/* Engine Number */}
            {(visibility.engineNumber || visibility.canUpdateEngineNumber) && (
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
                <FormField
                  control={form.control}
                  name="vehicleVerification.engineNumber"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-body-bold text-body-bold text-default-font">
                        {t("form.fields.vehicle.engineNumber.label")}
                      </FormLabel>
                      <FormControl>
                        {visibility.canUpdateEngineNumber ? (
                          <TextField className="h-auto w-full flex-none" label="" helpText="">
                            <TextField.Input
                              placeholder={t("form.fields.vehicle.engineNumber.placeholder")}
                              {...field}
                            />
                          </TextField>
                        ) : visibility.engineNumber ? (
                          <div className="text-gray-700">{field.value || "-"}</div>
                        ) : null}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Chassis Number */}
            {(visibility.chassisNumber || visibility.canUpdateChassisNumber) && (
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
                <FormField
                  control={form.control}
                  name="vehicleVerification.chassisNumber"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-body-bold text-body-bold text-default-font">
                        {t("form.fields.vehicle.chassisNumber.label")}
                      </FormLabel>
                      <FormControl>
                        {visibility.canUpdateChassisNumber ? (
                          <TextField className="h-auto w-full flex-none" label="" helpText="">
                            <TextField.Input
                              placeholder={t("form.fields.vehicle.chassisNumber.placeholder")}
                              {...field}
                            />
                          </TextField>
                        ) : visibility.chassisNumber ? (
                          <div className="text-gray-700">{field.value || "-"}</div>
                        ) : null}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Registration Number */}
            {(visibility.registrationNumber || visibility.canUpdateRegistrationNumber) && (
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
                <FormField
                  control={form.control}
                  name="vehicleVerification.registrationNumber"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-body-bold text-body-bold text-default-font">
                        {t("form.fields.vehicle.registrationNumber.label")}
                      </FormLabel>
                      <FormControl>
                        {visibility.canUpdateRegistrationNumber ? (
                          <TextField className="h-auto w-full flex-none" label="" helpText="">
                            <TextField.Input
                              placeholder={t("form.fields.vehicle.registrationNumber.placeholder")}
                              {...field}
                            />
                          </TextField>
                        ) : visibility.registrationNumber ? (
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

          {/* Vehicle Details */}
          <div className="flex w-full flex-wrap items-start gap-4">
            {/* Make */}
            {(visibility.make || visibility.canUpdateMake) && (
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
                <FormField
                  control={form.control}
                  name="vehicleVerification.make"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-body-bold text-body-bold text-default-font">
                        {t("form.fields.vehicle.make.label")}
                      </FormLabel>
                      <FormControl>
                        {visibility.canUpdateMake ? (
                          <TextField className="h-auto w-full flex-none" label="" helpText="">
                            <TextField.Input placeholder={t("form.fields.vehicle.make.placeholder")} {...field} />
                          </TextField>
                        ) : visibility.make ? (
                          <div className="text-gray-700">{field.value || "-"}</div>
                        ) : null}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Model */}
            {(visibility.model || visibility.canUpdateModel) && (
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
                <FormField
                  control={form.control}
                  name="vehicleVerification.model"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-body-bold text-body-bold text-default-font">
                        {t("form.fields.vehicle.model.label")}
                      </FormLabel>
                      <FormControl>
                        {visibility.canUpdateModel ? (
                          <TextField className="h-auto w-full flex-none" label="" helpText="">
                            <TextField.Input placeholder={t("form.fields.vehicle.model.placeholder")} {...field} />
                          </TextField>
                        ) : visibility.model ? (
                          <div className="text-gray-700">{field.value || "-"}</div>
                        ) : null}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Vehicle Type */}
            {(visibility.vehicleType || visibility.canUpdateVehicleType) && (
              <div className="flex shrink-0 grow basis-0 flex-col items-start gap-2">
                <FormField
                  control={form.control}
                  name="vehicleVerification.vehicleType"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-body-bold text-body-bold text-default-font">
                        {t("form.fields.vehicle.vehicleType.label")}
                      </FormLabel>
                      <FormControl>
                        {visibility.canUpdateVehicleType ? (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            placeholder={
                              <div className="text-gray-600">{t("form.fields.vehicle.vehicleType.placeholder")}</div>
                            }
                            className="w-full"
                            variant="outline"
                          >
                            {VEHICLE_TYPES.map((type) => (
                              <Select.Item key={type} value={type}>
                                {type}
                              </Select.Item>
                            ))}
                          </Select>
                        ) : visibility.vehicleType ? (
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

          {/* Documents Upload Section */}
          <DocumentsUpload entityType="loanApplication" entityId={loanApplicationId} />

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
          <div className="flex w-full items-center justify-between">
            <Button type="button" variant="neutral-tertiary" onClick={handleBack} disabled={isSubmitting}>
              {t("form.actions.back")}
            </Button>
            {visibility.canUpdate && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("form.actions.creating") : "Proceed to Complete Verification"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export default VehicleVerification;
