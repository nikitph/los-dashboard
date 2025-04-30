"use client";

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useAbility } from "../../../../../../lib/casl/abilityContext";
import { getLoanApplications } from "../actions/getLoanApplications";
import { defineLoanApplicationFieldVisibility } from "../lib/defineLoanApplicationFieldVisibility";
import { formatLoanStatus, formatLoanType, getStatusBadgeColor } from "../lib/helpers";
import { LoanApplicationView } from "../schemas/loanApplicationSchema";

/**
 * Hook for managing loan application table state and data
 *
 * @param {object} initialData - Initial data for the table
 * @returns {object} Table state and controls
 */
export function useLoanApplicationTable(initialData: { items: LoanApplicationView[]; total: number }) {
  // Get permissions
  const ability = useAbility();
  const visibility = useMemo(() => defineLoanApplicationFieldVisibility(ability), [ability]);

  // Get translations
  const t = useTranslations("LoanApplication");

  // Table state
  const [data, setData] = useState(initialData.items);
  const [totalItems, setTotalItems] = useState(initialData.total);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [loanType, setLoanType] = useState<string | undefined>(undefined);

  // Pagination
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sorting
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Generate columns based on visibility permissions
  const columns = useMemo<ColumnDef<LoanApplicationView>[]>(() => {
    const cols: ColumnDef<LoanApplicationView>[] = [];

    if (visibility.id) {
      cols.push({
        accessorKey: "id",
        header: t("list.columns.id"),
        cell: ({ row }) => <div className="max-w-[100px] truncate">{row.getValue("id")}</div>,
        enableSorting: false,
        enableHiding: false,
      });
    }

    if (visibility.applicant) {
      cols.push({
        accessorKey: "applicantName",
        header: t("list.columns.applicant"),
        cell: ({ row }) => <div>{row.getValue("applicantName") || "-"}</div>,
        enableSorting: true,
      });
    }

    if (visibility.loanType) {
      cols.push({
        accessorKey: "loanType",
        header: t("list.columns.loanType"),
        cell: ({ row }) => <div>{formatLoanType(row.getValue("loanType"))}</div>,
        enableSorting: true,
      });
    }

    if (visibility.amountRequested) {
      cols.push({
        accessorKey: "amountRequested",
        header: t("list.columns.amount"),
        cell: ({ row }) => <div>{row.original.formattedAmount || row.getValue("amountRequested")}</div>,
        enableSorting: true,
      });
    }

    if (visibility.status) {
      cols.push({
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
      });
    }

    if (visibility.createdAt) {
      cols.push({
        accessorKey: "createdAt",
        header: t("list.columns.createdAt"),
        cell: ({ row }) => (
          <div>{row.original.formattedCreatedAt || new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
        ),
        enableSorting: true,
      });
    }

    // Actions column
    cols.push({
      id: "actions",
      header: t("list.columns.actions"),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            {/* Action buttons will go here in the component */}
            <span>🔍</span>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    });

    return cols;
  }, [t, visibility]);

  // Create and configure the table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(totalItems / pagination.pageSize),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Load data function
  const loadData = async () => {
    try {
      const page = pagination.pageIndex + 1; // API uses 1-based indexing
      const limit = pagination.pageSize;

      // Get sort field and direction
      const sortField = sorting.length > 0 ? sorting[0].id : "createdAt";
      const sortDirection = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

      const response = await getLoanApplications({
        page,
        limit,
        search,
        status,
        loanType,
      });

      if (response.success && response.data) {
        setData(response.data.items);
        setTotalItems(response.data.total);
      }
    } catch (error) {
      console.error("Error loading loan applications:", error);
    }
  };

  // Define filter options
  const statusOptions = [
    { label: t("filter.status.all"), value: "" },
    { label: t("filter.status.pending"), value: "PENDING" },
    { label: t("filter.status.underReview"), value: "UNDER_REVIEW" },
    { label: t("filter.status.approved"), value: "APPROVED" },
    { label: t("filter.status.rejected"), value: "REJECTED" },
  ];

  const loanTypeOptions = [
    { label: t("filter.loanType.all"), value: "" },
    { label: t("filter.loanType.personal"), value: "PERSONAL" },
    { label: t("filter.loanType.vehicle"), value: "VEHICLE" },
    { label: t("filter.loanType.houseConstruction"), value: "HOUSE_CONSTRUCTION" },
    { label: t("filter.loanType.plotPurchase"), value: "PLOT_PURCHASE" },
    { label: t("filter.loanType.mortgage"), value: "MORTGAGE" },
  ];

  return {
    table,
    data,
    totalItems,
    pagination,
    sorting,
    visibility,
    filters: {
      search,
      setSearch,
      status,
      setStatus,
      loanType,
      setLoanType,
      statusOptions,
      loanTypeOptions,
    },
    loadData,
    columnVisibility,
    setColumnVisibility,
  };
}
