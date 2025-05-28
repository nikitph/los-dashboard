"use server";

import { razorpay } from "../razorpay";
import { prisma } from "@/lib/prisma/prisma";
import { getServerSessionUser } from "@/lib/getServerUser";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { addMonths } from "date-fns";

// Types for better type safety
type PaymentType = "INITIAL" | "RENEWAL" | "UPGRADE" | "DOWNGRADE" | "ADDON";

interface CreatePaymentResult {
  success: boolean;
  data?: {
    orderId: string;
    amount: string;
    currency: string;
    subscriptionPaymentId: string;
    invoiceId: string;
    bankName: string;
    planType: string;
    billingCycle: string;
  };
  error?: string;
}

interface VerifyPaymentResult {
  success: boolean;
  data?: {
    subscriptionId: string;
    bankName: string;
    newEndDate: string;
  };
  error?: string;
}

/**
 * Create a new subscription payment with invoice
 *
 * @param subscriptionId - The ID of the subscription to create payment for
 * @param paymentType - Type of payment (INITIAL, RENEWAL, UPGRADE, etc.)
 * @returns Promise<CreatePaymentResult> - Payment creation result with Razorpay order details
 */
export async function createSubscriptionPayment(
  subscriptionId: string,
  paymentType: PaymentType = "RENEWAL",
): Promise<CreatePaymentResult> {
  try {
    // Get authenticated user
    const user = await getServerSessionUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    let subscription = await prisma.subscription.findUnique({
      where: { bankId: user.currentRole.bankId },
    });

    if (!subscription) {
      return { success: false, error: "Something went wrong in subscription creation" };
    }

    // Calculate billing period
    const now = new Date();
    const billingPeriodStart = now;
    const billingPeriodEnd = new Date(now);

    if (subscription.billingCycle === "MONTHLY") {
      billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);
    } else {
      billingPeriodEnd.setFullYear(billingPeriodEnd.getFullYear() + 1);
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(subscription.amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `sub_${subscription.id}_${Date.now()}`.slice(0, 35),
      notes: {
        subscriptionId: subscription.id,
        bankId: subscription.bankId,
        bankName: subscription.bankId,
        paymentType,
        billingCycle: subscription.billingCycle,
      },
    });

    // Create NEW invoice for this payment attempt
    const invoice = await prisma.subscriptionInvoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber: `INV--${Date.now()}-${subscription.bankId.replace(/\s+/g, "").toUpperCase()}`.slice(0, 35),
        amount: Math.round(subscription.amount * 100),
        totalAmount: Math.round(subscription.amount * 100),
        currency: "INR",
        description: `${subscription.planType} plan - ${subscription.billingCycle} billing (${paymentType})`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        billingPeriodStart,
        billingPeriodEnd,
        status: "SENT",
      },
    });

    // Create subscription payment record linked to the NEW invoice
    const subscriptionPayment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        subscriptionInvoiceId: invoice.id, // Link to the new invoice
        amount: Math.round(subscription.amount * 100),
        currency: "INR",
        paymentType: paymentType,
        razorpayOrderId: razorpayOrder.id,
        billingPeriodStart,
        billingPeriodEnd,
      },
    });

    // Revalidate relevant pages
    revalidatePath(`/admin/subscriptions/${subscriptionId}`);
    revalidatePath("/admin/subscriptions");

    return {
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: String(razorpayOrder.amount),
        currency: razorpayOrder.currency,
        subscriptionPaymentId: subscriptionPayment.id,
        invoiceId: invoice.id,
        bankName: subscription.bankId,
        planType: subscription.planType,
        billingCycle: subscription.billingCycle,
      },
    };
  } catch (error) {
    console.error("Error creating subscription payment:", error);
    return {
      success: false,
      error: "Failed to create subscription payment",
    };
  }
}

/**
 * Verify subscription payment after Razorpay callback
 *
 * @param razorpayOrderId - Razorpay order ID from payment response
 * @param razorpayPaymentId - Razorpay payment ID from payment response
 * @param razorpaySignature - Razorpay signature for verification
 * @returns Promise<VerifyPaymentResult> - Verification result with subscription details
 */
export async function verifySubscriptionPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<VerifyPaymentResult> {
  try {
    // Verify signature
    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature !== expectedSign) {
      return { success: false, error: "Invalid payment signature" };
    }

    // Find the subscription payment
    const subscriptionPayment = await prisma.subscriptionPayment.findUnique({
      where: { razorpayOrderId },
      include: {
        subscription: {
          include: { bank: true },
        },
        subscriptionInvoice: true,
      },
    });

    if (!subscriptionPayment) {
      return { success: false, error: "Payment record not found" };
    }

    // Update payment record
    await prisma.subscriptionPayment.update({
      where: { id: subscriptionPayment.id },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: "SUCCESS",
      },
    });

    // Update invoice
    if (subscriptionPayment.subscriptionInvoice) {
      await prisma.subscriptionInvoice.update({
        where: { id: subscriptionPayment.subscriptionInvoice.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });
    }

    // Update subscription status and extend end date
    const subscription = subscriptionPayment.subscription;
    const baseDate = subscription.endDate && subscription.endDate > new Date() ? subscription.endDate : new Date();
    const newEndDate = addMonths(baseDate, 1);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
        endDate: newEndDate,
      },
    });

    // Revalidate relevant pages
    revalidatePath(`/admin/subscriptions/${subscription.id}`);
    revalidatePath("/admin/subscriptions");
    revalidatePath(`/bank/${subscription.bankId}/subscription`);
    revalidatePath(`/en/saas/billingsettings`);

    return {
      success: true,
      data: {
        subscriptionId: subscription.id,
        bankName: subscription.bank.name,
        newEndDate: newEndDate.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error verifying subscription payment:", error);
    return {
      success: false,
      error: "Payment verification failed",
    };
  }
}

/**
 * Handle failed payment - mark as failed and update statuses
 *
 * @param razorpayOrderId - Razorpay order ID of the failed payment
 * @param failureReason - Optional reason for payment failure
 * @returns Promise with success/error status
 */
export async function handleFailedPayment(
  razorpayOrderId: string,
  failureReason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the failed payment
    const failedPayment = await prisma.subscriptionPayment.findUnique({
      where: { razorpayOrderId },
      include: {
        subscription: { include: { bank: true } },
        subscriptionInvoice: true,
      },
    });

    if (!failedPayment) {
      return { success: false, error: "Payment record not found" };
    }

    // Update the failed payment
    await prisma.subscriptionPayment.update({
      where: { id: failedPayment.id },
      data: {
        status: "FAILED",
        failureReason,
      },
    });

    // Mark the associated invoice as overdue
    if (failedPayment.subscriptionInvoice) {
      await prisma.subscriptionInvoice.update({
        where: { id: failedPayment.subscriptionInvoice.id },
        data: {
          status: "OVERDUE",
        },
      });
    }

    // Update subscription status
    await prisma.subscription.update({
      where: { id: failedPayment.subscriptionId },
      data: {
        status: "PAST_DUE",
      },
    });

    // Revalidate relevant pages
    revalidatePath(`/admin/subscriptions/${failedPayment.subscriptionId}`);
    revalidatePath("/admin/subscriptions");

    return { success: true };
  } catch (error) {
    console.error("Error handling failed payment:", error);
    return { success: false, error: "Failed to handle payment failure" };
  }
}

/**
 * Get subscription payment history for admin dashboard
 *
 * @param subscriptionId - ID of the subscription to get payment history for
 * @returns Array of payment records with invoice details
 */
export async function getSubscriptionPaymentHistory(subscriptionId: string) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const payments = await prisma.subscriptionPayment.findMany({
      where: {
        subscriptionId,
      },
      include: {
        subscriptionInvoice: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return payments;
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw new Error("Failed to fetch payment history");
  }
}

/**
 * Get pending invoices for a subscription
 *
 * @param subscriptionId - ID of the subscription to get pending invoices for
 * @returns Array of pending invoice records
 */
export async function getPendingInvoices(subscriptionId: string) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const pendingInvoices = await prisma.subscriptionInvoice.findMany({
      where: {
        subscriptionId,
        status: {
          in: ["SENT", "OVERDUE", "PAID"],
        },
      },
      include: {
        subscriptionPayment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return pendingInvoices;
  } catch (error) {
    console.error("Error fetching pending invoices:", error);
    throw new Error("Failed to fetch pending invoices");
  }
}
