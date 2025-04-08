import { z } from "zod";
import { RoleType } from "@/schemas/zodSchemas";

export type RoleTypeValues = z.infer<typeof RoleType>;

/**
 * Function to create a User schema with translated validation messages
 * @param t Translation function that returns localized error messages
 * @returns Zod schema with translated validation messages
 */
export const generateRequestUserCreationSchema = (t: (key: string) => string) => {
  return z.object({
    firstName: z.string().min(1, { message: t("firstName.required") }),
    lastName: z.string().min(1, { message: t("lastName.required") }),
    email: z.string().email({ message: t("email.invalid") }),
    phoneNumber: z.string().regex(/^\d{10}$/, { message: t("phoneNumber.invalid") }),
    role: RoleType,
    bankId: z.string().min(1, { message: t("bankId.required") }),
  });
};

/**
 * Base schema for validation in non-translated contexts
 * Uses default error messages as fallback
 */
const RequestUserCreationSchema = generateRequestUserCreationSchema((key) => key);

/**
 * Type definition derived from the user schema
 */
export type RequestUserCreationData = z.infer<typeof RequestUserCreationSchema>;

/**
 * Type for user creation form values
 */
export type UserFormValues = RequestUserCreationData;

/**
 * Interface for user creation form component props
 */
export interface UserCreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
  bankId: string;
  onSuccess?: () => void;
}

export type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  branch: string;
  avatarUrl?: string;
};

export const ProcessPendingUserSchema = z
  .object({
    pendingActionId: z.string().uuid(),
    decision: z.enum(["approve", "reject"]),
    remarks: z.string().optional(),
  })
  .refine(
    (data) =>
      data.decision === "approve" || (data.decision === "reject" && data.remarks && data.remarks.trim().length > 0),
    {
      message: "Remarks are required when rejecting.",
      path: ["remarks"], // Associate error with the remarks field
    },
  );
export type ProcessPendingUserData = z.infer<typeof ProcessPendingUserSchema>;
