import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import { deleteCoApplicant } from "../actions/deleteCoApplicant";
import { useCoApplicantTable } from "../hooks/useCoApplicantTable";
import { CoApplicantView } from "../schemas/coApplicantSchema";

/**
 * CoApplicantTable component props
 */
interface CoApplicantTableProps {
  data: CoApplicantView[];
  totalCount: number;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  currentPage?: number;
  pageSize?: number;
  loanApplicationId?: string;
  onDeleted?: () => void;
}

/**
 * Table component for displaying a list of CoApplicants
 *
 * @param {CoApplicantTableProps} props - Component properties
 * @returns {JSX.Element} Table for listing CoApplicants
 */
export function CoApplicantTable({
  data,
  totalCount,
  onPageChange,
  onSearchChange,
  currentPage = 1,
  pageSize = 10,
  loanApplicationId,
  onDeleted,
}: CoApplicantTableProps) {
  const t = useTranslations("CoApplicant");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { table, filters, visibility, pagination } = useCoApplicantTable({
    data,
    totalCount,
    onPageChange,
    onSearchChange,
    currentPage,
    pageSize,
    loanApplicationId,
  });

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounce the onSearchChange call
    const handler = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(value);
      } else {
        filters.setGlobalFilter(value);
      }
    }, 300);

    return () => clearTimeout(handler);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      const result = await deleteCoApplicant(id);

      if (result.success) {
        toast.success(t("toast.deleted"));
        if (onDeleted) {
          onDeleted();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting co-applicant:", error);
      toast.error(t("errors.unexpected"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder={t("list.search.placeholder")}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Settings className="mr-1 h-4 w-4" />
                {t("list.columns.title")}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("list.columns.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "fullName"
                      ? t("list.columns.fullName")
                      : column.id === "email"
                        ? t("list.columns.email")
                        : column.id === "mobileNumber"
                          ? t("list.columns.mobileNumber")
                          : column.id === "location"
                            ? t("list.columns.location")
                            : column.id === "createdAt"
                              ? t("list.columns.createdAt")
                              : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add new co-applicant button */}
          {visibility.canCreate && loanApplicationId && (
            <Link href={`/saas/coApplicant/create?loanApplicationId=${loanApplicationId}`} passHref>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                {t("list.add")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex cursor-pointer select-none items-center"
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.id === "actions" ? (
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">{t("list.actions")}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("list.actions")}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/saas/coApplicant/${cell.getValue() as string}/view`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("list.actions.view")}
                                </Link>
                              </DropdownMenuItem>
                              {visibility.canUpdate && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/saas/coApplicant/${cell.getValue() as string}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t("list.actions.edit")}
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {visibility.canDelete && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(cell.getValue() as string)}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("list.actions.delete")}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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

      {/* Custom Pagination */}
      {pagination.totalCount > 0 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination.currentPage > 1) {
                pagination.onPageChange(pagination.currentPage - 1);
              }
            }}
            disabled={pagination.currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, Math.ceil(pagination.totalCount / pagination.pageSize)) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => pagination.onPageChange(page)}
                  className="h-8 w-8"
                >
                  {page}
                </Button>
              );
            })}

            {Math.ceil(pagination.totalCount / pagination.pageSize) > 5 && <span>...</span>}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination.currentPage < Math.ceil(pagination.totalCount / pagination.pageSize)) {
                pagination.onPageChange(pagination.currentPage + 1);
              }
            }}
            disabled={pagination.currentPage >= Math.ceil(pagination.totalCount / pagination.pageSize)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
