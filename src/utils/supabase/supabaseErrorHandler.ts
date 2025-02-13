import { errorMessages } from "./supabaseErrorMessages";
import { SupabaseAuthErrorCode } from "@/types/supabaseAuth";

export function getErrorMessage(errorCode: any): string {
  return errorMessages[errorCode as SupabaseAuthErrorCode] || "An unknown error occurred. Please try again.";
}
