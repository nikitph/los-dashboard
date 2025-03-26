"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { createBank } from "./actions";
import { cn } from "@/lib/utils";
import { BankSchema } from "@/schemas/zodSchemas";

type BankFormValues = {
  name: string;
  officialEmail: string;
};

export function BankCreationForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const formSchema = z.object({
    name: BankSchema.shape.name,
    officialEmail: BankSchema.shape.officialEmail,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BankFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      officialEmail: "",
    },
  });

  const onSubmit = async (data: BankFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await createBank(data);

      if (response.success) {
        setSuccess(true);
        reset();
        toast({
          title: "Success",
          description: "Bank created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create bank",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating bank:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Add New Bank</CardTitle>
          <CardDescription>Please enter the bank details</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <AlertDescription>Bank created successfully! The bank is now in the onboarding process.</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Bank Name</Label>
                  <Input id="name" placeholder="Enter Bank Name" {...register("name")} />
                  {errors.name && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.name.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="officialEmail">Official Email</Label>
                  <Input
                    id="officialEmail"
                    type="email"
                    placeholder="Please enter the official bank email for correspondence"
                    {...register("officialEmail")}
                  />
                  {errors.officialEmail && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.officialEmail.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Bank..." : "Create Bank"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
