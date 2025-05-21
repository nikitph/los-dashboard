"use server";

import { notFound } from "next/navigation";
import { getLoanApplication } from "@/app/[locale]/saas/(private)/loanapplication/actions/getLoanApplication";
import SanctionNoteForm from "./components/SanctionNoteForm";
import { getServerSessionUser } from "@/lib/getServerUser";
import CeoSanctionNoteForm from "./components/CeoSanctionNoteForm";

interface SanctionNotePageProps {
  searchParams: {
    lid: string;
  };
}

export default async function SanctionNotePage({ searchParams }: SanctionNotePageProps) {
  try {
    const { lid } = await searchParams;
    const user = await getServerSessionUser();
    const response = await getLoanApplication(lid);

    if (!response.success) {
      return notFound();
    }

    if (user?.currentRole.role === "CEO") return <CeoSanctionNoteForm loanApplication={response.data} />;
    else return <SanctionNoteForm loanApplication={response.data} />;
  } catch (error) {
    console.error("Error fetching loan application:", error);
    return notFound();
  }
}
