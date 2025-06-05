import { BankOnboardingStatus } from "@prisma/client";
import { z } from "zod";

export type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
  meta?: Record<string, any>;
};

export type ErrorResponse = {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string>;
};

export type ActionResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  id: string;
  roles: { role: string; bankId: string | null }[];
  currentRole: { role: string; bankId: string | null };
};

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<StepProps>;
  validationSchema: z.ZodSchema;
  canAccess: (currentStatus: BankOnboardingStatus) => boolean;
  isCompleted: (currentStatus: BankOnboardingStatus) => boolean;
  completesStatus: BankOnboardingStatus;
  order: number;
}

export interface StepProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
  initialData?: any;
}
