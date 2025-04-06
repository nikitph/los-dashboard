import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toastErrorFromResponse } from "@/lib/toastUtils";

type ActionError = {
  message: string;
  errors?: Record<string, string>;
};

export function handleFormErrors<T extends FieldValues>(
  response: { success: false } & ActionError,
  setError: UseFormSetError<T>,
): void {
  const { errors } = response;

  console.log("Errors:", errors);

  if (errors) {
    Object.entries(errors).forEach(([key, msg]) => {
      if (key !== "root") {
        setError(key as Path<T>, {
          type: "manual",
          message: String(msg),
        });
      }
    });
  }
  toastErrorFromResponse(response);
}
