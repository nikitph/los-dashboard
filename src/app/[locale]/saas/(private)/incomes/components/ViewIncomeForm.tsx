"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useViewIncomeForm } from "../hooks/useViewIncomeForm";
import { FormFields } from "./FormFields";
import { useForm } from "react-hook-form";
import { IncomeFormValues } from "../schemas/incomeSchema";

interface ViewIncomeFormProps {
  incomeId: string;
}

/**
 * Component for viewing an income record
 */
export function ViewIncomeForm({ incomeId }: ViewIncomeFormProps) {
  const t = useTranslations("Income");
  const {
    income,
    years,
    activeYear,
    setActiveYear,
    isLoading,
    isDeleting,
    calculateGrossCashIncome,
    handleDelete,
    handleEdit,
    canUpdate,
    canDelete,
  } = useViewIncomeForm(incomeId);

  // Create a form instance for the FormFields component
  const form = useForm<IncomeFormValues>({
    defaultValues: {
      id: income?.id || "",
      applicantId: income?.applicantId || "",
      type: income?.type || "",
      dependents: income?.dependents?.toString() || "0",
      averageMonthlyExpenditure: income?.averageMonthlyExpenditure?.toString() || "0",
      averageGrossCashIncome: income?.averageGrossCashIncome?.toString() || "0",
      incomeDetails:
        income?.incomeDetails?.map((detail: any) => ({
          id: detail.id,
          year: detail.year,
          taxableIncome: detail.taxableIncome?.toString() || null,
          taxPaid: detail.taxPaid?.toString() || null,
          grossIncome: detail.grossIncome?.toString() || null,
          rentalIncome: detail.rentalIncome?.toString() || null,
          incomeFromBusiness: detail.incomeFromBusiness?.toString() || null,
          depreciation: detail.depreciation?.toString() || null,
          grossCashIncome: detail.grossCashIncome?.toString() || null,
        })) || [],
    },
  });

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

  if (!income) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <h2 className="text-xl font-semibold">{t("notFound")}</h2>
        <p className="text-muted-foreground">{t("incomeNotFound")}</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          {t("goBack")}
        </Button>
      </div>
    );
  }

  // Format the applicant name if available
  const applicantName = income.applicant
    ? `${income.applicant.firstName} ${income.applicant.lastName}`
    : t("unknownApplicant");

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{t("viewTitle")}</h2>
        <p className="text-muted-foreground">
          {t("viewDescription")} - {applicantName}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium">{t("createdAt")}: </span>
          {new Date(income.createdAt).toLocaleDateString()}
        </div>
        <div className="flex space-x-2">
          {canDelete && (
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? t("deleting") : t("delete")}
            </Button>
          )}
          {canUpdate && (
            <Button type="button" variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              {t("edit")}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Form Fields in read-only mode */}
        <FormFields
          form={form}
          years={years}
          activeYear={activeYear}
          setActiveYear={setActiveYear}
          watchedType={income.type}
          watchedIncomeDetails={income.incomeDetails}
          calculateGrossCashIncome={calculateGrossCashIncome}
          readOnly={true}
        />

        {/* Average Gross Cash Income */}
        <Card>
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{t("averageGrossCashIncome")}</h4>
              <div className="text-2xl font-semibold text-primary">
                ₹{income.averageGrossCashIncome.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Documents Section */}
        {income.documents && income.documents.length > 0 && (
          <Card>
            <div className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">{t("supportingDocuments")}</h3>
              <ul className="space-y-2">
                {income.documents.map((doc: any) => (
                  <li key={doc.id} className="flex items-center justify-between rounded-md border p-2">
                    <span>{doc.filename}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        {t("view")}
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-start">
          <Button variant="outline" className="gap-2" type="button" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            {t("goBack")}
          </Button>
        </div>
      </div>
    </div>
  );
}
