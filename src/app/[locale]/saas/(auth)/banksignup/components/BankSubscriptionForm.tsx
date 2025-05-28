"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  generateSubscriptionCreateSchema,
  PlanDetails,
  SubscriptionCreateInput
} from "@/app/[locale]/saas/(auth)/banksignup/schema";
import { createSubscription, updateBankOnboardingStatus } from "@/app/[locale]/saas/(auth)/banksignup/actions";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { useFormTranslation } from "@/hooks/useFormTranslation";
import { createSubscriptionPayment, verifySubscriptionPayment } from "@/lib/razorpay/actions/subscription";
import { toastSuccess } from "@/lib/toastUtils";

interface SubscriptionFormProps {
  className?: string;
  bankId: string;
}

export default function BankSubscriptionForm({ className, bankId }: SubscriptionFormProps) {
  const router = useRouter();
  const { page, buttons, errors, toast, validation, locale } = useFormTranslation("BankSubscriptionForm");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  // Pricing configuration based on plan type and billing cycle
  const pricing = {
    BASIC: {
      MONTHLY: 2000,
      ANNUAL: 21600 // 10% discount on yearly
    },
    STANDARD: {
      MONTHLY: 5000,
      ANNUAL: 54000 // 10% discount on yearly
    },
    PREMIUM: {
      MONTHLY: 10000,
      ANNUAL: 108000 // 10% discount on yearly
    }
  };

  const subscriptionSchema = generateSubscriptionCreateSchema(validation);

  // Form setup with Zod resolver
  const form = useForm<SubscriptionCreateInput>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      bankId: bankId,
      planType: "STANDARD",
      billingCycle: "MONTHLY",
      startDate: new Date(),
      status: "Active",
      amount: pricing.STANDARD.MONTHLY,
      paymentMethod: { type: "default" }
    }
  });

  // Handle billing cycle switch
  const handleBillingCycleChange = (checked: boolean) => {
    const newCycle = checked ? "ANNUAL" : "MONTHLY";
    setBillingCycle(newCycle);
    const currentPlan = form.getValues("planType");
    form.setValue("billingCycle", newCycle);
    form.setValue("amount", pricing[currentPlan][newCycle]);
  };

  // Handle plan type change
  const handlePlanTypeChange = (value: "BASIC" | "STANDARD" | "PREMIUM") => {
    form.setValue("planType", value);
    form.setValue("amount", pricing[value][billingCycle]);
  };

  // Form submission handler
  const onSubmit = async (data: SubscriptionCreateInput) => {
    setIsSubmitting(true);
    try {
      const response = await createSubscription(data, locale);

      if (!response.success) {
        handleFormErrors(response, form.setError);
        setIsSubmitting(false);
        return;
      }

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
      const paymentResult = await createSubscriptionPayment(response.data.id, "INITIAL");

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
        description: `${data.planType} Plan - ${billingCycle} Subscription`,
        order_id: paymentData.orderId,
        handler: async function(response: any) {
          try {
            // Verify payment using server action
            const verifyResult = await verifySubscriptionPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (!verifyResult.success) {
              throw new Error(verifyResult.error || "Payment verification failed");
            }

            toastSuccess({ title: "Payment was successful", description: response.razorpay_payment_id });
            await updateBankOnboardingStatus(bankId, "SUBSCRIPTION_CREATED");
            router.refresh();
            router.push("/en/saas/dashboard");
          } catch (error) {
            console.error("Payment verification error:", error);
          }
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: bankId,
          email: "admin@" + bankId.toLowerCase().replace(/\s+/g, "") + ".com"
        },
        theme: {
          color: "#3399cc"
        },
        notes: {
          subscriptionId: response.data.id,
          bankName: bankId,
          planType: data.planType,
          billingCycle
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function(response: any) {
        console.error("Payment failed:", response.error);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (error) {
      form.setError("root", {
        type: "manual",
        message: errors("unexpected")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Plan details configuration with translations
  const getPlanDetails = (planType: "BASIC" | "STANDARD" | "PREMIUM"): PlanDetails => {
    const planKey = planType.toLowerCase();
    return {
      title: page(`plans.${planKey}.title`),
      badge: page(`plans.${planKey}.badge`),
      selectLabel: page(`plans.${planKey}.selectLabel`),
      priceMonthly: page(`plans.${planKey}.priceMonthly`),
      priceAnnual: page(`plans.${planKey}.priceAnnual`),
      description: page(`plans.${planKey}.description`),
      feature1: page(`plans.${planKey}.feature1`),
      feature2: page(`plans.${planKey}.feature2`),
      feature3: page(`plans.${planKey}.feature3`)
    };
  };

  // Get current selected plan
  const selectedPlan = form.watch("planType") || "STANDARD";
  const planDetails = getPlanDetails(selectedPlan as "BASIC" | "STANDARD" | "PREMIUM");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8", className)}>
        <div className="flex flex-col gap-6">
          {/* Pricing */}
          <Card className="w-full">
            {/* Title */}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{page("title")}</CardTitle>
              <CardDescription>{page("description")}</CardDescription>
            </CardHeader>
            {/* End Title */}
            {/* Switch */}
            <CardContent>
              {/* Plan Type Selection */}
              <FormField
                control={form.control}
                name="planType"
                render={({ field }) => (
                  <FormItem className="mb-8">
                    <FormLabel className="mb-3 block text-center">{page("planTypeLabel")}</FormLabel>
                    <Select
                      onValueChange={(value) => handlePlanTypeChange(value as "BASIC" | "STANDARD" | "PREMIUM")}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={page("selectPlanPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BASIC">{page("plans.basic.selectLabel")}</SelectItem>
                        <SelectItem value="STANDARD">{page("plans.standard.selectLabel")}</SelectItem>
                        <SelectItem value="PREMIUM">{page("plans.premium.selectLabel")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grid */}
              <div className="grid gap-2 sm:grid-cols-1 lg:grid-cols-1 lg:items-center">
                {/* Card */}
                <Card className="flex flex-col border-muted">
                  <CardHeader className="pb-2 text-center">
                    <Badge className="mb-3 w-max self-center uppercase">{planDetails.badge}</Badge>
                    <CardTitle className="mb-7">{planDetails.title}</CardTitle>
                    <span className="text-5xl font-bold">
                      {billingCycle === "MONTHLY" ? planDetails.priceMonthly : planDetails.priceAnnual}
                    </span>
                  </CardHeader>
                  <CardDescription className="mx-auto w-11/12 text-center">{planDetails.description}</CardDescription>
                  <CardContent className="flex-1">
                    <ul className="mt-7 space-y-2.5 text-sm">
                      <li className="flex space-x-2">
                        <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span className="text-muted-foreground">{planDetails.feature1}</span>
                      </li>
                      <li className="flex space-x-2">
                        <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span className="text-muted-foreground">{planDetails.feature2}</span>
                      </li>
                      <li className="flex space-x-2">
                        <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span className="text-muted-foreground">{planDetails.feature3}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                {/* End Card */}
              </div>
              {/* End Grid */}
              <div className="mt-12 flex items-center justify-center">
                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <Label htmlFor="billing-cycle" className="me-3">
                          {page("monthlyLabel")}
                        </Label>
                        <FormControl>
                          <Switch
                            id="billing-cycle"
                            checked={field.value === "ANNUAL"}
                            onCheckedChange={handleBillingCycleChange}
                          />
                        </FormControl>
                        <Label htmlFor="billing-cycle" className="relative ms-3">
                          {page("annualLabel")}
                          <span className="absolute -end-28 -top-10 start-auto">
                            <span className="flex items-center">
                              <svg
                                className="-me-6 h-8 w-14"
                                width={45}
                                height={25}
                                viewBox="0 0 45 25"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M43.2951 3.47877C43.8357 3.59191 44.3656 3.24541 44.4788 2.70484C44.5919 2.16427 44.2454 1.63433 43.7049 1.52119L43.2951 3.47877ZM4.63031 24.4936C4.90293 24.9739 5.51329 25.1423 5.99361 24.8697L13.8208 20.4272C14.3011 20.1546 14.4695 19.5443 14.1969 19.0639C13.9242 18.5836 13.3139 18.4152 12.8336 18.6879L5.87608 22.6367L1.92723 15.6792C1.65462 15.1989 1.04426 15.0305 0.563943 15.3031C0.0836291 15.5757 -0.0847477 16.1861 0.187863 16.6664L4.63031 24.4936ZM43.7049 1.52119C32.7389 -0.77401 23.9595 0.99522 17.3905 5.28788C10.8356 9.57127 6.58742 16.2977 4.53601 23.7341L6.46399 24.2659C8.41258 17.2023 12.4144 10.9287 18.4845 6.96211C24.5405 3.00476 32.7611 1.27399 43.2951 3.47877L43.7049 1.52119Z"
                                  fill="currentColor"
                                  className="text-muted-foreground"
                                />
                              </svg>
                              <Badge className="mt-3 uppercase">{page("savingsLabel")}</Badge>
                            </span>
                          </span>
                        </Label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* End Switch */}

              {/* Additional form fields */}
              <div className="mt-8 space-y-4">
                {/* Hidden Fields */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <input
                          type="hidden"
                          name={field.name}
                          value={field.value instanceof Date ? field.value.toISOString() : ""}
                          ref={field.ref}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankId"
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => <input type="hidden" {...field} />}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => <input type="hidden" {...field} />}
                />
              </div>

              <div className="mt-8 flex w-full justify-center align-middle">
                <Button type="submit" className="w-[120px]" disabled={isSubmitting}>
                  {isSubmitting ? buttons("processing") : buttons("subscribe")}
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* End Pricing */}
        </div>
      </form>
    </Form>
  );
}
