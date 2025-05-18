"use server";

import React from "react";
import { prisma } from "@/lib/prisma/prisma";
import VerificationComplete from "@/app/[locale]/saas/(private)/verifications/components/VerificationComplete";

export async function VerificationCompletePage({ searchParams }: { searchParams: { lid: string } }) {
  const { lid } = await searchParams;
  const loanApplication = await prisma.loanApplication.findUnique({
    where: {
      id: lid,
    },
    include: {
      verifications: true,
    },
  });

  const verifications = loanApplication?.verifications;
  const hasFailedVerification = verifications?.some((verification) => verification.result === false) ?? true;

  return (
    <div className="min-h-screen bg-white">
      <div>
        <VerificationComplete loanApplicationId={lid} failed={hasFailedVerification} />
      </div>
    </div>
  );
}

export default VerificationCompletePage;
