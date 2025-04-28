"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { indianStates } from "@/lib/utils";
import { PersonalInformationFormProps } from "@/app/[locale]/saas/(private)/personal/schema";
import FileUploadButton from "@/components/FileUploadButton";
import { useUser } from "@/contexts/userContext";
import { usePersonalInformationForm } from "../hooks/usePersonalInformationForm";

export default function PersonalInformationForm({ initialData, loanApplication }: PersonalInformationFormProps) {
  const { user } = useUser();
  const t = useTranslations("Applicant");

  const { form, isSubmitting, aadharOtp, setAadharOtp, panOtp, setPanOtp, verifyDocument, onSubmit } =
    usePersonalInformationForm({
      initialData,
      loanApplicationId: loanApplication.id,
      applicantId: loanApplication.applicant.id,
    });

  console.log(form.formState.errors);

  // Extract form errors for the bottom alert
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <div className="flex h-full bg-gray-100">
      <div className="flex-1 p-8">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    {t("form.dateOfBirth.label")}
                  </FormLabel>
                  <div className="mt-1 flex w-[150px] space-x-2">
                    <FormControl>
                      <Input
                        type="date"
                        className="max-w-[200px] bg-white"
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().substring(0, 10) : ""}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Documents */}
            <div>
              <Label className="block text-sm font-medium text-gray-700">{t("form.uploadDocuments.label")}</Label>
              <div className="mt-2 space-y-4">
                {/* Aadhar */}
                <div>
                  <div className="flex space-x-2">
                    <FormField
                      control={form.control}
                      name="aadharNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder={t("form.aadharNumber.placeholder")}
                              className="max-w-[200px] bg-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col items-center space-x-2">
                      <FileUploadButton
                        documentType="AADHAAR_CARD"
                        entityType="applicant"
                        entityId={loanApplication.applicant.id}
                        //@ts-ignore
                        uploadedById={user?.id}
                        description={t("form.documents.aadhar.description")}
                        onUploadSuccess={(docId) => console.log(`Document uploaded with ID: ${docId}`)}
                        title={t("form.documents.aadhar.title")}
                      />

                      <p className="mt-1 text-sm text-gray-500">{t("form.fileSize.hint")}</p>
                    </div>
                    <Input
                      type="text"
                      placeholder={t("form.otp.placeholder")}
                      className="w-24 max-w-[200px] bg-white"
                      value={aadharOtp}
                      onChange={(e) => setAadharOtp(e.target.value)}
                    />
                    <Button
                      variant="default"
                      className="max-w-[200px]"
                      type="button"
                      onClick={() => verifyDocument("aadhar")}
                    >
                      {t("form.verify.button")}
                    </Button>
                    <FormField
                      control={form.control}
                      name="aadharVerificationStatus"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input
                              type="hidden"
                              value={field.value ? "true" : "false"}
                              onChange={(e) => field.onChange(e.target.value === "true")}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* PAN */}
                <div>
                  <div className="flex space-x-2">
                    <FormField
                      control={form.control}
                      name="panNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder={t("form.panNumber.placeholder")}
                              className="max-w-[200px] bg-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col items-center space-x-2">
                      <FileUploadButton
                        documentType="PAN_CARD"
                        entityType="applicant"
                        entityId={loanApplication.applicant.id}
                        //@ts-ignore
                        uploadedById={user?.id}
                        description={t("form.documents.pan.description")}
                        onUploadSuccess={(docId) => console.log(`Document uploaded with ID: ${docId}`)}
                        title={t("form.documents.pan.title")}
                      />
                      <p className="mt-1 text-sm text-gray-500">{t("form.fileSize.hint")}</p>
                    </div>
                    <Input
                      type="text"
                      placeholder={t("form.otp.placeholder")}
                      className="w-24 max-w-[200px] bg-white"
                      value={panOtp}
                      onChange={(e) => setPanOtp(e.target.value)}
                    />
                    <Button
                      variant="default"
                      className="max-w-[200px]"
                      type="button"
                      onClick={() => verifyDocument("pan")}
                    >
                      {t("form.verify.button")}
                    </Button>
                    <FormField
                      control={form.control}
                      name="panVerificationStatus"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input
                              type="hidden"
                              value={field.value ? "true" : "false"}
                              onChange={(e) => field.onChange(e.target.value === "true")}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <Label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700">
                {t("form.permanentAddress.label")}
              </Label>
              <div className="mt-1 grid max-w-[640px] grid-cols-3 gap-0">
                {/* States Dropdown */}
                <FormField
                  control={form.control}
                  name="addressState"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue="Madhya Pradesh">
                        <FormControl>
                          <SelectTrigger className="max-w-[200px] bg-white">
                            <SelectValue placeholder={t("form.addressState.placeholder")}>{field.value}</SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t("form.addressCity.placeholder")}
                          className="max-w-[200px] bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressPinCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t("form.addressPinCode.placeholder")}
                          className="max-w-[200px] bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-2">
                <FormField
                  control={form.control}
                  name="addressFull"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t("form.addressFull.placeholder")}
                          className="w-full max-w-[628px] bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="aadharVerificationStatus"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input
                      type="hidden"
                      value={field.value ? "true" : "false"}
                      onChange={(e) => field.onChange(e.target.value === "true")}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="panVerificationStatus"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input
                      type="hidden"
                      value={field.value ? "true" : "false"}
                      onChange={(e) => field.onChange(e.target.value === "true")}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="justify-left flex">
              <Button type="submit" className="max-w-[200px] px-6 py-3" disabled={isSubmitting}>
                {isSubmitting ? t("form.submit.loading") : t("form.submit.button")}
              </Button>
            </div>

            {hasErrors && (
              <Alert variant="destructive">
                <AlertDescription>{t("form.errors.correctBeforeSubmitting")}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
