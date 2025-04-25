"use server";

import { prisma } from "@/lib/prisma/prisma";

export async function getUserRoles(userId: string) {
  if (!userId) {
    return { success: false, error: "Invalid user ID" };
  }
  console.log("userId", userId);
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
