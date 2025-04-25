"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getGuarantors } from "../actions/getGuarantors";
import { GuarantorTable } from "../components/GuarantorTable";
import { GuarantorView } from "../schemas/guarantorSchema";

/**
 * Main guarantor list page component
 * Displays a table of guarantors with filtering and pagination
 */
export default function GuarantorListPage() {
  const t = useTranslations("Guarantor");
  const [guarantors, setGuarantors] = useState<GuarantorView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch guarantors on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getGuarantors();
        if (response.success && response.data) {
          setGuarantors(response.data);
        } else {
          console.error("Error fetching guarantors:", response.message);
        }
      } catch (error) {
        console.error("Error fetching guarantors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh data after changes
  const handleDataChange = async () => {
    const response = await getGuarantors();
    if (response.success && response.data) {
      setGuarantors(response.data);
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <PageHeader title={t("page.title")} description={t("page.description")} />
      <GuarantorTable initialData={guarantors} allowActions={true} onDataChange={handleDataChange} />
    </div>
  );
}
