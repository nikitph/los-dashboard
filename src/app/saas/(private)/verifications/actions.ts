"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { VerificationSchema } from "@/schemas/zodSchemas";

// Type for verification input data
export type VerificationFormData = z.infer<typeof VerificationSchema>;

// Response type for actions
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * Create a new verification record
 * @param formData The verification data
 */
export async function createVerification(formData: VerificationFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = VerificationSchema.parse(formData);

    // Prepare data for the primary verification record
    const {
      // Extract type-specific data
      residenceVerification,
      businessVerification,
      propertyVerification,
      vehicleVerification,
      // The rest belongs to the main verification object
      ...mainVerificationData
    } = validatedData;

    // Create verification in database with a transaction to ensure all related records are created
    const verification = await prisma.$transaction(async (tx) => {
      // First create the main verification
      const mainVerification = await tx.verification.create({
        data: {
          ...mainVerificationData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Based on the verification type, create the associated specific verification
      if (mainVerification.type === "RESIDENCE" && residenceVerification) {
        await tx.residenceVerification.create({
          data: {
            ...residenceVerification,
            verificationId: mainVerification.id,
          },
        });
      } else if (mainVerification.type === "BUSINESS" && businessVerification) {
        await tx.businessVerification.create({
          data: {
            ...businessVerification,
            verificationId: mainVerification.id,
          },
        });
      } else if (mainVerification.type === "PROPERTY" && propertyVerification) {
        await tx.propertyVerification.create({
          data: {
            ...propertyVerification,
            verificationId: mainVerification.id,
          },
        });
      } else if (mainVerification.type === "VEHICLE" && vehicleVerification) {
        await tx.vehicleVerification.create({
          data: {
            ...vehicleVerification,
            verificationId: mainVerification.id,
          },
        });
      }

      return mainVerification;
    });

    // Revalidate the verifications list path
    revalidatePath("/saas/verifications/list");

    return {
      success: true,
      message: "Verification created successfully",
      data: verification,
    };
  } catch (error) {
    console.error("Error creating verification:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to create verification",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all verifications with optional filtering and sorting
 */
export async function getVerifications(
  searchTerm = "",
  typeFilter = "all",
  statusFilter = "all",
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  },
) {
  try {
    // Build filter conditions
    const filters: any = {
      deletedAt: null, // Only get non-deleted verifications
    };

    // Add type filter if specified
    if (typeFilter !== "all") {
      filters.type = typeFilter;
    }

    // Add status filter if specified
    if (statusFilter !== "all") {
      filters.status = statusFilter;
    }

    // Get verifications with filters
    const verifications = await prisma.verification.findMany({
      where: filters,
      include: {
        loanApplication: {
          select: {
            id: true,
            status: true,
            applicant: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        verifiedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        residenceVerification: true,
        businessVerification: true,
        propertyVerification: true,
        vehicleVerification: true,
      },
      orderBy: sortConfig?.key ? { [sortConfig.key]: sortConfig.direction } : undefined,
    });

    // Apply search filter if provided
    let filteredVerifications = verifications;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredVerifications = verifications.filter((verification) => {
        // Search in main verification fields
        if (
          verification.addressLine1?.toLowerCase().includes(search) ||
          verification.addressLine2?.toLowerCase().includes(search) ||
          verification.addressCity?.toLowerCase().includes(search) ||
          verification.addressState?.toLowerCase().includes(search) ||
          verification.addressZipCode?.includes(search) ||
          verification.remarks?.toLowerCase().includes(search) ||
          verification.locationFromMain?.toLowerCase().includes(search)
        ) {
          return true;
        }

        // Search in loanApplication fields
        if (
          verification.loanApplication?.applicant?.user?.firstName?.toLowerCase().includes(search) ||
          verification.loanApplication?.applicant?.user?.lastName?.toLowerCase().includes(search) ||
          verification.loanApplication?.applicant?.user?.email?.toLowerCase().includes(search)
        ) {
          return true;
        }

        // Search in verifiedBy fields
        if (
          verification.verifiedBy?.firstName?.toLowerCase().includes(search) ||
          verification.verifiedBy?.lastName?.toLowerCase().includes(search) ||
          verification.verifiedBy?.email?.toLowerCase().includes(search)
        ) {
          return true;
        }

        // Search in type-specific fields
        if (verification.type === "RESIDENCE" && verification.residenceVerification) {
          return (
            verification.residenceVerification.ownerFirstName?.toLowerCase().includes(search) ||
            verification.residenceVerification.ownerLastName?.toLowerCase().includes(search) ||
            verification.residenceVerification.residentSince?.includes(search) ||
            verification.residenceVerification.residenceType?.toLowerCase().includes(search) ||
            verification.residenceVerification.structureType?.toLowerCase().includes(search)
          );
        } else if (verification.type === "BUSINESS" && verification.businessVerification) {
          return (
            verification.businessVerification.businessName?.toLowerCase().includes(search) ||
            verification.businessVerification.businessType?.toLowerCase().includes(search) ||
            verification.businessVerification.contactDetails?.toLowerCase().includes(search) ||
            verification.businessVerification.natureOfBusiness?.toLowerCase().includes(search) ||
            verification.businessVerification.salesPerDay?.includes(search)
          );
        } else if (verification.type === "PROPERTY" && verification.propertyVerification) {
          return (
            verification.propertyVerification.ownerFirstName?.toLowerCase().includes(search) ||
            verification.propertyVerification.ownerLastName?.toLowerCase().includes(search) ||
            verification.propertyVerification.structureType?.toLowerCase().includes(search)
          );
        } else if (verification.type === "VEHICLE" && verification.vehicleVerification) {
          return (
            verification.vehicleVerification.engineNumber?.includes(search) ||
            verification.vehicleVerification.chassisNumber?.includes(search) ||
            verification.vehicleVerification.registrationNumber?.includes(search) ||
            verification.vehicleVerification.make?.toLowerCase().includes(search) ||
            verification.vehicleVerification.model?.toLowerCase().includes(search) ||
            verification.vehicleVerification.vehicleType?.toLowerCase().includes(search)
          );
        }

        return false;
      });
    }

    return {
      success: true,
      data: filteredVerifications,
    };
  } catch (error) {
    console.error("Error getting verifications:", error);
    return {
      success: false,
      message: "Failed to retrieve verifications",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single verification by ID
 * @param id The verification ID
 */
export async function getVerificationById(id: string) {
  try {
    const verification = await prisma.verification.findUnique({
      where: { id, deletedAt: null },
      include: {
        loanApplication: {
          include: {
            applicant: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        verifiedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        residenceVerification: true,
        businessVerification: true,
        propertyVerification: true,
        vehicleVerification: true,
      },
    });

    if (!verification) {
      return {
        success: false,
        message: "Verification not found",
      };
    }

    return {
      success: true,
      data: verification,
    };
  } catch (error) {
    console.error("Error getting verification:", error);
    return {
      success: false,
      message: "Failed to retrieve verification",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing verification
 * @param id The verification ID
 * @param formData The updated verification data
 */
export async function updateVerification(id: string, formData: VerificationFormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = VerificationSchema.parse(formData);

    // Check if verification exists
    const existingVerification = await prisma.verification.findUnique({
      where: { id },
      include: {
        residenceVerification: true,
        businessVerification: true,
        propertyVerification: true,
        vehicleVerification: true,
      },
    });

    if (!existingVerification) {
      return {
        success: false,
        message: "Verification not found",
      };
    }

    // Split data for main verification and type-specific data
    const {
      residenceVerification,
      businessVerification,
      propertyVerification,
      vehicleVerification,
      ...mainVerificationData
    } = validatedData;

    // Update verification in database with a transaction
    await prisma.$transaction(async (tx) => {
      // Update main verification record
      await tx.verification.update({
        where: { id },
        data: {
          ...mainVerificationData,
          updatedAt: new Date(),
        },
      });

      // Update the type-specific verification based on the verification type
      if (existingVerification.type === "RESIDENCE") {
        if (existingVerification.residenceVerification && residenceVerification) {
          await tx.residenceVerification.update({
            where: { verificationId: id },
            data: residenceVerification,
          });
        } else if (residenceVerification) {
          await tx.residenceVerification.create({
            data: {
              ...residenceVerification,
              verificationId: id,
            },
          });
        }
      } else if (existingVerification.type === "BUSINESS") {
        if (existingVerification.businessVerification && businessVerification) {
          await tx.businessVerification.update({
            where: { verificationId: id },
            data: businessVerification,
          });
        } else if (businessVerification) {
          await tx.businessVerification.create({
            data: {
              ...businessVerification,
              verificationId: id,
            },
          });
        }
      } else if (existingVerification.type === "PROPERTY") {
        if (existingVerification.propertyVerification && propertyVerification) {
          await tx.propertyVerification.update({
            where: { verificationId: id },
            data: propertyVerification,
          });
        } else if (propertyVerification) {
          await tx.propertyVerification.create({
            data: {
              ...propertyVerification,
              verificationId: id,
            },
          });
        }
      } else if (existingVerification.type === "VEHICLE") {
        if (existingVerification.vehicleVerification && vehicleVerification) {
          await tx.vehicleVerification.update({
            where: { verificationId: id },
            data: vehicleVerification,
          });
        } else if (vehicleVerification) {
          await tx.vehicleVerification.create({
            data: {
              ...vehicleVerification,
              verificationId: id,
            },
          });
        }
      }
    });

    // Revalidate paths
    revalidatePath("/saas/verifications/list");
    revalidatePath(`/saas/verifications/${id}`);

    return {
      success: true,
      message: "Verification updated successfully",
    };
  } catch (error) {
    console.error("Error updating verification:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to update verification",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Soft delete a verification
 * @param id The verification ID
 */
export async function deleteVerification(id: string): Promise<ActionResponse> {
  try {
    // Check if verification exists
    const existingVerification = await prisma.verification.findUnique({
      where: { id },
    });

    if (!existingVerification) {
      return {
        success: false,
        message: "Verification not found",
      };
    }

    // Soft delete by setting deletedAt
    await prisma.verification.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/verifications/list");

    return {
      success: true,
      message: "Verification deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting verification:", error);
    return {
      success: false,
      message: "Failed to delete verification",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get loan applications for dropdown
 */
export async function getLoanApplications() {
  try {
    const loanApplications = await prisma.loanApplication.findMany({
      where: { deletedAt: null },
      include: {
        applicant: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: loanApplications,
    };
  } catch (error) {
    console.error("Error getting loan applications:", error);
    return {
      success: false,
      message: "Failed to retrieve loan applications",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user profiles for verification officers
 */
export async function getVerificationOfficers() {
  try {
    const officers = await prisma.userProfile.findMany({
      where: {
        deletedAt: null,
        userRoles: {
          some: {
            role: "INSPECTOR",
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return {
      success: true,
      data: officers,
    };
  } catch (error) {
    console.error("Error getting verification officers:", error);
    return {
      success: false,
      message: "Failed to retrieve verification officers",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
