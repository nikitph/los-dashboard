"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

import { createSubscription, updateSubscription } from "../actions";
import { SubscriptionSchema } from "@/schemas/zodSchemas";

type SubscriptionFormValues = z.infer<typeof SubscriptionSchema>;

interface SubscriptionFormProps {
  initialData?: Partial<SubscriptionFormValues> & { id?: string };
  isEditMode?: boolean;
}

export default function SubscriptionForm({ initialData, isEditMode = false }: SubscriptionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [relatedData, setRelatedData] = useState<any>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(SubscriptionSchema),
    defaultValues: {
      bankId: initialData?.bankId || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      status: initialData?.status || "",
      amount: initialData?.amount || 0,
    },
  });

  console.log("errors", errors);
  // Set form values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        const typedKey = key as keyof SubscriptionFormValues;
        if (initialData[typedKey] !== undefined) {
          if (key.endsWith("At") && initialData[typedKey]) {
            // Handle date fields
            setValue(typedKey, new Date(initialData[typedKey] as Date));
          } else {
            setValue(typedKey, initialData[typedKey] as any);
          }
        }
      });
    }
  }, [initialData, setValue]);

  // Fetch related data
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Fetch relation data here
        // const response = await getRelatedData();
        // if (response.success) {
        //   setRelatedData(response.data || {});
        // }
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    };

    fetchRelatedData();
  }, []);

  const onSubmit = async (data: SubscriptionFormValues) => {
    setIsSubmitting(true);
    try {
      let response;

      if (isEditMode && initialData?.id) {
        response = await updateSubscription(initialData.id, data);
      } else {
        response = await createSubscription(data);
      }

      if (response.success) {
        toast({
          title: isEditMode ? "Subscription Updated" : "Subscription Created",
          description: response.message,
        });

        router.push("/saas/subscriptions/list");
      } else {
        toast({
          title: "Error",
          description: response.error || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
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
    <div className="w-full bg-transparent">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold">{isEditMode ? "Edit Subscription" : "Create Subscription"}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Relation Fields */}

          {/*<div className="flex flex-col gap-1">*/}
          {/*  <Label htmlFor="bank">Bank</Label>*/}
          {/*  <Select */}
          {/*    onValueChange={(value) => setValue("bank", value)} */}
          {/*    value={watch("bank")}*/}
          {/*    disabled={false}*/}
          {/*  >*/}
          {/*    <SelectTrigger id="bank" className="w-full">*/}
          {/*      <SelectValue placeholder="Select Bank" />*/}
          {/*    </SelectTrigger>*/}
          {/*    <SelectContent>*/}
          {/*      /!* Populate with related items *!/*/}
          {/*      <SelectItem value="placeholder">Select...</SelectItem>*/}
          {/*    </SelectContent>*/}
          {/*  </Select>*/}
          {/*  {errors.bank && <p className="mt-1 text-sm text-red-600">{errors.bank?.message}</p>}*/}
          {/*</div>*/}

          {/* String Fields */}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bankId">Bank Id</Label>
              <Input id="bankId" {...register("bankId")} placeholder="Enter bank id" />
              {errors.bankId && <p className="mt-1 text-sm text-red-600">{errors.bankId?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" {...register("status")} placeholder="Enter status" />
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status?.message}</p>}
            </div>
          </div>

          {/* Number Fields */}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Enter amount"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount?.message}</p>}
          </div>

          {/* Date Fields */}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate", {
                  setValueAs: (value) => (value ? new Date(value) : undefined),
                })}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate?.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deletedAt">Deleted At</Label>
            <Input
              id="deletedAt"
              type="date"
              {...register("deletedAt", {
                setValueAs: (value) => (value ? new Date(value) : undefined),
              })}
            />
            {errors.deletedAt && <p className="mt-1 text-sm text-red-600">{errors.deletedAt?.message}</p>}
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/saas/subscriptions/list")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : isEditMode ? "Update Subscription" : "Create Subscription"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
