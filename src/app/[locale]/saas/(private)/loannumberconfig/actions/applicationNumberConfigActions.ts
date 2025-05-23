"use server";

import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/prisma";
import { defineAbilityFor } from "@/lib/casl/ability";

import {
  type ApplicationNumberConfigView,
  type CreateApplicationNumberConfigInput,
  createApplicationNumberConfigSchema,
  type UpdateApplicationNumberConfigInput,
  updateApplicationNumberConfigSchema
} from "../schemas/applicationNumberConfigSchema";
import { ActionResponse } from "@/types/globalTypes";
import { getServerSessionUser } from "@/lib/getServerUser";

/**
 * Creates a new application number configuration for a bank
 *
 * This server action validates the input data, checks user permissions,
 * and creates a new application number configuration in the database.
 * Only users with appropriate permissions can create configurations.
 *
 * @param data - Validated application number configuration data
 * @returns Promise resolving to ActionResponse with created configuration or error
 */
export async function createApplicationNumberConfig(
  data: CreateApplicationNumberConfigInput,
): Promise<ActionResponse<ApplicationNumberConfigView>> {
  const t = await getTranslations("ApplicationNumberConfigurations");

  try {
    // Get current user and check authentication
    const currentUser = await getServerSessionUser();
    if (!currentUser) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "UNAUTHORIZED",
      };
    }

    // Define user abilities
    const ability = defineAbilityFor(currentUser);

    // Check if user can create application number configurations
    if (!ability.can("create", "ApplicationNumberConfiguration")) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "FORBIDDEN",
      };
    }

    // Validate input data
    const validationResult = createApplicationNumberConfigSchema.safeParse(data);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        const fieldName = error.path.join(".");
        fieldErrors[fieldName] = t(`validation.${fieldName}.${error.code}` as any) || error.message;
      });

      return {
        success: false,
        message: t("errors.invalidData"),
        code: "VALIDATION_ERROR",
        errors: fieldErrors,
      };
    }

    const validatedData = validationResult.data;

    // Check if configuration already exists for this bank
    const existingConfig = await prisma.applicationNumberConfiguration.findUnique({
      where: { bankId: validatedData.bankId },
    });

    if (existingConfig) {
      return {
        success: false,
        message: t("errors.duplicate"),
        code: "DUPLICATE_ERROR",
      };
    }

    // Create the configuration
    const created = await prisma.applicationNumberConfiguration.create({
      data: {
        bankId: validatedData.bankId,
        separator: validatedData.separator,
        includePrefix: validatedData.includePrefix,
        includeBranch: validatedData.includeBranch,
        includeLoanType: validatedData.includeLoanType,
        includeDate: validatedData.includeDate,
        bankName: validatedData.bankName,
        branchNumber: validatedData.branchNumber,
        loanTypeCode: validatedData.loanTypeCode,
        serialNumberPadding: validatedData.serialNumberPadding,
      },
      include: {
        bank: true,
      },
    });

    // Transform to view format
    const viewData: ApplicationNumberConfigView = {
      id: created.id,
      bankId: created.bankId,
      separator: created.separator as any,
      includePrefix: created.includePrefix,
      includeBranch: created.includeBranch,
      includeLoanType: created.includeLoanType,
      includeDate: created.includeDate,
      bankName: created.bankName || "",
      branchNumber: created.branchNumber || "",
      loanTypeCode: created.loanTypeCode || "",
      serialNumberPadding: created.serialNumberPadding,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      formattedCreatedAt: created.createdAt.toLocaleDateString(),
      formattedUpdatedAt: created.updatedAt.toLocaleDateString(),
      previewNumber: generatePreviewNumber(created),
      isActive: true,
    };

    // Revalidate relevant paths
    revalidatePath("/saas/(private)/application-number-configurations");
    revalidatePath(`/saas/(private)/application-number-configurations/${created.id}`);

    return {
      success: true,
      message: t("toast.created"),
      data: viewData,
    };
  } catch (error) {
    console.error("[createApplicationNumberConfig] Error:", error);
    return {
      success: false,
      message: t("errors.createFailed"),
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Updates an existing application number configuration
 *
 * This server action validates the input data, checks user permissions,
 * and updates the specified application number configuration in the database.
 *
 * @param data - Validated update data including configuration ID
 * @returns Promise resolving to ActionResponse with updated configuration or error
 */
export async function updateApplicationNumberConfig(
  data: UpdateApplicationNumberConfigInput,
): Promise<ActionResponse<ApplicationNumberConfigView>> {
  const t = await getTranslations("ApplicationNumberConfigurations");

  try {
    // Get current user and check authentication
    const currentUser = await getServerSessionUser();
    if (!currentUser) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "UNAUTHORIZED",
      };
    }

    // Define user abilities
    const ability = defineAbilityFor(currentUser);

    // Check if user can update application number configurations
    if (!ability.can("update", "ApplicationNumberConfiguration")) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "FORBIDDEN",
      };
    }

    // Validate input data
    const validationResult = updateApplicationNumberConfigSchema.safeParse(data);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        const fieldName = error.path.join(".");
        fieldErrors[fieldName] = t(`validation.${fieldName}.${error.code}` as any) || error.message;
      });

      return {
        success: false,
        message: t("errors.invalidData"),
        code: "VALIDATION_ERROR",
        errors: fieldErrors,
      };
    }

    const validatedData = validationResult.data;

    // Check if configuration exists
    const existingConfig = await prisma.applicationNumberConfiguration.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingConfig) {
      return {
        success: false,
        message: t("errors.notFound"),
        code: "NOT_FOUND",
      };
    }

    // Prepare update data (exclude id and undefined values)
    const { id, ...updateData } = validatedData;
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined),
    );

    // Update the configuration
    const updated = await prisma.applicationNumberConfiguration.update({
      where: { id: validatedData.id },
      data: filteredUpdateData,
      include: {
        bank: true,
      },
    });

    // Transform to view format
    const viewData: ApplicationNumberConfigView = {
      id: updated.id,
      bankId: updated.bankId,
      separator: updated.separator as any,
      includePrefix: updated.includePrefix,
      includeBranch: updated.includeBranch,
      includeLoanType: updated.includeLoanType,
      includeDate: updated.includeDate,
      bankName: updated.bankName || "",
      branchNumber: updated.branchNumber || "",
      loanTypeCode: updated.loanTypeCode || "",
      serialNumberPadding: updated.serialNumberPadding,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      formattedCreatedAt: updated.createdAt.toLocaleDateString(),
      formattedUpdatedAt: updated.updatedAt.toLocaleDateString(),
      previewNumber: generatePreviewNumber(updated),
      isActive: true,
    };

    // Revalidate relevant paths
    revalidatePath("/saas/(private)/application-number-configurations");
    revalidatePath(`/saas/(private)/application-number-configurations/${updated.id}`);

    return {
      success: true,
      message: t("toast.updated"),
      data: viewData,
    };
  } catch (error) {
    console.error("[updateApplicationNumberConfig] Error:", error);
    return {
      success: false,
      message: t("errors.updateFailed"),
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Deletes an application number configuration
 *
 * This server action checks user permissions and deletes the specified
 * application number configuration from the database.
 *
 * @param id - ID of the configuration to delete
 * @returns Promise resolving to ActionResponse indicating success or error
 */
export async function deleteApplicationNumberConfig(id: string): Promise<ActionResponse<void>> {
  const t = await getTranslations("ApplicationNumberConfigurations");

  try {
    // Get current user and check authentication
    const currentUser = await getServerSessionUser();
    if (!currentUser) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "UNAUTHORIZED",
      };
    }

    // Define user abilities
    const ability = defineAbilityFor(currentUser);

    // Check if user can delete application number configurations
    if (!ability.can("delete", "ApplicationNumberConfiguration")) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "FORBIDDEN",
      };
    }

    // Check if configuration exists
    const existingConfig = await prisma.applicationNumberConfiguration.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return {
        success: false,
        message: t("errors.notFound"),
        code: "NOT_FOUND",
      };
    }

    // Delete the configuration
    await prisma.applicationNumberConfiguration.delete({
      where: { id },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/(private)/application-number-configurations");

    return {
      success: true,
      message: t("toast.deleted"),
    };
  } catch (error) {
    console.error("[deleteApplicationNumberConfig] Error:", error);
    return {
      success: false,
      message: t("errors.deleteFailed"),
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Retrieves application number configurations for a bank or all banks
 *
 * This server action fetches configurations based on user permissions
 * and optional filtering parameters.
 *
 * @param options - Optional filtering and pagination options
 * @returns Promise resolving to ActionResponse with configurations array or error
 */
export async function getApplicationNumberConfigs(options?: {
  bankId?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ActionResponse<ApplicationNumberConfigView[]>> {
  const t = await getTranslations("ApplicationNumberConfigurations");

  try {
    // Get current user and check authentication
    const currentUser = await getServerSessionUser();
    if (!currentUser) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "UNAUTHORIZED",
      };
    }

    // Define user abilities
    const ability = defineAbilityFor(currentUser);

    // Check if user can read application number configurations
    if (!ability.can("read", "ApplicationNumberConfiguration")) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "FORBIDDEN",
      };
    }

    // Calculate pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Fetch configurations
    const configurations = await prisma.applicationNumberConfiguration.findMany({
      where: {
        bankId: options?.bankId,
      },
      include: {
        bank: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Transform to view format
    const viewData: ApplicationNumberConfigView[] = configurations.map((config) => ({
      id: config.id,
      bankId: config.bankId,
      separator: config.separator as any,
      includePrefix: config.includePrefix,
      includeBranch: config.includeBranch,
      includeLoanType: config.includeLoanType,
      includeDate: config.includeDate,
      bankName: config.bankName || "",
      branchNumber: config.branchNumber || "",
      loanTypeCode: config.loanTypeCode || "",
      serialNumberPadding: config.serialNumberPadding,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      formattedCreatedAt: config.createdAt.toLocaleDateString(),
      formattedUpdatedAt: config.updatedAt.toLocaleDateString(),
      previewNumber: generatePreviewNumber(config),
      isActive: true,
    }));

    return {
      success: true,
      message: "Configurations retrieved successfully",
      data: viewData,
      meta: {
        page,
        limit,
        total: configurations.length,
      },
    };
  } catch (error) {
    console.error("[getApplicationNumberConfigs] Error:", error);
    return {
      success: false,
      message: "Failed to retrieve configurations",
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Retrieves a single application number configuration by ID
 *
 * @param id - Configuration ID to retrieve
 * @returns Promise resolving to ActionResponse with configuration or error
 */
export async function getApplicationNumberConfigById(id: string): Promise<ActionResponse<ApplicationNumberConfigView>> {
  const t = await getTranslations("ApplicationNumberConfigurations");

  try {
    // Get current user and check authentication
    const currentUser = await getServerSessionUser();
    if (!currentUser) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "UNAUTHORIZED",
      };
    }

    // Define user abilities
    const ability = defineAbilityFor(currentUser);

    // Check if user can read application number configurations
    if (!ability.can("read", "ApplicationNumberConfiguration")) {
      return {
        success: false,
        message: t("errors.unauthorized"),
        code: "FORBIDDEN",
      };
    }

    // Fetch configuration
    const configuration = await prisma.applicationNumberConfiguration.findUnique({
      where: { bankId: id },
      include: {
        bank: true,
      },
    });

    if (!configuration) {
      return {
        success: false,
        message: t("errors.notFound"),
        code: "NOT_FOUND",
      };
    }

    // Transform to view format
    const viewData: ApplicationNumberConfigView = {
      id: configuration.id,
      bankId: configuration.bankId,
      separator: configuration.separator as any,
      includePrefix: configuration.includePrefix,
      includeBranch: configuration.includeBranch,
      includeLoanType: configuration.includeLoanType,
      includeDate: configuration.includeDate,
      bankName: configuration.bankName || "",
      branchNumber: configuration.branchNumber || "",
      loanTypeCode: configuration.loanTypeCode || "",
      serialNumberPadding: configuration.serialNumberPadding,
      createdAt: configuration.createdAt,
      updatedAt: configuration.updatedAt,
      formattedCreatedAt: configuration.createdAt.toLocaleDateString(),
      formattedUpdatedAt: configuration.updatedAt.toLocaleDateString(),
      previewNumber: generatePreviewNumber(configuration),
      isActive: true,
    };

    return {
      success: true,
      message: "Configuration retrieved successfully",
      data: viewData,
    };
  } catch (error) {
    console.error("[getApplicationNumberConfigById] Error:", error);
    return {
      success: false,
      message: t("errors.notFound"),
      code: "INTERNAL_ERROR",
    };
  }
}

/**
 * Generates a preview application number based on configuration
 *
 * @param config - Configuration object
 * @returns Generated preview number string
 */
function generatePreviewNumber(config: any): string {
  const parts: string[] = [];
  const separatorMap = {
    HYPHEN: "-",
    SLASH: "/",
    UNDERSCORE: "_",
    DOT: ".",
    NONE: "",
  };

  const separator = separatorMap[config.separator as keyof typeof separatorMap] || "-";

  // Add prefix (first 3 letters of bank name)
  if (config.includePrefix && config.bankName) {
    const prefix = config.bankName.substring(0, 3).toUpperCase();
    parts.push(prefix);
  }

  // Add branch number
  if (config.includeBranch && config.branchNumber) {
    parts.push(config.branchNumber);
  }

  // Add loan type code
  if (config.includeLoanType && config.loanTypeCode) {
    parts.push(config.loanTypeCode);
  }

  // Add date (sample date in DDMMYY format)
  if (config.includeDate) {
    const sampleDate = new Date();
    const day = sampleDate.getDate().toString().padStart(2, "0");
    const month = (sampleDate.getMonth() + 1).toString().padStart(2, "0");
    const year = sampleDate.getFullYear().toString().slice(-2);
    parts.push(`${day}${month}${year}`);
  }

  // Add serial number (always included)
  const padding = config.serialNumberPadding || 5;
  const serialNumber = "1".padStart(padding, "0");
  parts.push(serialNumber);

  // Join with separator, or just concatenate if no separator
  return separator === "" ? parts.join("") : parts.join(separator);
}
