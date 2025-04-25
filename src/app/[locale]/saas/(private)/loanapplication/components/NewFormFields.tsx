"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { NewLoanApplicationInput } from "@/app/[locale]/saas/(private)/loanapplication/schemas/loanApplicationSchema";

interface NewFormFieldsProps {
  form: UseFormReturn<NewLoanApplicationInput>;
}

export function NewFormFields({ form }: NewFormFieldsProps) {
  return (
    <>
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
        name="amountRequested"
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

      {/* Hidden Bank ID field */}
      <FormField control={form.control} name="bankId" render={({ field }) => <input type="hidden" {...field} />} />
    </>
  );
}
