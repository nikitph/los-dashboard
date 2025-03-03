import { z } from "zod";

export const SubscriptionSchema = z.object({
  bankId: z.string().describe("unique"),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.string(),
  amount: z.number(),
  deletedAt: z.date().optional(),
  bank: z.string(),
});

export type SubscriptionFormData = z.infer<typeof SubscriptionSchema>;
