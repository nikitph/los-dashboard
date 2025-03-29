"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createBank } from "../actions";
import { cn } from "@/lib/utils";
import { BankCreationFormProps, BankFormValues, createBankSchema } from "@/app/saas/(auth)/banksignup/schema";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { toastError, toastSuccess } from "@/lib/toastUtils";

export function BankCreationForm({ className, setCurrentStep, setBank, ...props }: BankCreationFormProps) {
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
        handleFormErrors(response, setError);
        return;
      }
      setBank(response.data);
      toastSuccess({
        title: "Success",
        description: "Bank created successfully",
      });
      setCurrentStep(1);
    } catch (error) {
      toastError({
        title: "Error",
        description: "An unexpected error occurred",
      });
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
