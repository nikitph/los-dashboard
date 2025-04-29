"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Briefcase, Building } from "lucide-react";
import { defineIncomeFieldVisibility } from "../lib/defineIncomeFieldVisibility";
import { useAbility } from "@/lib/casl/abilityContext";

interface FormFieldsProps {
  form: any;
  years: number[];
  activeYear: number;
  setActiveYear: (year: number) => void;
  watchedType: string;
  watchedIncomeDetails: any[];
  calculateGrossCashIncome: (incomeDetail: any) => number;
  readOnly?: boolean;
}

/**
 * Reusable form fields component for Income forms
 */
export function FormFields({
  form,
  years,
  activeYear,
  setActiveYear,
  watchedType,
  watchedIncomeDetails,
  calculateGrossCashIncome,
  readOnly = false,
}: FormFieldsProps) {
  const t = useTranslations("Income");
  const ability = useAbility();
  const fieldVisibility = defineIncomeFieldVisibility(ability);

  // Get the active year's income detail
  const activeYearDetail = watchedIncomeDetails.find((detail) => detail.year === activeYear);

  return (
    <>
      {/* Employment Type Selection */}
      {fieldVisibility.type && (
        <Card>
          <div className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">{t("employmentType")}</h3>
            <div className="space-y-2">
              <Label htmlFor="employment-type">{t("selectEmploymentType")}</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                className="justify-start"
                value={watchedType}
                onValueChange={(value) => {
                  if (value && !readOnly) form.setValue("type", value);
                }}
                disabled={readOnly}
              >
                <ToggleGroupItem value="employed" aria-label="Employed" disabled={readOnly}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  {t("employed")}
                </ToggleGroupItem>
                <ToggleGroupItem value="self-employed" aria-label="Self Employed" disabled={readOnly}>
                  <Building className="mr-2 h-4 w-4" />
                  {t("selfEmployed")}
                </ToggleGroupItem>
              </ToggleGroup>
              {form.formState.errors.type && (
                <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Year Selection Tabs */}
      <Card>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">{t("incomeDetails")}</h3>
          <Tabs
            value={activeYear.toString()}
            onValueChange={(value) => setActiveYear(parseInt(value, 10))}
            className="w-full"
          >
            <TabsList className="mb-4 w-full justify-start overflow-x-auto">
              {years.map((year) => (
                <TabsTrigger key={year} value={year.toString()}>
                  {t("year")} {year}
                </TabsTrigger>
              ))}
            </TabsList>

            {activeYearDetail && (
              <div className="space-y-6">
                {/* Taxable Income */}
                {fieldVisibility.incomeDetails && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`taxableIncome-${activeYear}`}>{t("taxableIncome")}</Label>
                      <Input
                        id={`taxableIncome-${activeYear}`}
                        placeholder={t("enterAmount")}
                        className="pl-8"
                        disabled={readOnly}
                        {...form.register(
                          `incomeDetails.${watchedIncomeDetails.findIndex(
                            (detail) => detail.year === activeYear,
                          )}.taxableIncome`,
                        )}
                      />
                      {form.formState.errors.incomeDetails?.[
                        watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                      ]?.taxableIncome && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.incomeDetails[
                              watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                            ].taxableIncome.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`taxPaid-${activeYear}`}>{t("taxPaid")}</Label>
                      <Input
                        id={`taxPaid-${activeYear}`}
                        placeholder={t("enterAmount")}
                        className="pl-8"
                        disabled={readOnly}
                        {...form.register(
                          `incomeDetails.${watchedIncomeDetails.findIndex(
                            (detail) => detail.year === activeYear,
                          )}.taxPaid`,
                        )}
                      />
                      {form.formState.errors.incomeDetails?.[
                        watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                      ]?.taxPaid && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.incomeDetails[
                              watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                            ].taxPaid.message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Income Sources */}
                {fieldVisibility.incomeDetails && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`grossIncome-${activeYear}`}>{t("grossIncome")}</Label>
                      <Input
                        id={`grossIncome-${activeYear}`}
                        placeholder={t("enterAmount")}
                        className="pl-8"
                        disabled={readOnly}
                        {...form.register(
                          `incomeDetails.${watchedIncomeDetails.findIndex(
                            (detail) => detail.year === activeYear,
                          )}.grossIncome`,
                        )}
                      />
                      {form.formState.errors.incomeDetails?.[
                        watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                      ]?.grossIncome && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.incomeDetails[
                              watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                            ].grossIncome.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`rentalIncome-${activeYear}`}>{t("rentalIncome")}</Label>
                      <Input
                        id={`rentalIncome-${activeYear}`}
                        placeholder={t("enterAmount")}
                        className="pl-8"
                        disabled={readOnly}
                        {...form.register(
                          `incomeDetails.${watchedIncomeDetails.findIndex(
                            (detail) => detail.year === activeYear,
                          )}.rentalIncome`,
                        )}
                      />
                      {form.formState.errors.incomeDetails?.[
                        watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                      ]?.rentalIncome && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.incomeDetails[
                              watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                            ].rentalIncome.message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Business Income & Depreciation */}
                {fieldVisibility.incomeDetails && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`incomeFromBusiness-${activeYear}`}>{t("businessIncome")}</Label>
                      <Input
                        id={`incomeFromBusiness-${activeYear}`}
                        placeholder={t("enterAmount")}
                        className="pl-8"
                        disabled={readOnly}
                        {...form.register(
                          `incomeDetails.${watchedIncomeDetails.findIndex(
                            (detail) => detail.year === activeYear,
                          )}.incomeFromBusiness`,
                        )}
                      />
                      {form.formState.errors.incomeDetails?.[
                        watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                      ]?.incomeFromBusiness && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.incomeDetails[
                              watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                            ].incomeFromBusiness.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`depreciation-${activeYear}`}>{t("depreciation")}</Label>
                      <Input
                        id={`depreciation-${activeYear}`}
                        placeholder={t("enterAmount")}
                        className="pl-8"
                        disabled={readOnly}
                        {...form.register(
                          `incomeDetails.${watchedIncomeDetails.findIndex(
                            (detail) => detail.year === activeYear,
                          )}.depreciation`,
                        )}
                      />
                      {form.formState.errors.incomeDetails?.[
                        watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                      ]?.depreciation && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.incomeDetails[
                              watchedIncomeDetails.findIndex((detail) => detail.year === activeYear)
                            ].depreciation.message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Gross Cash Income Summary */}
                {fieldVisibility.incomeDetails && (
                  <div className="mt-6 flex items-center justify-between rounded-lg bg-primary/10 p-4">
                    <h4 className="font-medium">{t("grossCashIncome")}</h4>
                    <div className="text-xl font-semibold text-primary">
                      ₹{calculateGrossCashIncome(activeYearDetail).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Tabs>
        </div>
      </Card>

      {/* General Income Information */}
      <Card>
        <div className="space-y-6 p-6">
          <h3 className="text-lg font-semibold">{t("generalIncomeInfo")}</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {fieldVisibility.dependents && (
              <div className="space-y-2">
                <Label htmlFor="dependents">{t("dependents")}</Label>
                <Input
                  id="dependents"
                  placeholder={t("enterNumber")}
                  className="pl-8"
                  disabled={readOnly}
                  {...form.register("dependents")}
                />
                {form.formState.errors.dependents && (
                  <p className="text-sm text-red-500">{form.formState.errors.dependents.message}</p>
                )}
              </div>
            )}

            {fieldVisibility.averageMonthlyExpenditure && (
              <div className="space-y-2">
                <Label htmlFor="averageMonthlyExpenditure">{t("monthlyExpenditure")}</Label>
                <Input
                  id="averageMonthlyExpenditure"
                  placeholder={t("enterAmountOrPercentage")}
                  className="pl-8"
                  disabled={readOnly}
                  {...form.register("averageMonthlyExpenditure")}
                />
                {form.formState.errors.averageMonthlyExpenditure && (
                  <p className="text-sm text-red-500">{form.formState.errors.averageMonthlyExpenditure.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
