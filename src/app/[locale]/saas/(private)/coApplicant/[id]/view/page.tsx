"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteCoApplicant } from "../../actions/deleteCoApplicant";
import { getCoApplicant } from "../../actions/getCoApplicant";
import { ViewCoApplicantForm } from "../../components/ViewCoApplicantForm";

/**
 * Page component props
 */
interface ViewCoApplicantPageProps {
  params: {
    id: string;
  };
}

/**
 * Page component for viewing a CoApplicant's details
 *
 * @param {ViewCoApplicantPageProps} props - Component properties including route params
 * @returns {JSX.Element} View CoApplicant page
 */
export default function ViewCoApplicantPage({ params }: ViewCoApplicantPageProps) {
  const t = useTranslations("CoApplicant");
  const router = useRouter();
  const [coApplicant, setCoApplicant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function loadCoApplicant() {
      try {
        setIsLoading(true);
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteCoApplicant(params.id);

      if (result.success) {
        toast.success(t("toast.deleted"));
        router.push(`/saas/coApplicant/list`);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Error deleting co-applicant:", err);
      toast.error(t("errors.deleteFailed"));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => window.history.back()} className="mr-2">
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("form.back")}
        </Button>
        <PageHeader
          title={coApplicant ? `${coApplicant.firstName} ${coApplicant.lastName}` : t("page.view.title")}
          description={t("page.view.description")}
        />
      </div>

      <div className="py-4">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">{error}</div>
        ) : coApplicant ? (
          <>
            <ViewCoApplicantForm data={coApplicant} onDelete={() => setShowDeleteDialog(true)} />

            {/* Delete confirmation dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("dialog.delete.title")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("dialog.delete.description")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>{t("dialog.delete.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("dialog.delete.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive dark:bg-destructive/20">
            {t("errors.notFound")}
          </div>
        )}
      </div>
    </div>
  );
}
