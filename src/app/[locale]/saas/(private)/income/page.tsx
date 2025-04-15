import IncomeForm from "@/app/[locale]/saas/(private)/income/components/IncomeForm";

export default function IncomeDocumentationPage({ searchParams }: { searchParams: { aid: string } }) {
  const applicantId = searchParams?.aid;

  return (
    <div>
      <IncomeForm applicantId={applicantId} />
    </div>
  );
}
