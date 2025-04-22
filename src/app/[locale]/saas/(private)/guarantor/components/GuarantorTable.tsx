import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, Edit, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { deleteGuarantor } from "../actions/deleteGuarantor";
import { useGuarantorTable } from "../hooks/useGuarantorTable";
import { GuarantorView } from "../schemas/guarantorSchema";

export interface GuarantorTableProps {
  /** Initial data for the table */
  initialData: any[];
  /** Loan application ID filter (optional) */
  loanApplicationId?: string;
  /** Whether to allow actions (edit, delete) */
  allowActions?: boolean;
  /** Callback when data changes (e.g., after delete) */
  onDataChange?: () => void;
}

/**
 * Table component for displaying guarantors
 *
 * @param {GuarantorTableProps} props - Component props
 * @returns {JSX.Element} Rendered table component
 */
export function GuarantorTable({
  initialData,
  loanApplicationId,
  allowActions = true,
  onDataChange,
}: GuarantorTableProps) {
  const t = useTranslations("Guarantor");
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  // Initialize table state using the hook
  const { table, searchQuery, setSearchQuery, visibility, isLoading, data } = useGuarantorTable({
    initialData,
    loanApplicationId,
  });

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  // Handle delete action
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteGuarantor({ id });

      if (response.success) {
        toast.success(t("toast.success"), {
          description: t("toast.deleted"),
        });

        // Refresh data
        if (onDataChange) {
          onDataChange();
        }
      } else {
        toast.error(t("toast.error"), {
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Error deleting guarantor:", error);
      toast.error(t("toast.error"), {
        description: t("toast.unexpectedError"),
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Render action buttons
  const renderActions = (guarantor: GuarantorView) => {
    if (!allowActions) return null;

    if (confirmDelete === guarantor.id) {
      return (
        <div className="flex items-center space-x-2">
          <Button variant="destructive" size="sm" onClick={() => handleDelete(guarantor.id)}>
            {t("list.confirmDelete")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancelDelete}>
            {t("list.cancel")}
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{t("list.actions")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {visibility.canUpdate && (
            <DropdownMenuItem asChild>
              <Link href={`/guarantor/${guarantor.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                {t("list.edit")}
              </Link>
            </DropdownMenuItem>
          )}
          {visibility.canDelete && (
            <DropdownMenuItem
              onClick={() => handleDeleteClick(guarantor.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("list.delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("list.title")}</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("list.search")}
              className="w-64 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {visibility.canCreate && (
            <Button asChild>
              <Link
                href={
                  loanApplicationId ? `/guarantor/create?loanApplicationId=${loanApplicationId}` : "/guarantor/create"
                }
              >
                {t("list.createNew")}
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "flex items-center gap-1 cursor-pointer select-none"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <ChevronDown className="h-4 w-4" />}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.column.id === "actions"
                          ? renderActions(row.original as GuarantorView)
                          : flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    {isLoading ? t("list.loading") : t("list.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {t("list.pageInfo", {
              page: table.getState().pagination.pageIndex + 1,
              total: table.getPageCount() || 1,
            })}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
