import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

type ActionError = {
  message: string;
  errors?: Record<string, string>;
};

export function handleFormErrors<T extends FieldValues>(
  response: { success: false } & ActionError,
  setError: UseFormSetError<T>,
): void {
  const { errors, message } = response;

  if (errors) {
    Object.entries(errors).forEach(([key, msg]) => {
      if (key === "root") {
        toast({
          title: "Something went wrong",
          description: msg,
          variant: "destructive",
        });
      } else {
        setError(key as Path<T>, {
          type: "manual",
          message: String(msg),
        });
      }
    });
  } else {
    toast({
      title: "Submission failed",
      description: message || "Something went wrong",
      variant: "destructive",
    });
  }
}
