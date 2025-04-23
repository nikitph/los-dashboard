import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useViewCoApplicantForm } from "../hooks/useViewCoApplicantForm";
import { CoApplicantView } from "../schemas/coApplicantSchema";

/**
 * ViewCoApplicantForm component props
 */
interface ViewCoApplicantFormProps {
  data: CoApplicantView;
  onDelete?: () => void;
}

/**
 * Component for viewing CoApplicant details
 *
 * @param {ViewCoApplicantFormProps} props - Component properties including CoApplicant data
 * @returns {JSX.Element} View component for CoApplicant details
 */
export function ViewCoApplicantForm({ data, onDelete }: ViewCoApplicantFormProps) {
  const t = useTranslations("CoApplicant");
  const router = useRouter();
  const { sections, visibility, canUpdate, canDelete } = useViewCoApplicantForm({ data });

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.id} className="w-full">
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {section.fields
                .filter((field) => field.visible)
                .map((field) => (
                  <div key={field.id} className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{field.label}</h4>
                    <p className="text-base">{field.value || t("common.notSpecified")}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>{t("form.actions.title")}</CardTitle>
          <CardDescription>{t("form.actions.description")}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            {t("form.back")}
          </Button>
          <div className="flex gap-2">
            {canDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("form.delete")}
              </Button>
            )}
            {canUpdate && (
              <Link href={`/saas/coApplicant/${data.id}/edit`} passHref>
                <Button>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("form.edit")}
                </Button>
              </Link>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
