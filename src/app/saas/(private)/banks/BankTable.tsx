"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import BankForm from "@/components/BankForm";
import { Bank } from "@prisma/client";
import { deleteBankAction } from "@/app/saas/(private)/banks/actions";

interface BankTableProps {
  data: Bank[] | undefined | null;
}

export function BankTable({ data }: BankTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Bank>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const bank = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <BankForm bank={bank} />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await deleteBankAction(bank.id);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
              ))}
              {/* Column Visibility Dropdown */}
              {/*<DropdownMenu className={"justify-end"}>*/}
              {/*  <DropdownMenuTrigger asChild>*/}
              {/*    <Button variant="outline" className="mb-4 ml-auto">*/}
              {/*      <Eye className="mr-2 h-4 w-4" />*/}
              {/*      Columns*/}
              {/*    </Button>*/}
              {/*  </DropdownMenuTrigger>*/}
              {/*  <DropdownMenuContent align="end">*/}
              {/*    {table*/}
              {/*      .getAllColumns()*/}
              {/*      .filter((column) => column.getCanHide())*/}
              {/*      .map((column) => (*/}
              {/*        <DropdownMenuCheckboxItem*/}
              {/*          key={column.id}*/}
              {/*          checked={column.getIsVisible()}*/}
              {/*          onCheckedChange={(value) => column.toggleVisibility(!!value)}*/}
              {/*        >*/}
              {/*          {column.id}*/}
              {/*        </DropdownMenuCheckboxItem>*/}
              {/*      ))}*/}
              {/*  </DropdownMenuContent>*/}
              {/*</DropdownMenu>*/}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}
