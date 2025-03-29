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
