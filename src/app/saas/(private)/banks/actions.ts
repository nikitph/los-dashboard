"use server";

import { createBank, deleteBank, listBanks, updateBank } from "@/lib/prismaUtils";
import { Bank } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Fetch all banks
export async function fetchBanks() {
  return await listBanks();
}

// Create a new bank
export async function createBankAction(data: Omit<Bank, "id" | "createdAt" | "updatedAt">) {
  const bank = await createBank(data);
  revalidatePath("/banks");
  return bank;
}

// Update a bank
export async function updateBankAction(id: string, data: Partial<Bank>) {
  const bank = await updateBank(id, data);
  revalidatePath("/banks");
  return bank;
}

// Delete a bank
export async function deleteBankAction(id: string) {
  await deleteBank(id);
  revalidatePath("/banks");
}
