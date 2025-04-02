import { z } from "zod";
import { Prisma } from "@prisma/client";
import { ActionResponse } from "@/types/globalTypes";

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.errors) {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  }
  return errors;
}

export function handleActionError(error: unknown): ActionResponse<never> {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      message: "Validation failed",
      errors: formatZodErrors(error),
    };
  }

  // Prisma DB errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          success: false,
          message: "A unique field already exists",
          errors: {
            root: "A record with the same value already exists.",
          },
        };
      case "P2025":
        return {
          success: false,
          message: "Record not found",
          errors: {
            root: "The record you're trying to update no longer exists.",
          },
        };
      default:
        return {
          success: false,
          message: "Database error",
          errors: {
            root: `Database error: ${error.message}`,
          },
        };
    }
  }

  return {
    success: false,
    message: "Unexpected server error",
    errors: {
      root: error instanceof Error ? error.message : "Unknown error",
    },
  };
}
