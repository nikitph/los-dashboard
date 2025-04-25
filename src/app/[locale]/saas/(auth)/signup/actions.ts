"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phoneNumber,
      },
    },
  });

  if (authError) {
    return {
      error: authError.message,
      code: authError.code,
      status: authError.status,
    };
  }

  // If sign up was successful but user needs to confirm email
  // if (authData.user && !authData.user.confirmed_at) {
  //   // Redirect to verification page or show verification message
  //   redirect("/saas/verify?email=" + encodeURIComponent(formData.email));
  // }

  // If sign up was successful and no email verification required
  if (authData.user) {
    // Redirect to dashboard or onboarding
    redirect("/saas/dashboard");
  }

  return { error: "An unexpected error occurred", code: "unknown_error", status: 500 };
}
