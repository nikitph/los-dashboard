"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/prisma";
import { SubscriptionSchema } from "@/schemas/zodSchemas";

// Type for subscription input data
export type SubscriptionFormData = z.infer<typeof SubscriptionSchema>;

// Response type for actions
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * Create a new subscription
 * @param formData The subscription data
 */
export async function createSubscription(formData: SubscriptionFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = SubscriptionSchema.parse(formData);

    // Create subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        ...validatedData,
      },
    });

    // Revalidate the subscriptions list path
    revalidatePath("/saas/subscriptions/list");

    return {
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to create subscription",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all subscriptions with optional filtering and sorting
 */
export async function getSubscriptions(
  searchTerm = "",
  filters = {},
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  },
) {
  try {
    // Build filter conditions
    const baseFilters: any = {
      deletedAt: null, // Only get non-deleted subscriptions
      ...filters,
    };

    // Get subscriptions with filters
    const subscriptions = await prisma.subscription.findMany({
      where: baseFilters,
      include: {
        // Include related models as needed
        bank: {
          select: {
            id: true,
          },
        },
      },
    });

    // Apply search filter if provided
    let filteredSubscriptions = subscriptions;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredSubscriptions = subscriptions.filter((subscription) => {
        return (
          subscription.id?.toLowerCase().includes(search) ||
          subscription.bankId?.toLowerCase().includes(search) ||
          subscription.status?.toLowerCase().includes(search)
        );
      });
    }

    // Apply sorting if provided
    if (sortConfig && sortConfig.key) {
      filteredSubscriptions.sort((a: any, b: any) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (!aValue || !bValue) return 0;

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return {
      success: true,
      data: filteredSubscriptions,
    };
  } catch (error) {
    console.error("Error getting subscriptions:", error);
    return {
      success: false,
      message: "Failed to retrieve subscriptions",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single subscription by ID
 * @param id The subscription ID
 */
export async function getSubscriptionById(id: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id, deletedAt: null },
      include: {
        // Include related models as needed
        bank: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!subscription) {
      return {
        success: false,
        message: "Subscription not found",
      };
    }

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error("Error getting subscription:", error);
    return {
      success: false,
      message: "Failed to retrieve subscription",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing subscription
 * @param id The subscription ID
 * @param formData The updated subscription data
 */
export async function updateSubscription(id: string, formData: SubscriptionFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = SubscriptionSchema.parse(formData);

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existingSubscription) {
      return {
        success: false,
        message: "Subscription not found",
      };
    }

    // Update subscription in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...validatedData,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/subscriptions/list");
    revalidatePath(`/saas/subscriptions/${id}`);

    return {
      success: true,
      message: "Subscription updated successfully",
      data: updatedSubscription,
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to update subscription",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Soft delete a subscription
 * @param id The subscription ID
 */
export async function deleteSubscription(id: string): Promise<ActionResponse> {
  try {
    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existingSubscription) {
      return {
        success: false,
        message: "Subscription not found",
      };
    }

    // Soft delete by setting deletedAt
    await prisma.subscription.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/subscriptions/list");

    return {
      success: true,
      message: "Subscription deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return {
      success: false,
      message: "Failed to delete subscription",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
