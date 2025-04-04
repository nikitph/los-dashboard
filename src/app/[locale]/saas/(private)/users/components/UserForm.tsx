"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { createUser } from "@/app/[locale]/saas/(private)/users/actions";

import { useFormTranslation } from "@/hooks/useFormTranslation";
import { handleFormErrors } from "@/lib/formErrorHelper";
import { createUserSchema, UserFormValues } from "@/app/[locale]/saas/(private)/users/schema";
import { toastError, toastSuccess } from "@/lib/toastUtils";

interface UserFormProps {
  bankId?: string;
}

export default function UserForm({ bankId }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Load translations
  const { page, validation, buttons, errors, toast: toastMessages, locale } = useFormTranslation("UserCreateForm");
  const userSchema = createUserSchema(validation);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors: formErrors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "USER",
      bankId: bankId || "",
    },
  });

  // If bankId changes (e.g., after context load), update the form
  React.useEffect(() => {
    if (bankId) {
      setValue("bankId", bankId);
    }
  }, [bankId, setValue]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);

    try {
      console.log("Creating user with data:", data);

      const response = await createUser(data, locale);
      if (!response.success) {
        handleFormErrors(response, setError);
        return;
      }
      toastSuccess({
        title: toastMessages("successTitle"),
        description: response.message || toastMessages("successDescription"),
      });
      router.push(`${locale}/saas/users/list`);
      router.refresh();
    } catch (error) {
      console.error("Error creating user:", error);
      toastError({
        title: toastMessages("errorTitle"),
        description: errors("unexpected"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-left max-w-2xl bg-transparent">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              {page("firstName")}
            </Label>
            <Input id="firstName" type="text" className="mt-1 bg-white" {...register("firstName")} />
            {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              {page("lastName")}
            </Label>
            <Input id="lastName" type="text" className="mt-1 bg-white" {...register("lastName")} />
            {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {page("email")}
          </Label>
          <Input id="email" type="email" className="mt-1 bg-white" {...register("email")} />
          {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email.message}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            {page("phoneNumber")}
          </Label>
          <Input id="phoneNumber" type="text" className="mt-1 bg-white" {...register("phoneNumber")} />
          {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber.message}</p>}
        </div>

        {/* Role */}
        <div>
          <Label htmlFor="role" className="block text-sm font-medium text-gray-700">
            {page("role")}
          </Label>
          <Select
            onValueChange={(value) => {
              setValue("role", value);
            }}
            value={watch("role")}
          >
            <SelectTrigger className="mt-1 bg-white">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="CLERK">CLERK</SelectItem>
                <SelectItem value="INSPECTOR">INSPECTOR</SelectItem>
                <SelectItem value="LOAN_OFFICER">LOAN OFFICER</SelectItem>
                <SelectItem value="CEO">CEO</SelectItem>
                <SelectItem value="LOAN_COMMITTEE">LOAN COMMITTEE MEMBER</SelectItem>
                <SelectItem value="BOARD">BOARD MEMBER</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {formErrors.role && <p className="mt-1 text-sm text-red-600">{formErrors.role.message}</p>}
        </div>

        {/* Hidden bankId (if needed) */}
        <input type="hidden" {...register("bankId")} />

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? buttons("creating") : buttons("create")}
        </Button>

        {/* Show an alert if there are form errors */}
        {Object.keys(formErrors).length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>{errors("formErrors")}</AlertDescription>
          </Alert>
        )}

        {/* Show root error if present */}
        {formErrors.root && (
          <Alert variant="destructive">
            <AlertDescription>{formErrors.root.message}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
