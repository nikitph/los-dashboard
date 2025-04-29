"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Edit, Eye, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIncomeTable } from "../hooks/useIncomeTable";

interface IncomeTableProps {
  applicantId?: string;
  initialPage?: number;
  initialLimit?: number;
}

/**
 * Component for displaying a table of income records
 */
export function IncomeTable({ applicantId, initialPage = 1, initialLimit = 10 }: IncomeTableProps) {
  const t = useTranslations("Income");
  const {
    incomes,
    pagination,
    isLoading,
    isDeleting,
    handlePageChange,
    handleLimitChange,
    handleDelete,
    handleView,
    handleEdit,
    handleCreate,
    canCreate,
    canUpdate,
    canDelete,
  } = useIncomeTable({
    applicantId,
    page: initialPage,
    limit: initialLimit,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <div className="p-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("incomeRecords")}</h2>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t("createNew")}
          </Button>
        )}
      </div>

      <Card>
        <div className="p-0">
          {incomes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">{t("noRecords")}</p>
              {canCreate && (
                <Button onClick={handleCreate} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("createNew")}
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("applicant")}</TableHead>
                    <TableHead>{t("employmentType")}</TableHead>
                    <TableHead>{t("dependents")}</TableHead>
                    <TableHead>{t("monthlyExpenditure")}</TableHead>
                    <TableHead>{t("averageGrossCashIncome")}</TableHead>
                    <TableHead>{t("updatedAt")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>
                        {income.applicant
                          ? `${income.applicant.firstName} ${income.applicant.lastName}`
                          : t("unknownApplicant")}
                      </TableCell>
                      <TableCell>{income.type}</TableCell>
                      <TableCell>{income.dependents}</TableCell>
                      <TableCell>₹{income.averageMonthlyExpenditure.toLocaleString()}</TableCell>
                      <TableCell>₹{income.averageGrossCashIncome.toLocaleString()}</TableCell>
                      <TableCell>{new Date(income.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(income.id)} title={t("view")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canUpdate && (
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(income.id)} title={t("edit")}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(income.id)}
                              disabled={isDeleting}
                              title={t("delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-2">
                  <div className="text-sm text-muted-foreground">
                    {t("showing")} {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)} {t("of")} {pagination.total}{" "}
                    {t("records")}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      {pagination.page} / {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
