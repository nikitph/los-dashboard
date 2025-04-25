"use server";

import PersonalInformationForm from "@/app/[locale]/saas/(private)/personal/components/PersonalInformationForm";
import { prisma } from "@/lib/prisma";

export default async function CreateApplicantPage({ searchParams }: any) {
  const { lid } = searchParams;

  console.log("lid", lid);
  const loanApplication = await prisma.loanApplication.findUnique({
    where: {
      id: lid,
    },
    include: {
      applicant: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Add personal Details</h1>
        </div>

        <div className="rounded-lg bg-white shadow">
          <PersonalInformationForm loanApplication={loanApplication} />
        </div>
      </div>
    </div>
  );
}
