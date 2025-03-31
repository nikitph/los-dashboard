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
import { toast } from "@/hooks/use-toast";

import { createUser } from "@/app/[locale]/saas/(private)/users/actions";
import { CreateUserFormValues, CreateUserSchema } from "@/app/[locale]/saas/(private)/users/schema"; // Adjust path
// If you have a typed enum from Prisma:
// import { RoleType } from "@prisma/client";

// -------------------------
// 1) Define the Zod schema
// -------------------------

interface UserFormProps {
  bankId?: string; // passed in if you want to link user to a bank
  // If you want an edit mode, you could add `initialData?: Partial<CreateUserFormValues>` and `isEditMode?: boolean`
}

export default function UserForm({ bankId }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(CreateUserSchema),
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

  // -----------------------------------
  // 3) Submit handler
  // -----------------------------------
  const onSubmit = async (data: CreateUserFormValues) => {
    setIsSubmitting(true);

    try {
      // Debug: see the form data
      console.log("Creating user with data:", data);

      const response = await createUser(data);
      if (response.success) {
        toast({
          title: "User Created",
          description: response.message || "User created successfully.",
        });
        router.push("/saas/users/list"); // Adjust to your user list route
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
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
    <div className="bg-transparent">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </Label>
            <Input id="firstName" type="text" className="mt-1 bg-white" {...register("firstName")} />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </Label>
            <Input id="lastName" type="text" className="mt-1 bg-white" {...register("lastName")} />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input id="email" type="email" className="mt-1 bg-white" {...register("email")} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            Phone Number
          </Label>
          <Input id="phoneNumber" type="text" className="mt-1 bg-white" {...register("phoneNumber")} />
          {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
        </div>

        {/* Role */}
        <div>
          <Label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
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
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
        </div>

        {/* Hidden bankId (if needed) */}
        <input type="hidden" {...register("bankId")} />

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>

        {/* Show an alert if there are form errors */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
