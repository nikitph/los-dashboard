import { useAbility } from "@/lib/casl/abilityContext";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { defineCoApplicantFieldVisibility } from "../lib/defineCoApplicantFieldVisibility";
import { formatFullName, formatMobileNumber } from "../lib/helpers";
import { CoApplicantView } from "../schemas/coApplicantSchema";

/**
 * Interface for table column definition with visibility control
 */
export type CoApplicantColumn = ColumnDef<CoApplicantView> & {
  accessorKey: keyof CoApplicantView | string;
  id: string;
  header: string;
  canHide?: boolean;
  cell?: any;
};

/**
 * Options for the useCoApplicantTable hook
 */
interface UseCoApplicantTableOptions {
  data: CoApplicantView[];
  totalCount: number;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  currentPage?: number;
  pageSize?: number;
  loanApplicationId?: string;
}

/**
 * Custom hook for managing CoApplicant table state and operations
 *
 * @param {UseCoApplicantTableOptions} options - Options for configuring the table
 * @returns {object} Table configuration, state, and handlers
 */
export function useCoApplicantTable({
  data,
  totalCount,
  onPageChange,
  onSearchChange,
  currentPage = 1,
  pageSize = 10,
  loanApplicationId,
}: UseCoApplicantTableOptions) {
  const t = useTranslations("CoApplicant");
  const ability = useAbility();
  const visibility = useMemo(() => defineCoApplicantFieldVisibility(ability), [ability]);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Define table columns
  const columns = useMemo<CoApplicantColumn[]>(() => {
    const cols: CoApplicantColumn[] = [];

    if (visibility.firstName && visibility.lastName) {
      cols.push({
        accessorKey: "fullName",
        id: "fullName",
        header: t("list.columns.fullName"),
        canHide: true,
        cell: ({ row }) => {
          const firstName = row.original.firstName;
          const lastName = row.original.lastName;
          return formatFullName(firstName, lastName);
        },
      });
    }

    if (visibility.email) {
      cols.push({
        accessorKey: "email",
        id: "email",
        header: t("list.columns.email"),
        canHide: true,
      });
    }

    if (visibility.mobileNumber) {
      cols.push({
        accessorKey: "mobileNumber",
        id: "mobileNumber",
        header: t("list.columns.mobileNumber"),
        canHide: true,
        cell: ({ row }) => formatMobileNumber(row.original.mobileNumber),
      });
    }

    if (visibility.addressCity && visibility.addressState) {
      cols.push({
        accessorKey: "location",
        id: "location",
        header: t("list.columns.location"),
        canHide: true,
        cell: ({ row }) => `${row.original.addressCity}, ${row.original.addressState}`,
      });
    }

    if (visibility.createdAt) {
      cols.push({
        accessorKey: "createdAt",
        id: "createdAt",
        header: t("list.columns.createdAt"),
        canHide: true,
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return new Date(date).toLocaleDateString();
        },
      });
    }

    // Actions column
    if (visibility.canUpdate || visibility.canDelete) {
      cols.push({
        accessorKey: "actions",
        id: "actions",
        header: t("list.columns.actions"),
        canHide: false,
        cell: ({ row }) => row.original.id,
      });
    }

    return cols;
  }, [visibility, t]);

  // Handle search
  const handleSearchChange = useCallback(
    (search: string) => {
      setGlobalFilter(search);
      if (onSearchChange) {
        onSearchChange(search);
      }
    },
    [onSearchChange],
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      if (onPageChange) {
        onPageChange(page);
      }
    },
    [onPageChange],
  );

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    pageCount: Math.ceil(totalCount / pageSize),
    manualPagination: Boolean(onPageChange),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return {
    table,
    columns,
    visibility,
    filters: {
      globalFilter,
      columnFilters,
      setGlobalFilter: handleSearchChange,
      setColumnFilters,
    },
    pagination: {
      currentPage,
      pageSize,
      totalCount,
      onPageChange: handlePageChange,
    },
  };
}
