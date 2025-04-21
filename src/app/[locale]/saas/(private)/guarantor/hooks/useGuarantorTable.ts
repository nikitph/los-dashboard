import { useAbility } from "@/lib/casl/abilityContext";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { defineGuarantorFieldVisibility } from "../lib/defineGuarantorFieldVisibility";
import { formatFullName, transformToGuarantorView } from "../lib/helpers";
import { GuarantorView } from "../schemas/guarantorSchema";

/**
 * Props for the useGuarantorTable hook
 */
export interface UseGuarantorTableProps {
  /** Initial data array for the table */
  initialData: any[];
  /** Loan application ID filter (optional) */
  loanApplicationId?: string;
}

/**
 * Return type for the useGuarantorTable hook
 */
export interface UseGuarantorTableReturn {
  /** Table instance from useReactTable */
  table: ReturnType<typeof useReactTable<GuarantorView>>;
  /** The search query state */
  searchQuery: string;
  /** Function to update the search query */
  setSearchQuery: (query: string) => void;
  /** Field visibility map based on user permissions */
  visibility: ReturnType<typeof defineGuarantorFieldVisibility>;
  /** Flag indicating if data is loading */
  isLoading: boolean;
  /** Transformed data with derived fields */
  data: GuarantorView[];
}

/**
 * Custom hook to manage guarantor table state, filtering, and pagination
 *
 * @param {UseGuarantorTableProps} props - Hook configuration
 * @returns {UseGuarantorTableReturn} Table state and handlers
 */
export function useGuarantorTable({ initialData, loanApplicationId }: UseGuarantorTableProps): UseGuarantorTableReturn {
  const ability = useAbility();
  const visibility = useMemo(() => defineGuarantorFieldVisibility(ability), [ability]);
  const t = useTranslations("guarantor");

  // Transform the raw data to include computed fields
  const data = useMemo(() => {
    return initialData.map(transformToGuarantorView);
  }, [initialData]);

  // Filter data by loan application ID if provided
  const filteredByLoanAppData = useMemo(() => {
    if (!loanApplicationId) return data;
    return data.filter((item) => item.loanApplicationId === loanApplicationId);
  }, [data, loanApplicationId]);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isLoading, setIsLoading] = useState(false);

  // Define table columns based on visibility
  const columns = useMemo<ColumnDef<GuarantorView>[]>(
    () => [
      // Only include columns the user has permission to see
      ...(visibility.firstName
        ? [
            {
              accessorKey: "firstName",
              header: t("list.columns.firstName"),
              cell: ({ row }: { row: Row<GuarantorView> }) => row.original.firstName,
            },
          ]
        : []),
      ...(visibility.lastName
        ? [
            {
              accessorKey: "lastName",
              header: t("list.columns.lastName"),
              cell: ({ row }: { row: Row<GuarantorView> }) => row.original.lastName,
            },
          ]
        : []),
      // Add a computed full name column that's always visible if user can see first and last name
      ...(visibility.firstName && visibility.lastName
        ? [
            {
              accessorKey: "fullName",
              header: t("list.columns.fullName"),
              cell: ({ row }: { row: Row<GuarantorView> }) =>
                formatFullName(row.original.firstName, row.original.lastName),
            },
          ]
        : []),
      ...(visibility.email
        ? [
            {
              accessorKey: "email",
              header: t("list.columns.email"),
              cell: ({ row }: { row: Row<GuarantorView> }) => row.original.email,
            },
          ]
        : []),
      ...(visibility.mobileNumber
        ? [
            {
              accessorKey: "mobileNumber",
              header: t("list.columns.mobileNumber"),
              cell: ({ row }: { row: Row<GuarantorView> }) => row.original.mobileNumber,
            },
          ]
        : []),
      ...(visibility.addressCity
        ? [
            {
              accessorKey: "addressCity",
              header: t("list.columns.addressCity"),
              cell: ({ row }: { row: Row<GuarantorView> }) => row.original.addressCity,
            },
          ]
        : []),
      ...(visibility.addressState
        ? [
            {
              accessorKey: "addressState",
              header: t("list.columns.addressState"),
              cell: ({ row }: { row: Row<GuarantorView> }) => row.original.addressState,
            },
          ]
        : []),
      // Actions column (only if user can update or delete)
      ...(visibility.canUpdate || visibility.canDelete
        ? [
            {
              id: "actions",
              header: t("list.columns.actions"),
              cell: ({ row }: { row: Row<GuarantorView> }) => {
                // Return a string identifier that the component will recognize and render as buttons
                // The actual JSX will be rendered in the GuarantorTable component
                return row.original.id;
              },
            },
          ]
        : []),
    ],
    [visibility, t],
  );

  // Global search filter function
  const globalFilter = useMemo(() => {
    if (!searchQuery) return undefined;
    return (row: GuarantorView) => {
      const searchable = [row.firstName, row.lastName, row.email, row.mobileNumber, row.addressCity, row.addressState]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(searchQuery.toLowerCase());
    };
  }, [searchQuery]);

  // Initialize the table
  const table = useReactTable({
    data: filteredByLoanAppData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiSort: true,
  });

  // Effect to reset pagination when search query changes
  useEffect(() => {
    table.setPageIndex(0); // Reset to first page when search changes
  }, [searchQuery, table]);

  return {
    table,
    searchQuery,
    setSearchQuery,
    visibility,
    isLoading,
    data: filteredByLoanAppData,
  };
}
