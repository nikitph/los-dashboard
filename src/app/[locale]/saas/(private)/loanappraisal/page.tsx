import IncomeForm from "@/app/[locale]/saas/(private)/income/components/IncomeForm";
import { prisma } from "@/lib/prisma/prisma";
import { z } from "zod";
import { LoanType } from "@/schemas/zodSchemas";
import VehicleAppraisalForm from "@/app/[locale]/saas/(private)/loanappraisal/components/VehicleAppraisalForm";

type LoanTypeEnum = z.infer<typeof LoanType>;

const loanFormComponents: Record<LoanTypeEnum, React.ComponentType<any>> = {
  PERSONAL: IncomeForm,
  VEHICLE: VehicleAppraisalForm,
  HOUSE_CONSTRUCTION: VehicleAppraisalForm,
  PLOT_AND_HOUSE_CONSTRUCTION: VehicleAppraisalForm,
  PLOT_PURCHASE: VehicleAppraisalForm,
  MORTGAGE: VehicleAppraisalForm,
} as const;

export default async function LoanAppraisalPage({ searchParams }: { searchParams: { lid: string } }) {
  const { lid } = searchParams;

  const loanApplication = await prisma.loanApplication.findUnique({
    where: { id: lid },
    include: { applicant: true },
  });

  if (!loanApplication?.applicant) {
    return <div>Application not found</div>;
  }

  // Validate loan type with Zod
  const loanTypeResult = LoanType.safeParse(loanApplication.loanType);
  if (!loanTypeResult.success) {
    return <div>Invalid loan type</div>;
  }

  const applicantId = loanApplication.applicant.id;
  const loanType = loanTypeResult.data;

  const FormComponent = loanFormComponents[loanType];

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <FormComponent aid={applicantId} loanApplicationId={lid} />
    </div>
  );
}
