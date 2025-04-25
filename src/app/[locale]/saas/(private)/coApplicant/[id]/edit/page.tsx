"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCoApplicant } from "../../actions/getCoApplicant";
import { UpdateCoApplicantForm } from "../../components/UpdateCoApplicantForm";

/**
 * Page component props
 */
interface EditCoApplicantPageProps {
  params: {
    id: string;
  };
}

/**
 * Page component for editing a CoApplicant
 *
 * @param {EditCoApplicantPageProps} props - Component properties including route params
 * @returns {JSX.Element} Edit CoApplicant page
 */
export default function EditCoApplicantPage({ params }: EditCoApplicantPageProps) {
  const t = useTranslations("CoApplicant");
  const router = useRouter();
  const [coApplicant, setCoApplicant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoApplicant() {
      try {
        const result = await getCoApplicant(params.id);

        if (result.success) {
          setCoApplicant(result.data);
        } else {
          setError(result.message);
          toast.error(result.message);
        }
      } catch (err) {
        console.error("Error loading co-applicant:", err);
        setError(t("errors.loadFailed"));
        toast.error(t("errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    }

    loadCoApplicant();
  }, [params.id, t]);

  return (
    <div className="container py-6">
      <PageHeader title={t("page.edit.title")} description={t("page.edit.description")} />

      <div className="py-4">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">{error}</div>
        ) : coApplicant ? (
          <UpdateCoApplicantForm
            initialData={coApplicant}
            onSuccess={() => {
              toast.success(t("toast.updated"));
              router.push(`/saas/coApplicant/${params.id}/view`);
            }}
          />
        ) : (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">
            {t("errors.notFound")}
          </div>
        )}
      </div>
    </div>
  );
}
