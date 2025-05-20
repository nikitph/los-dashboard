"use server";

import { notFound } from "next/navigation";
import { getLoanApplication } from "@/app/[locale]/saas/(private)/loanapplication/actions/getLoanApplication";
import { ReviewPhysicalVerificationForm } from "@/app/[locale]/saas/(private)/loanapplication/components/ReviewPhysicalVerificationForm";

interface PhysicalVerificationReviewPageProps {
  params: {
    id: string;
  };
}

export default async function PhysicalVerificationReviewPage({ params }: PhysicalVerificationReviewPageProps) {
  try {
    const { id } = await params;
    const response = await getLoanApplication(id);

    if (!response.success) {
      return notFound();
    }

    return <ReviewPhysicalVerificationForm loanApplication={response.data} />;
  } catch (error) {
    console.error("Error fetching loan application:", error);
    return notFound();
  }
}
