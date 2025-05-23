"use server";

import React from "react";
import { redirect } from "next/navigation";

import { getServerSessionUser } from "@/lib/getServerUser";
import ApplicationNumberConfigForm from "./components/ApplicationNumberConfigForm";
import { getApplicationNumberConfigById } from "./actions/applicationNumberConfigActions";

/**
 * Props for the Application Number Configuration page
 */
interface ApplicationNumberConfigPageProps {
  params: {
    bankId: string;
  };
  searchParams: {
    mode?: "create" | "edit";
    id?: string;
  };
}

/**
 * Application Number Configuration page component
 *
 * This page handles both creating new configurations and editing existing ones
 * based on the mode parameter. It fetches existing data for edit mode and
 * provides the form component with appropriate props.
 *
 * @param props - Page props including params and search params
 * @returns JSX element representing the configuration page
 */
export default async function ApplicationNumberConfigPage() {
  // Get current user for authentication and permissions
  const currentUser = await getServerSessionUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  const bankId = currentUser.currentRole.bankId;
  let initialData = undefined;
  let bankName = "Sample Bank";

  const response = await getApplicationNumberConfigById(bankId);

  if (response.success) {
    initialData = response.data;
    bankName = initialData?.bankName;
  }

  return (
    <div className="container mx-auto py-6">
      <ApplicationNumberConfigForm initialData={initialData} bankId={bankId} bankName={bankName} />
    </div>
  );
}
