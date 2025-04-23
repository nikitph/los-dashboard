"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { deleteLoanApplication } from "../actions/deleteLoanApplication";
import { useLoanApplicationTable } from "../hooks/useLoanApplicationTable";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";

interface LoanApplicationTableProps {
  initialData: {
    items: LoanApplicationView[];
    total: number;
  };
}

export function LoanApplicationTable({ initialData }: LoanApplicationTableProps) {
  const t = useTranslations("LoanApplication");
  const { toast } = useToast();
  const { table, visibility, filters, loadData, columnVisibility, setColumnVisibility } =
    useLoanApplicationTable(initialData);

  const params = useParams();
  const locale = params.locale as string;

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [
    filters.search,
    filters.status,
    filters.loanType,
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    table.getState().sorting,
  ]);

  // Delete handler
  const handleDelete = async (id: string) => {
    if (confirm(t("confirm.delete"))) {
      try {
        const response = await deleteLoanApplication(id);

        if (response.success) {
          toast({
            title: t("toast.deleted"),
            description: t("toast.deletedDescription"),
          });

          loadData();
        } else {
          toast({
            title: t("toast.error"),
            description: response.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting loan application:", error);
        toast({
          title: t("toast.error"),
          description: t("toast.errorDescription"),
          variant: "destructive",
        });
      }
    }
  };

  // View handler
  const handleView = (id: string) => {
    window.location.href = `/${locale}/saas/loanapplication/${id}/view`;
  };

  // Edit handler
  const handleEdit = (id: string) => {
    window.location.href = `/${locale}/saas/loanapplication/${id}/edit`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="flex flex-1 gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("list.search")}
              value={filters.search}
              onChange={(e) => filters.setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Loan Type Filter */}
          <Select value={filters.loanType} onValueChange={filters.setLoanType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filter.loanType.all")} />
            </SelectTrigger>
            <SelectContent>
              {filters.loanTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={filters.setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("filter.status.all")} />
            </SelectTrigger>
            <SelectContent>
              {filters.statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              {t("list.columns")} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("list.columns")}</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuItem
                  key={column.id}
                  className="capitalize"
                  onClick={() => {
                    column.toggleVisibility(!column.getIsVisible());
                  }}
                >
                  <input type="checkbox" checked={column.getIsVisible()} onChange={() => {}} className="mr-2" />
                  {t(`list.columns.${column.id.toLowerCase()}`)}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Create button */}
        {visibility.canCreate && (
          <Button onClick={() => (window.location.href = `/${locale}/saas/loanapplication/create`)}>
            {t("list.addNew")}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex cursor-pointer items-center"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.id === "actions" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{t("list.actions.menu")}</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("list.actions.label")}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(row.original.id)}>
                              {t("list.actions.view")}
                            </DropdownMenuItem>
                            {visibility.canUpdate && (
                              <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
                                {t("list.actions.edit")}
                              </DropdownMenuItem>
                            )}
                            {visibility.canDelete && (
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>
                                {t("list.actions.delete")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  {t("list.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          {t("list.pagination.previous")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          {t("list.pagination.next")}
        </Button>
      </div>
    </div>
  );
}
