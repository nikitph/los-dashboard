"use server";

import { notFound } from "next/navigation";
import { getLoanApplication } from "@/app/[locale]/saas/(private)/loanapplication/actions/getLoanApplication";
import SanctionNoteForm from "./components/SanctionNoteForm";

interface SanctionNotePageProps {
  searchParams: {
    lid: string;
  };
}

export default async function SanctionNotePage({ searchParams }: SanctionNotePageProps) {
  try {
    const { lid } = await searchParams;
    const response = await getLoanApplication(lid);

    if (!response.success) {
      return notFound();
    }

    return <SanctionNoteForm loanApplication={response.data} />;
  } catch (error) {
    console.error("Error fetching loan application:", error);
    return notFound();
  }
}
