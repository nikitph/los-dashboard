"use client";

import { UserRecord } from "@/app/[locale]/saas/(private)/users/schema";
import { Card } from "@/components/ui/card"; // adjust if you're not using shadcn
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function UserView({ user }: { user: UserRecord }) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatarUrl} alt={fullName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-xl font-semibold">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Badge variant="outline" className="mt-1">
            {user.role}
          </Badge>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Phone Number</p>
          <p>{user.phoneNumber || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Branch</p>
          <p>{user.branch || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <p>{user.status}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Last Login</p>
          <p>{user.lastLogin || "—"}</p>
        </div>
      </div>
    </Card>
  );
}
