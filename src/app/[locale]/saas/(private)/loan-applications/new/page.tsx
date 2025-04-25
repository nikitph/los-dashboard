"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createInitialLoanApplication } from "../actions";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUser } from "@/contexts/userContext";
import { loanFormSchema, LoanFormValues } from "@/app/[locale]/saas/(private)/loan-applications/schema";
import { useLocale } from "next-intl";

export default function LoanStreamPage() {
  const [isLoading, setIsLoading] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Initialize react-hook-form with zod resolver
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      loanType: undefined,
      requestedAmount: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
    },
  });

  const handleSendLink = () => {
    toast({
      title: "Info",
      description: "Send Link functionality to be implemented",
      variant: "default",
    });
  };

  const onSubmit = async (data: LoanFormValues) => {
    setIsLoading(true);
    try {
      const result = await createInitialLoanApplication({
        ...data,
        bankId: currentUser?.currentRole.bankId,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });

        router.push(`/${locale}/saas/personal?lid=${result.data.id}`);
      } else {
        toast({
          title: "Error",
          description: result.error || result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating loan application:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create loan application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-default-background w-full px-6 py-12">
      <div className="mx-auto flex max-w-[600px] flex-col gap-12">
        {/* Heading */}
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold">New Loan Application</span>
          <span className="text-sm text-gray-500">
            Fill in the customer&#39;s basic information to begin the application process
          </span>
        </div>

        {/* Form Fields */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Loan Type Select */}
            <FormField
              control={form.control}
              name="loanType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Loan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERSONAL">Personal</SelectItem>
                      <SelectItem value="VEHICLE">Vehicle</SelectItem>
                      <SelectItem value="HOUSE_CONSTRUCTION">House Construction</SelectItem>
                      <SelectItem value="PLOT_PURCHASE">Plot Purchase</SelectItem>
                      <SelectItem value="MORTGAGE">Mortgage</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requested Amount */}
            <FormField
              control={form.control}
              name="requestedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requested Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter desired loan amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* First + Last Name */}
            <div className="flex w-full items-start gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Address */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="mt-6 flex w-full items-center gap-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={handleSendLink}>
                Send Link
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Processing..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
