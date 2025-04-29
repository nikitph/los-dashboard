import React from "react";
import { CreateIncomeForm } from "../components/CreateIncomeForm";

interface CreateIncomePageProps {
  searchParams: { aid?: string };
}

/**
 * Page component for creating a new income record
 */
export default function CreateIncomePage({ searchParams }: CreateIncomePageProps) {
  const applicantId = searchParams?.aid;

  if (!applicantId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Missing Applicant ID</h2>
        <p className="mt-2 text-muted-foreground">An applicant ID is required to create an income record.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <CreateIncomeForm applicantId={applicantId} />
    </div>
  );
}
