"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getGuarantor } from "../../actions/getGuarantor";
import { UpdateGuarantorForm } from "@/app/[locale]/saas/(private)/guarantor/components/GuarantorForm/UpdateGuarantorForm";

interface GuarantorEditPageProps {
  params: {
    id: string;
  };
}

/**
 * Page component for editing an existing guarantor
 */
export default function GuarantorEditPage({ params }: GuarantorEditPageProps) {
  const router = useRouter();
  const t = useTranslations("Guarantor");
  const [guarantor, setGuarantor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch guarantor data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getGuarantor({ id: params.id });
        if (response.success && response.data) {
          setGuarantor(response.data);
        } else {
          setError(response.message || t("errors.notFound"));
        }
      } catch (error) {
        console.error("Error fetching guarantor:", error);
        setError(t("errors.unexpected"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, t]);

  // Handle successful edit
  const handleSuccess = () => {
    router.push("/guarantor");
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/guarantor");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="mt-8 h-[500px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <PageHeader title={t("page.error")} description={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <PageHeader title={t("page.editTitle")} description={t("page.editDescription")} />

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <UpdateGuarantorForm guarantor={guarantor} />
      </Suspense>
    </div>
  );
}
