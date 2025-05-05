import IncomeForm from "@/app/[locale]/saas/(private)/income/components/IncomeForm";

export default async function IncomeDocumentationPage({
  searchParams,
}: {
  searchParams: { aid: string; lid: string };
}) {
  const { aid, lid } = await searchParams;

  return (
    <div>
      <IncomeForm applicantId={aid} loanapplicationId={lid} />
    </div>
  );
}
