"use server";

import { getTranslations } from "next-intl/server";
import { ActionResponse } from "@/types/globalTypes";
import { getServerSessionUser } from "@/lib/getServerUser";
import { getAbility } from "@/lib/casl/getAbility";
import { prisma } from "@/lib/prisma/prisma";
import { handleActionError } from "@/lib/actionErrorHelpers";
import { CreateReviewInput, createReviewSchema } from "@/app/[locale]/saas/(private)/review/schemas/reviewSchema";

/**
 * Creates a new review in the database
 *
 * @param {CreateReviewInput} data - The review data to create
 * @returns {Promise<ActionResponse<any>>} Response with created review or error
 */
export async function createReview(data: CreateReviewInput): Promise<ActionResponse<any>> {
  try {
    // Get translations for the response messages
    const t = await getTranslations({
      locale: "en", // Default to English, should be dynamic in production
      namespace: "Reviews",
    });

    // Validate the input data
    const validationResult = createReviewSchema.safeParse(data);
    if (!validationResult.success) {
      return handleActionError({ type: "unexpected", error: validationResult.error });
    }

    // Get the current session
    const user = await getServerSessionUser();
    if (!user) {
      return {
        success: false,
        message: t("errors.unauthorized"),
      };
    }

    // Check permissions
    const ability = await getAbility(user);
    if (!ability.can("create", "Review")) {
      return {
        success: false,
        message: t("errors.forbidden"),
      };
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        reviewEntityType: data.reviewEntityType,
        reviewEntityId: data.reviewEntityId,
        reviewEventType: data.reviewEventType,
        loanApplicationId: data.loanApplicationId,
        remarks: data.remarks,
        result: data.result,
        actionData: data.actionData || {},
        userId: data.userId,
        userName: data.userName,
        role: data.role,
      },
    });

    return {
      success: true,
      message: t("toast.created"),
      data: review,
    };
  } catch (error) {
    console.error("[createReview]", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}
