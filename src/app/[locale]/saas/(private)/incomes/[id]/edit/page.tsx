import React from "react";
import { UpdateIncomeForm } from "../../components/UpdateIncomeForm";

interface EditIncomePageProps {
  params: { id: string };
}

/**
 * Page component for editing an income record
 */
export default function EditIncomePage({ params }: EditIncomePageProps) {
  const { id } = params;

  return (
    <div className="container mx-auto py-6">
      <UpdateIncomeForm incomeId={id} />
    </div>
  );
}
