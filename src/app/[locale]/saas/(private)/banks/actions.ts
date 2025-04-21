"use server";

import { createBank, deleteBank, getBankById, listBanks, updateBank } from "@/lib/prisma/prismaUtils";
import { revalidatePath } from "next/cache";
import { BankSchema } from "@/schemas/zodSchemas";
import { z } from "zod";

// Define schemas for create and update
const CreateBankSchema = BankSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const UpdateBankSchema = CreateBankSchema.partial();

// Export individual async functions for each action
export async function createBankAction(data: z.infer<typeof CreateBankSchema>) {
  console.log("Server action createBankAction called with:", data);
  try {
    const bank = await createBank(data);
    revalidatePath("/saas/banks/list");
    return { success: true, data: bank };
  } catch (error) {
    console.error("Error in createBankAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create bank",
    };
  }
}

export async function getBankAction(id: string) {
  console.log("Server action getBankAction called for id:", id);
  try {
    const bank = await getBankById(id);
    return { success: true, data: bank };
  } catch (error) {
    console.error("Error in getBankAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch bank",
    };
  }
}

export async function updateBankAction(id: string, data: z.infer<typeof UpdateBankSchema>) {
  console.log("Server action updateBankAction called for id:", id, "with data:", data);
  try {
    const bank = await updateBank(id, data);
    revalidatePath("/saas/banks/list");
    revalidatePath(`/saas/banks/${id}`);
    return { success: true, data: bank };
  } catch (error) {
    console.error("Error in updateBankAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update ban",
    };
  }
}

export async function deleteBankAction(id: string) {
  console.log("Server action deleteBankAction called for id:", id);
  try {
    await deleteBank(id);
    revalidatePath("/saas/banks/list");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteBankAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete bank",
    };
  }
}

export async function fetchBanksAction() {
  console.log("Server action fetchBanksAction called");
  try {
    const banks = await listBanks();
    return { success: true, data: banks };
  } catch (error) {
    console.error("Error in fetchBanksAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch banks",
    };
  }
}
