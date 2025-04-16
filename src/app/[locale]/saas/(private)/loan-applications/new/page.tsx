"use server";

import NewLoanApplicationForm from "@/app/[locale]/saas/(private)/loan-applications/components/NewLoanApplicationForm";

export default async function NewLoanApplicationPage({ searchParams }: { searchParams: { aid: string } }) {
  return (
    <div>
      <NewLoanApplicationForm />
    </div>
  );
}
