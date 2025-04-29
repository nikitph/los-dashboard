import React from "react";
import { IncomeTable } from "../components/IncomeTable";

interface ListIncomePageProps {
  searchParams: {
    aid?: string;
    page?: string;
    limit?: string;
  };
}

/**
 * Page component for listing income records
 */
export default function ListIncomePage({ searchParams }: ListIncomePageProps) {
  const applicantId = searchParams?.aid;
  const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams?.limit ? parseInt(searchParams.limit, 10) : 10;

  return (
    <div className="container mx-auto py-6">
      <IncomeTable applicantId={applicantId} initialPage={page} initialLimit={limit} />
    </div>
  );
}
