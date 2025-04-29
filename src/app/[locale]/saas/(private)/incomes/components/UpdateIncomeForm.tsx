"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { FormFields } from "./FormFields";
import { useUpdateIncomeForm } from "../hooks/useUpdateIncomeForm";

interface UpdateIncomeFormProps {
  incomeId: string;
}

/**
 * Form component for updating an existing income record
 */
export function UpdateIncomeForm({ incomeId }: UpdateIncomeFormProps) {
  const t = useTranslations("Income");
  const {
    form,
    years,
    activeYear,
    setActiveYear,
    isSubmitting,
    isLoading,
    documents,
    watchedType,
    watchedIncomeDetails,
    addYear,
    removeYear,
    calculateGrossCashIncome,
    calculateAverageGrossIncome,
    handleDocumentUpload,
    onSubmit,
  } = useUpdateIncomeForm(incomeId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-0.5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="flex justify-end space-x-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{t("updateTitle")}</h2>
        <p className="text-muted-foreground">{t("updateDescription")}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">{t("progress")}</div>
          <Progress value={66} className="h-2 w-32" />
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeYear(activeYear)}
            disabled={years.length <= 1}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("removeYear")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addYear}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addYear")}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Form Fields */}
        <FormFields
          form={form}
          years={years}
          activeYear={activeYear}
          setActiveYear={setActiveYear}
          watchedType={watchedType}
          watchedIncomeDetails={watchedIncomeDetails}
          calculateGrossCashIncome={calculateGrossCashIncome}
        />

        {/* Average Gross Cash Income */}
        <Card>
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{t("averageGrossCashIncome")}</h4>
              <div className="text-2xl font-semibold text-primary">
                ₹{parseFloat(calculateAverageGrossIncome()).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Document Upload */}
        <Card>
          <div className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">{t("supportingDocuments")}</h3>
            <div className="space-y-3">
              <Label htmlFor="document-upload">{t("uploadDocuments")}</Label>
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <input
                  type="file"
                  id="document-upload"
                  multiple
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                />
                <label htmlFor="document-upload" className="flex cursor-pointer flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <span className="text-sm font-medium">{t("clickToUpload")}</span>
                  <span className="text-xs text-gray-500">{t("fileTypes")}</span>
                </label>
              </div>

              {documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium">{t("uploadedDocuments")}:</h4>
                  <ul className="space-y-1 text-sm">
                    {documents.map((doc, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="rounded-md bg-primary/10 px-2 py-1 text-primary">{doc.name}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse justify-end gap-4 sm:flex-row">
          <Button variant="outline" className="gap-2" type="button" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            {t("cancel")}
          </Button>
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            {isSubmitting ? t("processing") : t("saveChanges")}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </form>
  );
}
