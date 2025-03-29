"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { createBank } from "../actions";
import { cn } from "@/lib/utils";
import { BankCreationFormProps, BankFormValues, createBankSchema } from "@/app/saas/(auth)/banksignup/schema";
import { handleFormErrors } from "@/lib/formErrorHelper";

export function BankCreationForm({ className, setCurrentStep, setBank, ...props }: BankCreationFormProps) {
  const [success, setSuccess] = useState(false);

  const form = useForm<BankFormValues>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      name: "",
      officialEmail: "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: BankFormValues) => {
    try {
      const response = await createBank(data);

      if (!response.success) {
        handleFormErrors(response, setError); // ✅ clean usage
        return;
      }

      setSuccess(true);
      setBank(response.data);
      reset();
      toast({
        title: "Success",
        description: "Bank created successfully",
      });
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>To get started please enter the bank details</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>Bank created successfully! The bank is now in the onboarding process.</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Bank Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="officialEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter the official bank email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Bank..." : "Create Bank"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
