"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { getErrorMessage } from "@/utils/supabase/supabaseErrorHandler";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: any) {
  const supabase = await createClient();

  console.log("formdata", formData);

  const data = {
    email: formData.email as string,
    password: formData.password as string,
    options: {
      data: {
        first_name: formData.firstName as string,
        last_name: formData.lastName as string,
      },
    },
  };

  const { data: d, error } = await supabase.auth.signUp(data);

  if (error) {
    const message = getErrorMessage(error?.code);
    return {
      error: message,
      code: error.code,
      status: error.status,
    };
  }

  revalidatePath("/", "layout");
  redirect("/saas/dashboard");
}
