"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCoApplicants } from "../actions/getCoApplicants";
import { CoApplicantTable } from "../components/CoApplicantTable";

/**
 * Page component for listing CoApplicants
 *
 * @returns {JSX.Element} List CoApplicants page
 */
export default function ListCoApplicantsPage() {
  const t = useTranslations("CoApplicant");
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanApplicationId = searchParams.get("loanApplicationId");

  const [coApplicants, setCoApplicants] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

  // Load co-applicants
  const loadCoApplicants = async () => {
    try {
      setIsLoading(true);

      const options: any = {
        page: currentPage,
        pageSize,
      };

      if (searchTerm) {
        options.search = searchTerm;
      }

      if (loanApplicationId) {
        options.loanApplicationId = loanApplicationId;
      }

      const result = await getCoApplicants(options);

      if (result.success && result.data) {
        setCoApplicants(result.data.data || []);
        setTotalCount(result.data.total || 0);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Error loading co-applicants:", err);
      setError(t("errors.loadFailed"));
      toast.error(t("errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount and when filters change
  useEffect(() => {
    loadCoApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, loanApplicationId]);

  return (
    <div className="container py-6">
      <PageHeader
        title={loanApplicationId ? t("page.list.titleForLoan") : t("page.list.title")}
        description={t("page.list.description")}
        actions={
          loanApplicationId && (
            <Link href={`/saas/coApplicant/create?loanApplicationId=${loanApplicationId}`} passHref>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                {t("page.list.add")}
              </Button>
            </Link>
          )
        }
      />

      <div className="py-4">
        {isLoading && coApplicants.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">{error}</div>
        ) : (
          <CoApplicantTable
            data={coApplicants}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            loanApplicationId={loanApplicationId || undefined}
            onPageChange={setCurrentPage}
            onSearchChange={setSearchTerm}
            onDeleted={loadCoApplicants}
          />
        )}
      </div>
    </div>
  );
}
