export type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
};

export type ErrorResponse = {
  success: false;
  message: string;
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
