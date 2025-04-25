import { useCallback, useMemo, useState } from "react";
import { useAbility } from "@/lib/casl/abilityContext";
import { defineApplicantFieldVisibility } from "../lib/defineApplicantFieldVisibility";
import { ApplicantView } from "../schemas/applicantSchema";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import { getVerificationStatusColor } from "../lib/helpers";
import { formatDate } from "@/lib/displayUtils";
import { ApplicantFilters, getApplicants } from "../actions/getApplicants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

/**
 * Custom hook for managing the applicant table state, filtering, sorting, and pagination
 *
 * @param initialData - Optional initial data for the table
 * @returns Table state and controls for the applicant list view
 */
export function useApplicantTable(initialData: ApplicantView[] = []) {
  // Get translations for table headers and filters
  const t = useTranslations("Applicant");
  const router = useRouter();

  // Get user ability and calculate field visibility
  const ability = useAbility();
  const visibility = useMemo(() => defineApplicantFieldVisibility(ability), [ability]);

  // Table state
  const [data, setData] = useState<ApplicantView[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [verificationFilter, setVerificationFilter] = useState<string | undefined>();
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Generate columns based on field visibility
  const columns = useMemo<ColumnDef<ApplicantView>[]>(() => {
    const cols: ColumnDef<ApplicantView>[] = [];

    if (visibility.dateOfBirth) {
      cols.push({
        id: "dateOfBirth",
        accessorKey: "dateOfBirth",
        header: t("list.columns.dateOfBirth"),
        cell: ({ row }) => {
          const date = row.original.dateOfBirth;
          return <div>{date ? formatDate(date) : "-"}</div>;
        },
        enableSorting: true,
        enableHiding: true,
      });
    }

    if (visibility.fullAddress) {
      cols.push({
        id: "address",
        accessorKey: "fullAddress",
        header: t("list.columns.address"),
        cell: ({ row }) => {
          return <div className="max-w-md truncate">{row.original.fullAddress || "-"}</div>;
        },
        enableSorting: false, // Address sorting less useful
        enableHiding: true,
      });
    }

    if (visibility.aadharVerificationStatus || visibility.panVerificationStatus) {
      cols.push({
        id: "verificationStatus",
        accessorKey: "verificationStatus",
        header: t("list.columns.verificationStatus"),
        cell: ({ row }) => {
          const status = row.original.verificationStatus;
          const badgeClass = getVerificationStatusColor(status);
          const label = status ? t(`list.verificationStatus.${status.toLowerCase()}`) : "-";
          return status ? <Badge className={badgeClass}>{label}</Badge> : <span>-</span>;
        },
        enableSorting: true,
        enableHiding: true,
      });
    }

    if (visibility.createdAt) {
      cols.push({
        id: "createdAt",
        accessorKey: "createdAt",
        header: t("list.columns.createdAt"),
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return <div>{formatDate(date)}</div>;
        },
        enableSorting: true,
        enableHiding: true,
      });
    }

    // Actions column is always present if user can perform any actions
    if (visibility.canUpdateDateOfBirth || visibility.canDelete) {
      cols.push({
        id: "actions",
        header: t("list.columns.actions"),
        cell: ({ row }) => {
          const id = row.original.id;
          return (
            <div className="flex gap-2">
              {visibility.canUpdateDateOfBirth && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/applicant/${id}/edit`)}>
                  {t("list.actions.edit")}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => router.push(`/applicant/${id}/view`)}>
                {t("list.actions.view")}
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      });
    }

    return cols;
  }, [visibility, t, router]);

  // Load data function
  const loadData = useCallback(async (filters: ApplicantFilters) => {
    setIsLoading(true);
    try {
      const response = await getApplicants({
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 10,
        sortBy: filters.sortBy || "createdAt",
        sortOrder: filters.sortOrder || "desc",
        verificationStatus: filters.verificationStatus as any,
      });

      if (response.success && response.data) {
        setData(response.data);
        setTotalCount(response.meta?.total || 0);
      }
    } catch (error) {
      console.error("Error loading applicants:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Convert table state to API filters
  const generateFilters = useCallback(() => {
    const sortingField = sorting.length > 0 ? sorting[0].id : "createdAt";
    const sortingOrder = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

    return {
      search: globalFilter,
      verificationStatus: verificationFilter as any,
      page: pagination.pageIndex + 1, // API uses 1-based indexing
      limit: pagination.pageSize,
      sortBy: sortingField,
      sortOrder: sortingOrder,
    };
  }, [sorting, globalFilter, verificationFilter, pagination]);

  // Refresh data when filters change
  const refreshData = useCallback(() => {
    const filters = generateFilters();
    loadData(filters);
  }, [generateFilters, loadData]);

  // Initialize table with React Table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, // We handle pagination manually via API
    manualSorting: true, // We handle sorting manually via API
    manualFiltering: true, // We handle filtering manually via API
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  });

  return {
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
    generateFilters,
  };
}
