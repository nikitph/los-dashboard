"use server";

import { prisma } from "@/lib/prisma";

import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserView from "@/app/[locale]/saas/(private)/users/components/UserView";
import { getServerSessionUser } from "@/lib/getServerUser";

interface ViewUserPageProps {
  params: {
    id: string;
    locale: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ViewUserPage({ params, searchParams }: ViewUserPageProps) {
  const { id, locale } = await params;
  const { approve } = await searchParams;
  const approveMode = approve === "true";
  const currentUser = await getServerSessionUser();
  let userRecord;

  const bankId = currentUser?.currentRole?.bankId;

  if (!bankId) notFound();

  // Find the user by userId (in userRoles)
  const userRole = await prisma.userRoles.findFirst({
    where: {
      userId: id,
      bankId,
      role: { not: "APPLICANT" },
    },
    include: {
      user: true,
    },
  });

  const pendingAction = await prisma.pendingAction.findFirst({
    where: {
      id: id,
      bankId,
      actionType: "REQUEST_BANK_USER_CREATION",
    },
  });

  if (approveMode) {
    if (!pendingAction) notFound();
    userRecord = {
      // @ts-ignore
      ...pendingAction.payload,
      id: pendingAction.id,
      status: "Pending",
      lastLogin: "—",
      branch: "—",
    };
  } else {
    if (!userRole) notFound();
    userRecord = {
      id: userRole.userId,
      firstName: userRole.user.firstName ?? "",
      lastName: userRole.user.lastName ?? "",
      email: userRole.user.email ?? "",
      phoneNumber: userRole.user.phoneNumber ?? "",
      role: userRole.role,
      status: "Active", // you can replace with actual logic if needed
      lastLogin: "N/A", // replace with last login if you track it
      branch: "Main Branch", // or fetch from branch table if applicable
      avatarUrl: undefined,
    };
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/${locale}/saas/users/list`}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">User Details</h1>
      </div>

      <UserView user={userRecord} approveMode={approveMode} />
    </div>
  );
}
