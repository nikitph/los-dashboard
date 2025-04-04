"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

  const { page, validation, buttons, errors, toast: toastMessages, locale } = useFormTranslation("UserCreateForm");
  const userSchema = createUserSchema(validation);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: undefined,
      bankId: bankId || "",
    },
  });

  const {
    setValue,
    setError,
    watch,
    formState: { errors: formErrors },
  } = form;

  React.useEffect(() => {
    if (bankId) setValue("bankId", bankId);
  }, [bankId, setValue]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{page("firstName")}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{page("lastName")}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{page("email")}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{page("phoneNumber")}</FormLabel>
                <FormControl>
                  <Input type="text" {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{page("role")}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder={page("selectRole")} />
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hidden bankId */}
          <input type="hidden" {...form.register("bankId")} />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? buttons("creating") : buttons("create")}
          </Button>

          {/* Form-wide error alerts */}
          {Object.keys(formErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>{errors("formErrors")}</AlertDescription>
            </Alert>
          )}

          {formErrors.root && (
            <Alert variant="destructive">
              <AlertDescription>{formErrors.root.message}</AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </div>
  );
}
