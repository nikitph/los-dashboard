"use server";

import { prisma } from "@/lib/prisma";

import { createClient } from "@supabase/supabase-js";
import { CreateUserFormValues, CreateUserSchema } from "@/app/[locale]/saas/(private)/users/schema";

type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  branch: string;
  avatarUrl?: string;
};

type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

export async function getUsersForBank(bankId: string): Promise<UserRecord[]> {
  const userProfiles = await prisma.userRoles.findMany({
    where: { bankId },
    include: {
      user: true, // includes UserProfile fields
    },
  });

  console.log(userProfiles);

  // Transform into the shape your UI expects
  return userProfiles.map((userRole) => ({
    id: userRole.userId,
    firstName: userRole.user.firstName ?? "",
    lastName: userRole.user.lastName ?? "",
    email: userRole.user.email ?? "",
    role: userRole.role, // e.g. "Administrator"
    status: "Active",
    lastLogin: "N/A",
    branch: userRole.bankId ? "Main Branch" : "Unknown",
    avatarUrl: undefined, // or store a URL in the user table
  }));
}

export async function createUser(formData: CreateUserFormValues) {
  try {
    const validatedData = CreateUserSchema.parse(formData);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SERVICE_ROLE_KEY!);

    console.log("formData", validatedData);

    const { data, error } = await supabase.auth.admin.createUser({
      phone: formData.phoneNumber,
      email: formData.email,
      email_confirm: true,
      user_metadata: {
        first_name: formData.firstName,
        last_name: formData.lastName,
      },
    });

    // 2) Create the UserRoles record for that user
    if (data?.user?.id) {
      await prisma.userRoles.create({
        data: {
          userId: data.user.id,
          role: formData.role,
          bankId: formData.bankId,
        },
      });
    }

    return {
      success: true,
      message: "User created successfully",
      data,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
