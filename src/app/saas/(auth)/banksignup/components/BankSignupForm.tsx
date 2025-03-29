import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupSchema, SignupSchemaType } from "@/app/saas/(auth)/banksignup/schema";
import { updateBankOnboardingStatus } from "@/app/saas/(auth)/banksignup/actions";
import { handleFormErrors } from "@/lib/formErrorHelper";

export function BankSignupForm({ className, signup, bankId, setCurrentStep, ...props }: any) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (clientData: SignupSchemaType) => {
    const response = await signup(clientData, bankId);

    if (!response.success) {
      handleFormErrors(response, setError);
    }
    await updateBankOnboardingStatus(bankId, "ADMIN_CREATED");
    setCurrentStep(2);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Admin Creation</CardTitle>
          <CardDescription>Please enter the following details to create your bank admin account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              {errors.root && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.root.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register("firstName")} />
                  {errors.firstName && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.firstName.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register("lastName")} />
                  {errors.lastName && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.lastName.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.email.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" type="tel" {...register("phoneNumber")} />
                {errors.phoneNumber && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.phoneNumber.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.password.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.confirmPassword.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Please Wait" : "Create Admin"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
