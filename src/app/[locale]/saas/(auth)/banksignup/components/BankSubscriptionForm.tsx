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
import { SubscriptionCreateInput, SubscriptionCreateSchema } from "@/app/[locale]/saas/(auth)/banksignup/schema";
import { createSubscription, updateBankOnboardingStatus } from "@/app/[locale]/saas/(auth)/banksignup/actions";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionFormProps {
  className?: string;
  bankId: string;
}

export default function SubscriptionForm({ className, bankId }: SubscriptionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  // Pricing configuration based on plan type and billing cycle
  const pricing = {
    BASIC: {
      MONTHLY: 2000,
      ANNUAL: 21600, // 10% discount on yearly
    },
    STANDARD: {
      MONTHLY: 5000,
      ANNUAL: 54000, // 10% discount on yearly
    },
    PREMIUM: {
      MONTHLY: 10000,
      ANNUAL: 108000, // 10% discount on yearly
    },
  };

  // Form setup with Zod resolver
  const form = useForm<SubscriptionCreateInput>({
    resolver: zodResolver(SubscriptionCreateSchema),
    defaultValues: {
      bankId: bankId,
      planType: "STANDARD",
      billingCycle: "MONTHLY",
      startDate: new Date(),
      status: "Active",
      amount: pricing.STANDARD.MONTHLY,
      paymentMethod: { type: "default" },
    },
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
      const response = await createSubscription(data);

      if (!response.success) {
        if (response.errors) {
          Object.entries(response.errors).forEach(([field, msg]) => {
            toast({
              title: `Error in ${field}`,
              description: msg,
              variant: "destructive",
            });
          });
        } else {
          toast({
            title: "Error",
            description: response.message || "Unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      await updateBankOnboardingStatus(bankId, "SUBSCRIPTION_CREATED");
      router.refresh();
      router.push("/saas/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Plan details configuration
  const planDetails = {
    BASIC: {
      title: "Basic",
      badge: "Starter",
      price: billingCycle === "MONTHLY" ? "₹2,000" : "₹21,600",
      description: "Essential features for small businesses",
      features: ["1 user", "Basic reports", "Email support"],
    },
    STANDARD: {
      title: "Startup",
      badge: "Most popular",
      price: billingCycle === "MONTHLY" ? "₹5,000" : "₹54,000",
      description: "All the basics for starting a new business",
      features: ["2 users", "Plan features", "Product support"],
    },
    PREMIUM: {
      title: "Enterprise",
      badge: "Advanced",
      price: billingCycle === "MONTHLY" ? "₹10,000" : "₹108,000",
      description: "Advanced features for established businesses",
      features: ["Unlimited users", "Advanced analytics", "Priority support"],
    },
  };

  // Get current selected plan
  const selectedPlan = form.watch("planType") || "STANDARD";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8", className)}>
        <div className="flex flex-col gap-6">
          {/* Pricing */}
          <Card className="w-full">
            {/* Title */}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Select your subscription</CardTitle>
              <CardDescription>Please select your subscription plan.</CardDescription>
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
                    <FormLabel className="mb-3 block text-center">Plan Type</FormLabel>
                    <Select
                      onValueChange={(value) => handlePlanTypeChange(value as "BASIC" | "STANDARD" | "PREMIUM")}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BASIC">Basic Plan</SelectItem>
                        <SelectItem value="STANDARD">Standard Plan</SelectItem>
                        <SelectItem value="PREMIUM">Premium Plan</SelectItem>
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
                    <Badge className="mb-3 w-max self-center uppercase">{planDetails[selectedPlan].badge}</Badge>
                    <CardTitle className="mb-7">{planDetails[selectedPlan].title}</CardTitle>
                    <span className="text-5xl font-bold">{planDetails[selectedPlan].price}</span>
                  </CardHeader>
                  <CardDescription className="mx-auto w-11/12 text-center">
                    {planDetails[selectedPlan].description}
                  </CardDescription>
                  <CardContent className="flex-1">
                    <ul className="mt-7 space-y-2.5 text-sm">
                      {planDetails[selectedPlan].features.map((feature, index) => (
                        <li key={index} className="flex space-x-2">
                          <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
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
                          Monthly
                        </Label>
                        <FormControl>
                          <Switch
                            id="billing-cycle"
                            checked={field.value === "ANNUAL"}
                            onCheckedChange={handleBillingCycleChange}
                          />
                        </FormControl>
                        <Label htmlFor="billing-cycle" className="relative ms-3">
                          Annual
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
                              <Badge className="mt-3 uppercase">Save up to 10%</Badge>
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
                  {isSubmitting ? "Processing..." : "Subscribe"}
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
