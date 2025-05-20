"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select } from "@/subframe/components/Select";
import { TextArea } from "@/subframe/components/TextArea";
import { Badge } from "@/subframe/components/Badge";
import { Button } from "@/subframe/components/Button";
import { useAbility } from "@/lib/casl/abilityContext";
import { useRouter } from "next/navigation";
import { createReview } from "../actions/createReview";
import { defineReviewFieldVisibility } from "../lib/defineReviewFieldVisibility";
import { ReviewEntityType, ReviewEventType, RoleType } from "@prisma/client";
import { useUser } from "@/contexts/userContext";

// Schema for the review form
export const createReviewSchema = z.object({
  remarks: z.string().min(1, { message: "validation.remarks.required" }),
  result: z.boolean(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// Props for the ReviewForm component
export interface ReviewFormProps {
  reviewEntityType: ReviewEntityType;
  reviewEntityId: string;
  reviewEventType: ReviewEventType;
  loanApplicationId: string;
  actionData?: Record<string, any>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

/**
 * Generic Review component that can be plugged into any page
 *
 * @param {ReviewFormProps} props - Component props
 * @returns {JSX.Element} Review form component
 */
export function ReviewForm({
  reviewEntityType,
  reviewEntityId,
  reviewEventType,
  loanApplicationId,
  actionData = {},
  onSuccess,
  onError,
  className = "",
}: ReviewFormProps): React.ReactNode {
  const t = useTranslations("Review");
  const router = useRouter();
  const ability = useAbility();
  const { user } = useUser();

  // Get visibility settings based on user permissions
  const visibility = useMemo(() => defineReviewFieldVisibility(ability), [ability]);

  // Initialize the form
  const form = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      remarks: "",
      result: false,
    },
  });

  /**
   * Handle form submission
   *
   * @param {CreateReviewInput} values - Form values
   */
  const onSubmit = async (values: CreateReviewInput) => {
    if (!user) {
      return;
    }

    try {
      const response = await createReview({
        reviewEntityType,
        reviewEntityId,
        reviewEventType,
        loanApplicationId,
        remarks: values.remarks,
        result: values.result,
        actionData: actionData || {},
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        role: user.currentRole.role as RoleType,
      });

      if (response.success) {
        router.refresh();
        onSuccess?.();
      } else {
        onError?.(response.message);
      }
    } catch (error) {
      onError?.(error);
    }
  };

  return (
    <div className={"w-full"}>
      <Form {...form} namespace={"Review"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Remarks field */}
          {visibility.remarks && (
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-body-bold text-body-bold text-default-font">
                    {t("form.fields.remarks.label")}
                  </FormLabel>
                  <FormControl>
                    <TextArea className="h-auto w-full flex-none" label="" helpText="">
                      <TextArea.Input placeholder={t("form.fields.remarks.placeholder")} {...field} />
                    </TextArea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Result field */}
          {visibility.result && (
            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="font-body-bold text-body-bold text-default-font">
                    {t("form.fields.result.label")}
                  </FormLabel>
                  <div className="flex w-full items-center gap-2">
                    <Select
                      value={field.value ? "positive" : "negative"}
                      onValueChange={(val) => field.onChange(val === "positive")}
                      icon="FeatherCheckCircle"
                    >
                      <Select.Item value="positive">{t("form.result.positive")}</Select.Item>
                      <Select.Item value="negative">{t("form.result.negative")}</Select.Item>
                    </Select>
                    <Badge variant={field.value ? "success" : "error"}>
                      {field.value ? t("form.result.badge.success") : t("form.result.badge.error")}
                    </Badge>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Submit button */}
          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t("form.buttons.submitting") : t("form.buttons.submit")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ReviewForm;
