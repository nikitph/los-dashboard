import { useTranslations } from "next-intl";
import { useViewGuarantorForm } from "../../hooks/useViewGuarantorForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { GuarantorView } from "../../schemas/guarantorSchema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteGuarantor } from "../../actions/deleteGuarantor";
import { toast } from "sonner";

/**
 * Props for the ViewGuarantorForm component
 */
interface ViewGuarantorFormProps {
  /**
   * Guarantor data to be displayed
   */
  guarantor: GuarantorView;
}

/**
 * Component for viewing guarantor details
 * Uses the useViewGuarantorForm hook to handle permissions and display logic
 *
 * @param {ViewGuarantorFormProps} props - Component props
 * @returns {JSX.Element} View guarantor component
 */
export function ViewGuarantorForm({ guarantor }: ViewGuarantorFormProps): JSX.Element {
  const t = useTranslations("Guarantor");
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { visibility, formattedValues, canEdit, canDelete } = useViewGuarantorForm({
    guarantor,
  });

  /**
   * Handles guarantor deletion
   */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteGuarantor({ id: guarantor.id });

      if (response.success) {
        toast.success(t("toast.deleteSuccess"), {
          description: t("toast.deleteSuccessDescription"),
        });
        router.push("/saas/guarantor/list");
      } else {
        toast.error(t("toast.deleteError"), {
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Error deleting guarantor:", error);
      toast.error(t("toast.unexpectedError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{formattedValues.fullName}</CardTitle>
        <CardDescription>{t("view.guarantorDetails")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("view.personalInfo")}</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibility.firstName && (
              <div>
                <div className="text-sm text-muted-foreground">{t("form.firstName.label")}</div>
                <div className="font-medium">{guarantor.firstName}</div>
              </div>
            )}

            {visibility.lastName && (
              <div>
                <div className="text-sm text-muted-foreground">{t("form.lastName.label")}</div>
                <div className="font-medium">{guarantor.lastName}</div>
              </div>
            )}

            {visibility.email && (
              <div>
                <div className="text-sm text-muted-foreground">{t("form.email.label")}</div>
                <div className="font-medium">{guarantor.email}</div>
              </div>
            )}

            {visibility.mobileNumber && (
              <div>
                <div className="text-sm text-muted-foreground">{t("form.mobileNumber.label")}</div>
                <div className="font-medium">{guarantor.mobileNumber}</div>
              </div>
            )}
          </div>
        </div>

        {/* Address Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("view.addressInfo")}</h3>

          <div className="grid grid-cols-1 gap-2">
            {visibility.addressLine1 && (
              <div>
                <div className="text-sm text-muted-foreground">{t("form.addressLine1.label")}</div>
                <div className="font-medium">{guarantor.addressLine1}</div>
              </div>
            )}

            {visibility.addressLine2 && guarantor.addressLine2 && (
              <div>
                <div className="text-sm text-muted-foreground">{t("form.addressLine2.label")}</div>
                <div className="font-medium">{guarantor.addressLine2}</div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {visibility.addressCity && (
                <div>
                  <div className="text-sm text-muted-foreground">{t("form.addressCity.label")}</div>
                  <div className="font-medium">{guarantor.addressCity}</div>
                </div>
              )}

              {visibility.addressState && (
                <div>
                  <div className="text-sm text-muted-foreground">{t("form.addressState.label")}</div>
                  <div className="font-medium">{guarantor.addressState}</div>
                </div>
              )}

              {visibility.addressZipCode && (
                <div>
                  <div className="text-sm text-muted-foreground">{t("form.addressZipCode.label")}</div>
                  <div className="font-medium">{guarantor.addressZipCode}</div>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t("view.fullAddress")}</div>
              <div className="font-medium">{formattedValues.fullAddress}</div>
            </div>
          </div>
        </div>

        {/* System Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("view.systemInfo")}</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">{t("view.createdAt")}</div>
              <div className="font-medium">{formattedValues.createdAt}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t("view.updatedAt")}</div>
              <div className="font-medium">{formattedValues.updatedAt}</div>
            </div>

            {visibility.loanApplicationId && (
              <div>
                <div className="text-sm text-muted-foreground">{t("form.loanApplicationId.label")}</div>
                <div className="font-medium">{guarantor.loanApplicationId}</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/saas/guarantor/list">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("view.buttons.back")}
          </Link>
        </Button>

        <div className="flex space-x-2">
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("view.buttons.delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                      {t("delete.confirmTitle")}
                    </div>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("delete.confirmDescription", { name: formattedValues.fullName })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeleting}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? t("delete.deleting") : t("delete.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {canEdit && (
            <Button asChild>
              <Link href={`/saas/guarantor/${guarantor.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("view.buttons.edit")}
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
