import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDownIcon, MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApplicantTable } from "../hooks/useApplicantTable";
import { ApplicantView } from "../schemas/applicantSchema";

type ApplicantTableProps = {
  initialData?: ApplicantView[];
};

/**
 * Table component for listing applicants
 */
export function ApplicantTable({ initialData = [] }: ApplicantTableProps) {
  const t = useTranslations("Applicant");
  const router = useRouter();

  const {
    table,
    data,
    isLoading,
    visibility,
    totalCount,
    globalFilter,
    setGlobalFilter,
    verificationFilter,
    setVerificationFilter,
    refreshData,
    loadData,
  } = useApplicantTable(initialData);

  // Load data on initial render
  useEffect(() => {
    if (initialData.length === 0) {
      refreshData();
    }
  }, [initialData.length, refreshData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <CardTitle>{t("list.title")}</CardTitle>
            <CardDescription>{t("list.description")}</CardDescription>
          </div>
          {visibility.canCreateDependent && (
            <Button onClick={() => router.push("/applicant/create")}>
              <PlusIcon className="mr-2 h-4 w-4" />
              {t("list.actions.createNew")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2 py-4 sm:flex-row">
          <div className="flex max-w-sm flex-1 items-center">
            <MagnifyingGlassIcon className="mr-2 h-4 w-4 opacity-50" />
            <Input
              placeholder={t("list.search.placeholder")}
              value={globalFilter || ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={verificationFilter || ""}
              onValueChange={(value) => setVerificationFilter(value || undefined)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("list.filters.verification.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("list.filters.verification.all")}</SelectItem>
                <SelectItem value="VERIFIED">{t("list.filters.verification.verified")}</SelectItem>
                <SelectItem value="PARTIALLY_VERIFIED">{t("list.filters.verification.partiallyVerified")}</SelectItem>
                <SelectItem value="UNVERIFIED">{t("list.filters.verification.unverified")}</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {t("list.columns.view")} <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {t(`list.columns.${column.id}`)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
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
                        <Button variant="ghost" onClick={() => header.column.toggleSorting()} className="font-medium">
                          {header.column.columnDef.header}
                        </Button>
                      ) : (
                        header.column.columnDef.header
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    {Array.from({ length: table.getAllColumns().length }).map((_, j) => (
                      <TableCell key={`cell-${i}-${j}`}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                // Table rows with data
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.column.columnDef.cell
                          ? cell.column.columnDef.cell({ row, cell, table })
                          : (cell.getValue() as React.ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // No data message
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    {t("list.noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {t("list.pagination.showing", {
              from:
                totalCount === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
              to: Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                totalCount,
              ),
              total: totalCount,
            })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {t("list.pagination.previous")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              {t("list.pagination.next")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
