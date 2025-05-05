"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getLoanObligations, submitLoanObligationsForm } from "@/app/[locale]/saas/(private)/loanobligations/actions";
import { useLocale } from "next-intl";

// Define Zod schema for validation (same as in actions.ts)
const loanSchema = z.object({
  outstandingLoan: z.string().refine((val) => !isNaN(Number(val)) && val !== "", {
    message: "Must be a valid number",
  }),
  emiAmount: z.string().refine((val) => !isNaN(Number(val)) && val !== "", {
    message: "Must be a valid number",
  }),
  loanDate: z.string().min(1, { message: "Loan date is required" }),
  loanType: z.string().min(1, { message: "Loan type is required" }),
  bankName: z.string().min(1, { message: "Bank name is required" }),
});

const formSchema = z.object({
  cibilScore: z
    .string()
    .refine((val) => !isNaN(Number(val)) && val !== "", {
      message: "CIBIL score must be a valid number",
    })
    .refine((val) => Number(val) >= 300 && Number(val) <= 900, {
      message: "CIBIL score must be between 300 and 900",
    }),
  loans: z.array(loanSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface LoanObligationsFormProps {
  applicantId: string;
  loanapplicationId: string;
  initialData?: FormValues;
}

export default function LoanObligationsForm({ applicantId, loanapplicationId, initialData }: LoanObligationsFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverErrors, setServerErrors] = React.useState<Record<string, string> | null>(null);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      cibilScore: "",
      loans: [{ outstandingLoan: "", emiAmount: "", loanDate: "", loanType: "", bankName: "" }],
    },
    mode: "onBlur",
  });

  // Set up field array for dynamic loans
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "loans",
  });

  // Watch for changes to calculate totals
  const loans = form.watch("loans");

  // Fetch initial data if not provided through props
  useEffect(() => {
    if (!initialData) {
      const fetchData = async () => {
        const response = await getLoanObligations(applicantId);
        if (response.success && response.data) {
          form.reset(response.data);
        } else if (!response.success) {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
      };

      fetchData();
    }
  }, [applicantId, form, initialData, toast]);

  // Calculate totals
  const calculateTotalLoan = () => {
    return loans.reduce((total, loan) => total + Number(loan.outstandingLoan || 0), 0);
  };

  const calculateTotalEmi = () => {
    return loans.reduce((total, loan) => total + Number(loan.emiAmount || 0), 0);
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setServerErrors(null);

    try {
      const response = await submitLoanObligationsForm(applicantId, data);

      console.log("response", response);

      if (response.success) {
        router.push(`/${locale}/saas/income?aid=${applicantId}&lid=${loanapplicationId}`);
      }

      // If we get here, it means we didn't redirect, so there must be an error
      if (!response.success && response.errors) {
        setServerErrors(response.errors);

        // Set form errors from server response
        Object.entries(response.errors).forEach(([path, message]) => {
          form.setError(path as any, {
            type: "server",
            message,
          });
        });

        toast({
          title: "Form Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Existing Loan Obligations</h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* CIBIL Score */}
        <div className="mb-6">
          <Label htmlFor="cibilScore" className="mb-2 block">
            CIBIL Score
          </Label>
          <Input id="cibilScore" className="max-w-[240px]" {...form.register("cibilScore")} />
          {form.formState.errors.cibilScore && (
            <p className="mt-1 text-sm text-red-500">{form.formState.errors.cibilScore.message}</p>
          )}
        </div>

        {/* Loans Table */}
        <div className="mb-6 overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-12 border p-2 text-left"></th>
                <th className="border p-2 text-left">Outstanding Loan</th>
                <th className="border p-2 text-left">EMI Amount</th>
                <th className="border p-2 text-left">Loan Date</th>
                <th className="border p-2 text-left">Loan Type</th>
                <th className="border p-2 text-left">Name of Bank</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="border p-2">{index + 1}.</td>
                  <td className="border p-2">
                    <Input {...form.register(`loans.${index}.outstandingLoan`)} type="text" />
                    {form.formState.errors.loans?.[index]?.outstandingLoan && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.loans[index]?.outstandingLoan?.message}
                      </p>
                    )}
                  </td>
                  <td className="border p-2">
                    <Input {...form.register(`loans.${index}.emiAmount`)} type="text" />
                    {form.formState.errors.loans?.[index]?.emiAmount && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.loans[index]?.emiAmount?.message}
                      </p>
                    )}
                  </td>
                  <td className="border p-2">
                    <Input {...form.register(`loans.${index}.loanDate`)} type="date" placeholder="dd/mm/yyyy" />
                    {form.formState.errors.loans?.[index]?.loanDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.loans[index]?.loanDate?.message}
                      </p>
                    )}
                  </td>
                  <td className="border p-2">
                    <Input {...form.register(`loans.${index}.loanType`)} type="text" />
                    {form.formState.errors.loans?.[index]?.loanType && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.loans[index]?.loanType?.message}
                      </p>
                    )}
                  </td>
                  <td className="border p-2">
                    <Input {...form.register(`loans.${index}.bankName`)} type="text" />
                    {form.formState.errors.loans?.[index]?.bankName && (
                      <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.loans[index]?.bankName?.message}
                      </p>
                    )}
                  </td>
                  <td className="border p-2">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button
          type="button"
          variant="link"
          onClick={() => append({ outstandingLoan: "", emiAmount: "", loanDate: "", loanType: "", bankName: "" })}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          + add more
        </Button>

        {/* Totals */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="totalLoan" className="mb-2 block">
              Total Loan
            </Label>
            <Input type="text" id="totalLoan" className="bg-gray-50" value={calculateTotalLoan()} readOnly />
          </div>
          <div>
            <Label htmlFor="totalEmi" className="mb-2 block">
              Total existing EMI
            </Label>
            <Input type="text" id="totalEmi" className="bg-gray-50" value={calculateTotalEmi()} readOnly />
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button type="submit" variant="default" className="bg-black text-white" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Proceed to Income Details"}
          </Button>
        </div>
      </form>
    </div>
  );
}
