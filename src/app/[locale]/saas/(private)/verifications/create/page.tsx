"use server";

import ResidenceVerification from "@/app/[locale]/saas/(private)/verifications/components/ResidenceVerification";

export default async function CreateVerificationPage({ searchParams }: { searchParams: { lid: string } }) {
  const { lid } = await searchParams;
  return (
    <div className="min-h-screen bg-white">
      <div>
        <ResidenceVerification loanApplicationId={lid} />
      </div>
    </div>
  );
}
