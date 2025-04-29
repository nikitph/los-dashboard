import React from "react";
import { ViewIncomeForm } from "../../components/ViewIncomeForm";

interface ViewIncomePageProps {
  params: { id: string };
}

/**
 * Page component for viewing an income record
 */
export default function ViewIncomePage({ params }: ViewIncomePageProps) {
  const { id } = params;

  return (
    <div className="container mx-auto py-6">
      <ViewIncomeForm incomeId={id} />
    </div>
  );
}
