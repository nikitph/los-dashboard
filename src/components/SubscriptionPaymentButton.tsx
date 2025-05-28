"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubscriptionPayment, verifySubscriptionPayment } from "@/lib/razorpay/actions/subscription";
import { toastSuccess } from "@/lib/toastUtils";

interface SubscriptionPaymentButtonProps {
  subscriptionId: string;
  paymentType?: "INITIAL" | "RENEWAL" | "UPGRADE";
  bankName: string;
  amount: number;
  planType: string;
  billingCycle: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Subscription payment button component that handles Razorpay integration
 * for SaaS subscription billing. Creates new invoices for each payment attempt
 * following the "new invoice per retry" strategy.
 *
 * @param props - Component props for payment processing
 * @returns JSX.Element - Payment button with integrated Razorpay checkout
 */
export default function SubscriptionPaymentButton({
  subscriptionId,
  paymentType = "RENEWAL",
  bankName,
  amount,
  planType,
  billingCycle,
  onSuccess,
  onError,
}: SubscriptionPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Handles the payment process by creating a new invoice, initializing Razorpay,
   * and processing the payment verification
   */
  const handlePayment = async () => {
    try {
      setLoading(true);

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Create subscription payment using server action
      const paymentResult = await createSubscriptionPayment(subscriptionId, paymentType);

      if (!paymentResult.success || !paymentResult.data) {
        throw new Error(paymentResult.error || "Failed to create subscription payment");
      }

      const paymentData = paymentResult.data;

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "CreditIQ",
        description: `${planType} Plan - ${billingCycle} Subscription`,
        order_id: paymentData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment using server action
            const verifyResult = await verifySubscriptionPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );

            if (!verifyResult.success) {
              throw new Error(verifyResult.error || "Payment verification failed");
            }

            toastSuccess({ title: "Payment was successful", description: response.razorpay_payment_id });
            setLoading(false);
          } catch (error) {
            console.error("Payment verification error:", error);
            if (onError) {
              onError("Payment verification failed");
            }
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        prefill: {
          name: bankName,
          email: "admin@" + bankName.toLowerCase().replace(/\s+/g, "") + ".com",
        },
        theme: {
          color: "#3399cc",
        },
        notes: {
          subscriptionId,
          bankName,
          planType,
          billingCycle,
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        if (onError) {
          onError(response.error.description || "Payment failed");
        }
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      if (onError) {
        onError("Failed to initialize payment");
      }
      setLoading(false);
    }
  };

  /**
   * Gets appropriate button text based on payment type and loading state
   */
  const getButtonText = () => {
    if (loading) return "Processing...";

    switch (paymentType) {
      case "INITIAL":
        return `Subscribe - ₹${amount}`;
      case "RENEWAL":
        return `Renew Subscription - ₹${amount}`;
      case "UPGRADE":
        return `Upgrade Plan - ₹${amount}`;
      default:
        return `Pay ₹${amount}`;
    }
  };

  /**
   * Gets appropriate button color based on payment type
   */
  const getButtonColor = () => {
    switch (paymentType) {
      case "INITIAL":
        return "bg-green-600 hover:bg-green-700";
      case "RENEWAL":
        return "bg-black hover:bg-gray-800";
      case "UPGRADE":
        return "bg-purple-600 hover:bg-purple-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`${getButtonColor()} rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:bg-gray-400`}
    >
      {getButtonText()}
    </button>
  );
}
