"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface Column {
  key: string;
  header: string;
  formatter?: (value: any) => React.ReactNode;
  sortable?: boolean;
}

interface GenericTableProps<T> {
  data: T[];
  columns: Column[];
  basePath: string; // e.g., "/saas/bank"
  idField?: string;
  onDelete?: (id: string) => Promise<void>;
}

export function GenericTable<T extends Record<string, any>>({
  data,
  columns,
  basePath,
  idField = "id",
  onDelete,
}: GenericTableProps<T>) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });

  // Sort function
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={column.sortable ? "cursor-pointer" : ""}
              onClick={column.sortable ? () => handleSort(column.key) : undefined}
            >
              {column.header}
              {column.sortable && <ArrowUpDown className="ml-2 inline h-4 w-4" />}
            </TableHead>
          ))}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length + 1} className="text-center">
              No records found
            </TableCell>
          </TableRow>
        ) : (
          sortedData.map((row) => (
            <TableRow key={row[idField]}>
              {columns.map((column) => (
                <TableCell key={`${row[idField]}-${column.key}`}>
                  {column.formatter ? column.formatter(row[column.key]) : String(row[column.key] ?? "")}
                </TableCell>
              ))}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(`${basePath}/${row[idField]}`)}>View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`${basePath}/${row[idField]}/edit`)}>
                      Edit
                    </DropdownMenuItem>
                    {onDelete && (
                      <DropdownMenuItem className="text-red-600" onClick={() => onDelete(row[idField])}>
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
