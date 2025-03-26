// app/actions/user-actions.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getUserRoles(userId: string) {
  try {
    const roles = await prisma.userRoles.findMany({
      where: {
        userId: userId,
      },
      select: {
        role: true,
        bankId: true,
      },
    });

    return { success: true, data: roles };
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return { success: false, error: "Failed to fetch user roles" };
  }
}
