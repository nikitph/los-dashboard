"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  CreditCard,
  Download,
  Edit2,
  Eye,
  MoreHorizontal,
  PlusCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash,
} from "lucide-react";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deleteLoanApplication } from "../actions/deleteLoanApplication";
import { getLoanApplications } from "../actions/getLoanApplications";
import { formatCurrency, formatLoanStatus, formatLoanType, getStatusBadgeColor } from "../lib/helpers";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";

export default function LoanApplicationListPage() {
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("LoanApplication");

  const [loanApplications, setLoanApplications] = React.useState<LoanApplicationView[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [loanTypeFilter, setLoanTypeFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");

  // Table state
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch loan applications
  const fetchLoanApplications = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getLoanApplications({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: searchTerm,
        status: statusFilter,
        loanType: loanTypeFilter,
      });

      if (response.success && response.data) {
        setLoanApplications(response.data.items);
        setTotalCount(response.data.total);
      } else {
        toast({
          title: t("toast.error"),
          description: response.message || t("toast.errorDescription"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching loan applications:", error);
      toast({
        title: t("toast.error"),
        description: t("toast.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLoanApplications();
  }, []);

  // Reset filters
  const handleReset = () => {
    setSearchTerm("");
    setLoanTypeFilter("");
    setStatusFilter("");
    setColumnFilters([]);
    setSorting([]);
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
  };

  const handleCreateLoanApplication = () => {
    router.push(`/${locale}/saas/loanapplication/create`);
  };

  const handleViewLoanApplication = (id: string) => {
    router.push(`/${locale}/saas/loanapplication/${id}/view`);
  };

  const handleEditLoanApplication = (id: string) => {
    router.push(`/${locale}/saas/loanapplication/${id}/edit`);
  };

  const handleDeleteLoanApplication = async (id: string) => {
    try {
      const response = await deleteLoanApplication(id);

      if (response.success) {
        toast({
          title: t("toast.deleted"),
          description: t("toast.deletedDescription"),
        });
        fetchLoanApplications();
      } else {
        toast({
          title: t("toast.error"),
          description: response.message || t("errors.notFound"),
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
  };

  const handleExportSelected = () => {
    const selectedApplications = table.getSelectedRowModel().rows.map((row) => row.original);
    console.log("Exporting selected applications:", selectedApplications);
    // Implement your export logic here
  };

  const handleDeleteSelected = async () => {
    const selectedApplications = table.getSelectedRowModel().rows.map((row) => row.original);

    try {
      // Delete each selected application
      for (const application of selectedApplications) {
        await deleteLoanApplication(application.id);
      }

      toast({
        title: t("toast.deleted"),
        description: `${selectedApplications.length} ${t("toast.deletedDescription")}`,
      });

      // Refresh the list
      fetchLoanApplications();

      // Clear selection
      setRowSelection({});
    } catch (error) {
      console.error("Error deleting loan applications:", error);
      toast({
        title: t("toast.error"),
        description: t("toast.errorDescription"),
        variant: "destructive",
      });
    }
  };

  // Apply global filters manually to handle combined filters
  const globalFilterFn: FilterFn<LoanApplicationView> = (row, columnId, value) => {
    // For search term
    const searchMatch =
      searchTerm === "" ||
      (row.original.applicantName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.original.id.toLowerCase().includes(searchTerm.toLowerCase());

    // For loan type filter
    const loanTypeMatch = loanTypeFilter === "" || row.original.loanType === loanTypeFilter;

    // For status filter
    const statusMatch = statusFilter === "" || row.original.status === statusFilter;

    return searchMatch && loanTypeMatch && statusMatch;
  };

  // Table columns definition
  const columns: ColumnDef<LoanApplicationView>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: t("list.columns.id"),
      cell: ({ row }) => <div className="max-w-[100px] truncate">{row.getValue("id")}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "applicantName",
      header: t("list.columns.applicant"),
      cell: ({ row }) => <div>{row.getValue("applicantName") || "-"}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "loanType",
      header: t("list.columns.loanType"),
      cell: ({ row }) => <div>{formatLoanType(row.getValue("loanType"))}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "amountRequested",
      header: t("list.columns.amount"),
      cell: ({ row }) => <div>{row.original.formattedAmount || formatCurrency(row.getValue("amountRequested"))}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: t("list.columns.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const badgeColor = row.original.statusBadgeColor || getStatusBadgeColor(status);
        return (
          <div className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${badgeColor}`}>
            {formatLoanStatus(status)}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "createdAt",
      header: t("list.columns.createdAt"),
      cell: ({ row }) => (
        <div>{row.original.formattedCreatedAt || new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("list.columns.actions")}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("list.actions.label")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewLoanApplication(row.original.id)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("list.actions.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditLoanApplication(row.original.id)}>
                <Edit2 className="mr-2 h-4 w-4" />
                {t("list.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteLoanApplication(row.original.id)}>
                <Trash className="mr-2 h-4 w-4" />
                {t("list.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: loanApplications,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    onPaginationChange: setPagination,
    manualPagination: true,
    globalFilterFn,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Calculate stats from the data
  const pendingCount = loanApplications.filter((app) => app.status === "PENDING").length;
  const approvedCount = loanApplications.filter((app) => app.status === "APPROVED").length;
  const rejectedCount = loanApplications.filter((app) => app.status === "REJECTED").length;

  return (
    <div className="w-full flex-col gap-8 px-6 py-6">
      {/* Header row: Title + Add Loan Application */}
      <div className="mb-6 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="text-brand-600 h-6 w-6" />
          <h1 className="text-2xl font-semibold">{t("list.title")}</h1>
        </div>
        <Button onClick={handleCreateLoanApplication}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("list.addNew")}
        </Button>
      </div>

      {/* Stats row */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="h-full">
          <CardContent className="flex h-full items-center gap-4 px-6 py-6">
            <span className="text-2xl font-bold text-blue-700">{pendingCount}</span>
            <span className="text-sm font-medium text-blue-700">{t("filter.status.pending")}</span>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardContent className="flex h-full items-center gap-4 px-6 py-6">
            <span className="text-2xl font-bold text-green-700">{approvedCount}</span>
            <span className="text-sm font-medium text-green-700">{t("filter.status.approved")}</span>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardContent className="flex h-full items-center gap-4 px-6 py-6">
            <span className="text-2xl font-bold text-red-700">{rejectedCount}</span>
            <span className="text-sm font-medium text-red-700">{t("filter.status.rejected")}</span>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        {/* Table toolbar */}
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t("list.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Loan Type filter */}
            <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filter.loanType.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("filter.loanType.all")}</SelectItem>
                  <SelectItem value="PERSONAL">{t("filter.loanType.personal")}</SelectItem>
                  <SelectItem value="VEHICLE">{t("filter.loanType.vehicle")}</SelectItem>
                  <SelectItem value="HOUSE_CONSTRUCTION">{t("filter.loanType.houseConstruction")}</SelectItem>
                  <SelectItem value="PLOT_PURCHASE">{t("filter.loanType.plotPurchase")}</SelectItem>
                  <SelectItem value="MORTGAGE">{t("filter.loanType.mortgage")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filter.status.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">{t("filter.status.all")}</SelectItem>
                  <SelectItem value="PENDING">{t("filter.status.pending")}</SelectItem>
                  <SelectItem value="UNDER_REVIEW">{t("filter.status.underReview")}</SelectItem>
                  <SelectItem value="APPROVED">{t("filter.status.approved")}</SelectItem>
                  <SelectItem value="REJECTED">{t("filter.status.rejected")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Reset button */}
            <Button variant="outline" onClick={handleReset} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("filter.reset")}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {table.getSelectedRowModel().rows.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportSelected}>
                  <Download className="mr-2 h-4 w-4" />
                  {t("list.exportSelected")}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="mr-2 h-4 w-4" />
                      {t("list.deleteSelected")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("confirm.deleteMultiple.title")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("confirm.deleteMultiple.description", { count: table.getSelectedRowModel().rows.length })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("confirm.cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected}>{t("confirm.continue")}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {t("list.column")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("list.toggleColumns")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id === "applicantName"
                        ? t("list.columns.applicantName")
                        : column.id === "amountRequested"
                          ? t("list.columns.amountRequested")
                          : t(`list.columns.${column.id}`)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main table */}
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? "flex cursor-pointer select-none items-center" : ""}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronDown className="ml-1 h-4 w-4 rotate-180" />,
                            desc: <ChevronDown className="ml-1 h-4 w-4" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-6 text-center">
                    {t("list.loading")}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-6 text-center">
                    {t("list.empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of {totalCount} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">{t("list.pagination.rowsPerPage")}</p>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              {t("list.pagination.pageInfo", {
                page: pagination.pageIndex + 1,
                total: Math.max(1, Math.ceil(totalCount / pagination.pageSize)),
              })}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {"<<"}
              </Button>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {">>"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
