"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useNewLoanApplicationForm } from "../hooks/useNewLoanApplicationForm";
import { Form } from "@/components/ui/form";
import { NewFormFields } from "@/app/[locale]/saas/(private)/loanapplication/components/NewFormFields";

export function NewLoanApplicationForm() {
  const { form, isLoading, onSubmit, handleSendLink } = useNewLoanApplicationForm();

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(
                (data) => {
                  console.log("Form validated successfully");
                  onSubmit(data);
                },
                (errors) => {
                  // This will show exactly which fields are failing validation
                  console.error("Form validation failed:", errors, e);
                },
              )(e);
            }}
            className="flex flex-col gap-6"
          >
            {/* All form fields from the NewFormFields component */}
            <NewFormFields form={form} />

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
