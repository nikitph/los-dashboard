import { z } from "zod";

/**
 * Schema for creating a new user
 * Contains validation with translation keys for error messages
 */
export const createUserSchema = z.object({
  firstName: z.string().min(1, { message: "validation.firstName.required" }),
  lastName: z.string().min(1, { message: "validation.lastName.required" }),
  email: z.string().email({ message: "validation.email.invalid" }),
  phoneNumber: z.string().regex(/^\d{10}$/, { message: "validation.phoneNumber.invalid" }),
  role: z.enum(["CLERK", "INSPECTOR", "LOAN_OFFICER", "CEO", "LOAN_COMMITTEE", "BOARD", "BANK_ADMIN", "SAAS_ADMIN"], {
    errorMap: () => ({ message: "validation.role.required" }),
  }),
  bankId: z.string().min(1, { message: "validation.bankId.required" }),
});

/**
 * Schema for updating an existing user
 * Extends the create schema with id and makes all fields optional for partial updates
 */
export const updateUserSchema = createUserSchema
  .extend({
    id: z.string().min(1, { message: "validation.id.required" }),
  })
  .partial();

/**
 * API schema for user validation
 * Uses strict validation to prevent unknown fields
 */
export const userApiSchema = createUserSchema.strict();

/**
 * View schema for user display
 * Includes all fields including read-only and derived fields
 */
export const userViewSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNumber: z.string().optional().nullable(),
  role: z.string(),
  status: z.string(),
  lastLogin: z.string(),
  branch: z.string(),
  avatarUrl: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  fullName: z.string(), // Derived field
});

// Inferred types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserApiInput = z.infer<typeof userApiSchema>;
export type UserView = z.infer<typeof userViewSchema>;

// Types migrated from schema.ts
export type UserData = CreateUserInput;
export type RoleTypeValues = z.infer<typeof createUserSchema.shape.role>;
export type UserStatus = "Active" | "Pending" | "Locked" | "Inactive";

// Form-related types
export type UserFormValues = CreateUserInput;

export interface UserFormProps {
  bankId?: string;
  onSuccess?: () => void;
}

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
  phoneNumber?: string;
  role: string;
  status: string;
  lastLogin: string;
  branch: string;
  avatarUrl?: string;
  bankId?: string;
  fullName?: string; // Derived field
};
