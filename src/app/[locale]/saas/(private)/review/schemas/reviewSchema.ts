import { z } from "zod";
import { ReviewEntityType, ReviewEventType, RoleType } from "@prisma/client";

/**
 * Schema for creating a review
 * Used for form validation and API validation
 */
export const createReviewSchema = z.object({
  reviewEntityType: z.nativeEnum(ReviewEntityType),
  reviewEntityId: z.string().min(1),
  reviewEventType: z.nativeEnum(ReviewEventType),
  loanApplicationId: z.string().min(1),
  remarks: z.string().min(1, { message: "validation.remarks.required" }),
  result: z.boolean(),
  actionData: z.record(z.any()).optional().default({}),
  userId: z.string().min(1),
  userName: z.string().min(1),
  role: z.nativeEnum(RoleType),
});

/**
 * Schema for viewing a review
 * Includes readonly fields like id and dates
 */
export const reviewViewSchema = createReviewSchema.extend({
  id: z.string(),
  createdAt: z.date(),
});

/**
 * Schema for minimal review data
 * Used for showing just the visible fields in forms
 */
export const reviewFormSchema = z.object({
  remarks: z.string().min(1, { message: "validation.remarks.required" }),
  result: z.boolean(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReviewFormInput = z.infer<typeof reviewFormSchema>;
export type ReviewView = z.infer<typeof reviewViewSchema>;
