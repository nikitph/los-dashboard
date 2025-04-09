"use client";

import * as React from "react";
import {
  ChevronDown,
  Download,
  Edit2,
  Key,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash,
  Unlock,
  UserPlus,
  Users,
} from "lucide-react";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPendingUserCreations, getUsersForBank } from "@/app/[locale]/saas/(private)/users/actions";
import { useUser } from "@/contexts/userContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Link } from "@/i18n/navigation";

type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  branch: string;
  avatarUrl?: string;
};

export default function ManageUsersPage() {
  const locale = useLocale();
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [pendingUsers, setPendingUsers] = React.useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isPendingView, setIsPendingView] = React.useState(false);

  // Table state
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  React.useEffect(() => {
    async function fetchData() {
      if (user?.currentRole?.bankId) {
        const data = await getUsersForBank(user?.currentRole?.bankId);
        setUsers(data);
      }
    }

    async function fetchPendingApprovals() {
      if (user?.currentRole?.bankId) {
        const data = await getPendingUserCreations(user.currentRole.bankId);
        const transformed = data.map((entry) => ({
          ...entry.payload,
          id: entry.id,
          status: "Pending",
          lastLogin: "—", // or entry.requestedAt.toISOString()
          branch: "—",
        })) as UserRecord[];

        setPendingUsers(transformed);
      }
    }

    fetchData();
    fetchPendingApprovals();
  }, [user, isPendingView]);

  // Reset filters
  const handleReset = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setColumnFilters([]);
    setSorting([]);
  };

  const handleAddUser = () => {
    router.push(`/${locale}/saas/users/create`);
  };

  const handleEdit = (userId: string) => {
    alert(`Edit user ${userId}`);
  };

  const handleResetPassword = (userId: string) => {
    alert(`Reset password for user ${userId}`);
  };

  const handleLockUnlock = (user: UserRecord) => {
    if (user.status === "Locked") {
      alert(`Unlock account for user ${user.id}`);
    } else {
      alert(`Lock account for user ${user.id}`);
    }
  };

  const handleExportSelected = () => {
    const selectedUsers = table.getSelectedRowModel().rows.map((row) => row.original);
    console.log("Exporting selected users:", selectedUsers);
    // Implement your export logic here
  };

  const handleDeleteSelected = () => {
    const selectedUsers = table.getSelectedRowModel().rows.map((row) => row.original);
    console.log("Deleting selected users:", selectedUsers);
    // Implement your delete logic here
  };

  // Helper to color-code statuses
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "locked":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Apply global filters manually to handle combined filters
  const globalFilterFn: FilterFn<UserRecord> = (row, columnId, value) => {
    // For search term
    const searchMatch =
      searchTerm === "" ||
      row.original.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.original.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.original.email.toLowerCase().includes(searchTerm.toLowerCase());

    // For role filter
    const roleMatch = roleFilter === "all" || row.original.role === roleFilter;

    // For status filter
    const statusMatch = statusFilter === "all" || row.original.status === statusFilter;

    return searchMatch && roleMatch && statusMatch;
  };

  // Table columns definition
  const columns: ColumnDef<UserRecord>[] = [
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
      accessorKey: "fullName",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Link
            href={`/saas/users/${user.id}?approve=${isPendingView}`}
            className="flex items-center gap-2 rounded-md p-2 transition hover:bg-muted/40"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="avatar" />}
                <AvatarFallback>{(user.firstName?.[0] + user.lastName?.[0] || "U").toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </Link>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant={getStatusVariant(row?.original?.status)}>{row.original.status}</Badge>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
      cell: ({ row }) => <div className="whitespace-nowrap">{row.original.lastLogin}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }) => <div className="whitespace-nowrap">{row.original.branch}</div>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleResetPassword(row.original.id)}>
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              {row.original.status === "Locked" ? (
                <DropdownMenuItem onClick={() => handleLockUnlock(row.original)}>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock Account
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleLockUnlock(row.original)}>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock Account
                </DropdownMenuItem>
              )}
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
    data: isPendingView ? pendingUsers : users,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
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

  // Calculate stats from filtered data
  const filteredUsers = table.getFilteredRowModel().rows.map((row) => row.original);
  const activeCount = filteredUsers.filter((u) => u.status.toLowerCase() === "active").length;
  const lockedCount = filteredUsers.filter((u) => u.status.toLowerCase() === "locked").length;

  return (
    <div className="w-full flex-col gap-8 px-6 py-6">
      {/* Header row: Title + Add User */}
      <div className="mb-6 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="text-brand-600 h-6 w-6" />
          <h1 className="text-2xl font-semibold">User Management</h1>
        </div>
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats row */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="h-full cursor-pointer transition hover:shadow-lg" onClick={() => setIsPendingView(false)}>
          <CardContent className="flex h-full items-center gap-4 px-6 py-6">
            <span className="text-2xl font-bold text-green-700">{users.length}</span>
            <span className="text-sm font-medium text-green-700">Active Users</span>
          </CardContent>
        </Card>
        <Card className="h-full cursor-pointer transition hover:shadow-lg" onClick={() => setIsPendingView(true)}>
          <CardContent className="flex h-full items-center gap-4 px-6 py-6">
            <span className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</span>
            <span className="text-sm font-medium text-yellow-600">Pending Approval</span>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardContent className="flex h-full items-center gap-4 px-6 py-6">
            <span className="text-2xl font-bold text-red-700">{lockedCount}</span>
            <span className="text-sm font-medium text-red-700">Locked Accounts</span>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Role filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="Loan Officer">Loan Officer</SelectItem>
                  <SelectItem value="Underwriter">Underwriter</SelectItem>
                  <SelectItem value="Processor">Processor</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Locked">Locked</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Reset button */}
            <Button variant="outline" onClick={handleReset} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {table.getSelectedRowModel().rows.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportSelected}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will delete {table.getSelectedRowModel().rows.length} selected user(s) and cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
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
                      {column.id === "fullName" ? "User" : column.id}
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
              {table.getRowModel().rows.length > 0 ? (
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
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
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
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
                {"<"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                {">"}
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
