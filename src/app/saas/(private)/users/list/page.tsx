"use client";

import * as React from "react";
import { Edit2, Key, Lock, MoreHorizontal, RefreshCw, Search, Unlock, UserPlus, Users } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
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
import { getUsersForBank } from "@/app/saas/(private)/users/actions";
import { useUser } from "@/contexts/userContext";
import { useRouter } from "next/navigation";

type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string; // e.g. "Administrator", "Loan Officer"
  status: string; // e.g. "Active", "Pending", "Locked"
  lastLogin: string;
  branch: string;
  avatarUrl?: string;
};

export default function ManageUsersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [users, setUsers] = React.useState<UserRecord[]>([]);

  console.log(users);

  React.useEffect(() => {
    async function fetchData() {
      if (user?.currentRole?.bankId) {
        const data = await getUsersForBank(user?.currentRole?.bankId);
        setUsers(data);
      }
    }

    fetchData();
  }, [user]);

  // Derived list of users based on filters/search
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
      const matchesStatus = statusFilter === "all" ? true : user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  console.log("filtered", filteredUsers);

  // Reset filters
  const handleReset = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  // Example actions
  const handleAddUser = () => {
    router.push("/saas/users/create");
  };

  const handleEdit = (userId: string) => {
    // Show a modal or navigate to an edit page
    alert(`Edit user ${userId}`);
  };

  const handleResetPassword = (userId: string) => {
    // Trigger password reset flow
    alert(`Reset password for user ${userId}`);
  };

  const handleLockUnlock = (user: UserRecord) => {
    // Lock or unlock user
    if (user.status === "Locked") {
      alert(`Unlock account for user ${user.id}`);
    } else {
      alert(`Lock account for user ${user.id}`);
    }
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
      <div className="mb-4 flex w-full flex-wrap items-start gap-4">
        <Card className="flex-1">
          <CardContent className="flex items-center gap-4 px-6 py-6">
            <span className="text-brand-700 text-2xl font-bold">{users.length}</span>
            <span className="text-brand-700 text-sm font-medium">Total Users</span>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="flex items-center gap-4 px-6 py-6">
            <span className="text-2xl font-bold text-green-700">
              {users.filter((u) => u.status.toLowerCase() === "active").length}
            </span>
            <span className="text-sm font-medium text-green-700">Active Users</span>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="flex items-center gap-4 px-6 py-6">
            <span className="text-2xl font-bold text-red-700">
              {users.filter((u) => u.status.toLowerCase() === "locked").length}
            </span>
            <span className="text-sm font-medium text-red-700">Locked Accounts</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters row */}
      <div className="mb-4 flex w-full flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex flex-1 items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
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
        <Button variant="secondary" onClick={handleReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="avatar" />}
                        <AvatarFallback>
                          {(user.firstName?.[0] + user.lastName?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{user.lastLogin}</TableCell>
                  <TableCell className="whitespace-nowrap">{user.branch}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        {user.status === "Locked" ? (
                          <DropdownMenuItem onClick={() => handleLockUnlock(user)}>
                            <Unlock className="mr-2 h-4 w-4" />
                            Unlock Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleLockUnlock(user)}>
                            <Lock className="mr-2 h-4 w-4" />
                            Lock Account
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
      </div>
    </div>
  );
}
