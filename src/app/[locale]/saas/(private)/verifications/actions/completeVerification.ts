"use server";

import { handleActionError } from "@/lib/actionErrorHelpers";
import { getAbility } from "@/lib/casl/getAbility";
import { getServerSessionUser } from "@/lib/getServerUser";
import { prisma } from "@/lib/prisma/prisma";
import { ActionResponse } from "@/types/globalTypes";
import { getLocale, getTranslations } from "next-intl/server";
import { updateLoanApplicationStatusWithLog } from "@/services/loanApplicationService";

export async function completeVerification(id: string): Promise<ActionResponse<any>> {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get user permissions
    const ability = await getAbility(user);
    if (!ability.can("update", "LoanApplication")) {
      return { success: false, message: "errors.unauthorized" };
    }

    // Get translations
    const t = await getTranslations({ locale: await getLocale(), namespace: "LoanApplication" });

    // Check if loan application exists
    const existingLoanApplication = await prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!existingLoanApplication) {
      return {
        success: false,
        message: t("errors.notFound"),
      };
    }

    const updatedLoanApplication = await updateLoanApplicationStatusWithLog({
      loanApplicationId: id,
      newStatus: "VERIFICATION_COMPLETED",
      userId: user.id,
      userName: user.firstName + " " + user.lastName,
      role: user.currentRole.role,
      eventType: "VERIFICATION_COMPLETED",
    });

    return {
      success: true,
      message: t("toast.deleted"),
    };
  } catch (error) {
    return handleActionError({ type: "unexpected", error });
  }
}
