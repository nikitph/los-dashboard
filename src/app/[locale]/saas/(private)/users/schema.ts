import { z } from "zod";
import { RoleType } from "@/schemas/zodSchemas";

export const CreateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  role: RoleType,
  bankId: z.string().optional(),
});

export type CreateUserFormValues = z.infer<typeof CreateUserSchema>;
