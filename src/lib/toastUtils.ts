import { toast } from "@/hooks/use-toast";
import { ErrorResponse } from "@/types/globalTypes";

type ToastParams = {
  title: string;
  description?: string;
};

export function toastSuccess({ title, description }: ToastParams) {
  toast({
    title,
    description,
    variant: "default", // or your custom "success" variant
  });
}

export function toastError({ title, description }: ToastParams) {
  toast({
    title,
    description,
    variant: "destructive",
  });
}

export function toastInfo({ title, description }: ToastParams) {
  toast({
    title,
    description,
    variant: "info",
  });
}

export function toastWarning({ title, description }: ToastParams) {
  toast({
    title,
    description,
    variant: "warning",
  });
}

export function toastErrorFromResponse(response: ErrorResponse) {
  console.log(response);
  if (response.errors?.root) {
    toastError({
      title: "Something went wrong",
      description: response.errors.root,
    });
  } else {
    toastError({
      title: "Error",
      description: response.message || "An unexpected error occurred",
    });
  }
}
