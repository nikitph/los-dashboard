"use server";

import ResidenceVerification from "@/app/[locale]/saas/(private)/verifications/components/ResidenceVerification";
import BusinessVerification from "@/app/[locale]/saas/(private)/verifications/components/BusinessVerification";
import { prisma } from "@/lib/prisma/prisma";

export default async function CreateVerificationPage({ searchParams }: { searchParams: { lid: string } }) {
  const { lid } = await searchParams;
  const loanApplication = await prisma.loanApplication.findUnique({
    where: {
      id: lid,
    },
    include: {
      applicant: true,
    },
  });

  const loanType = loanApplication?.loanType;

  console.log("loan Type", loanType);

  const renderVerificationForm = () => {
    switch (loanType) {
      case "PERSONAL":
        return <BusinessVerification loanApplicationId={lid} defaultType="BUSINESS" />;

      case "VEHICLE":
        return <ResidenceVerification loanApplicationId={lid} defaultType="BUSINESS" />;

      case "HOUSE_CONSTRUCTION":
      case "PLOT_PURCHASE":
      case "MORTGAGE":
      case "PLOT_AND_HOUSE_CONSTRUCTION":
        return <BusinessVerification loanApplicationId={lid} defaultType="BUSINESS" />;

      default:
        return <ResidenceVerification loanApplicationId={lid} defaultType="RESIDENCE" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div>{renderVerificationForm()}</div>
    </div>
  );
}
