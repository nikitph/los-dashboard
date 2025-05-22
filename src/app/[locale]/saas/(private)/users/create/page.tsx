"use server";

import { Alert } from "@/components/subframe/ui";
import UserForm from "../components/UserForm";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getTranslations } from "next-intl/server";
import { AlertDescription } from "@/components/ui/alert";

export default async function CreateUserPage() {
  const t = await getTranslations("UserCreateForm");
  const user = await getServerSessionUser();

  if (!user?.currentRole?.bankId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>No bank selected. Please select a bank first.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{t("page.title")}</h1>
        </div>

        <div>
          <UserForm bankId={user?.currentRole?.bankId} />
        </div>
      </div>
    </div>
  );
}
