import { getTranslations } from "next-intl/server";
import { CreateLoanApplicationForm } from "../components/CreateLoanApplicationForm";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "LoanApplication" });
  return {
    title: t("meta.create.title"),
    description: t("meta.create.description"),
  };
}

export default function CreateLoanApplicationPage() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Loan Application</h1>
        <p className="text-muted-foreground">Create a new loan application by filling in the details below.</p>
      </div>
      <CreateLoanApplicationForm />
    </div>
  );
}
