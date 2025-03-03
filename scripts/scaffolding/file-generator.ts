import fs from "fs";
import path from "path";
import { Field, Model } from "./prisma-parser";

// Helper functions
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFileIfNotExists(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Created: ${filePath}`);
  } else {
    console.log(`File already exists: ${filePath}`);
  }
}

// String manipulation helpers
function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toCapitalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pluralize(str: string): string {
  // Very basic pluralization - in a real app, use a proper pluralization library
  if (str.endsWith("y")) {
    return str.slice(0, -1) + "ies";
  }
  if (str.endsWith("s") || str.endsWith("x") || str.endsWith("z") || str.endsWith("ch") || str.endsWith("sh")) {
    return str + "es";
  }
  return str + "s";
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

// Template generation helpers
function getFieldType(field: Field): string {
  switch (field.type) {
    case "String":
      return "string";
    case "Int":
      return "number";
    case "Float":
      return "number";
    case "Boolean":
      return "boolean";
    case "DateTime":
      return "Date";
    default:
      // Handle enums or custom types
      if (field.isRelation) {
        return field.relationModel || "any";
      }
      return "any";
  }
}

function getFormFieldType(field: Field): string {
  switch (field.type) {
    case "String":
      return "text";
    case "Int":
    case "Float":
      return "number";
    case "Boolean":
      return "checkbox";
    case "DateTime":
      return "date";
    default:
      // For relations or enums, we'll use select
      return "text";
  }
}

function generateZodSchema(model: Model): string {
  let schema = `import { z } from "zod";\n\n`;
  schema += `export const ${model.name}Schema = z.object({\n`;

  model.fields.forEach((field) => {
    // Skip auto-generated IDs
    if (field.isId && field.defaultValue) return;

    // Skip relation fields for direct validation
    if (field.isRelation) {
      schema += `  ${field.name}: z.string()${field.isRequired ? "" : ".optional()"},\n`;
      return;
    }

    let fieldSchema = "z.";

    // Determine the Zod type based on Prisma type
    switch (field.type) {
      case "String":
        fieldSchema += "string()";
        break;
      case "Int":
        fieldSchema += "number().int()";
        break;
      case "Float":
        fieldSchema += "number()";
        break;
      case "Boolean":
        fieldSchema += "boolean()";
        break;
      case "DateTime":
        fieldSchema += "date()";
        break;
      default:
        // For custom types or enums
        fieldSchema += "any()";
    }

    // Add validation rules
    if (field.isUnique) {
      fieldSchema += '.describe("unique")';
    }

    // Make field optional if not required
    if (!field.isRequired) {
      fieldSchema += ".optional()";
    }

    // Add the field to the schema
    schema += `  ${field.name}: ${fieldSchema},\n`;
  });

  schema += "});\n\n";
  schema += `export type ${model.name}FormData = z.infer<typeof ${model.name}Schema>;\n`;

  return schema;
}

function generateActionFile(model: Model): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const modelNamePlural = pluralize(modelNameCamel);

  return `"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ${modelName}Schema } from "@/schemas/zodSchemas";

// Type for ${modelNameCamel} input data
export type ${modelName}FormData = z.infer<typeof ${modelName}Schema>;

// Response type for actions
type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * Create a new ${modelNameCamel}
 * @param formData The ${modelNameCamel} data
 */
export async function create${modelName}(formData: ${modelName}FormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = ${modelName}Schema.parse(formData);

    // Create ${modelNameCamel} in database
    const ${modelNameCamel} = await prisma.${modelNameCamel}.create({
      data: {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Revalidate the ${modelNamePlural} list path
    revalidatePath("/saas/${modelNamePlural}/list");

    return {
      success: true,
      message: "${modelName} created successfully",
      data: ${modelNameCamel},
    };
  } catch (error) {
    console.error("Error creating ${modelNameCamel}:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to create ${modelNameCamel}",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all ${modelNamePlural} with optional filtering and sorting
 */
export async function get${pluralize(modelName)}(
  searchTerm = "",
  filters = {},
  sortConfig?: {
    key: string;
    direction: "asc" | "desc";
  },
) {
  try {
    // Build filter conditions
    const baseFilters: any = {
      deletedAt: null, // Only get non-deleted ${modelNamePlural}
      ...filters
    };

    // Get ${modelNamePlural} with filters
    const ${modelNamePlural} = await prisma.${modelNameCamel}.findMany({
      where: baseFilters,
      include: {
        // Include related models as needed
        ${generateIncludeFields(model)}
      },
    });

    // Apply search filter if provided
    let filtered${pluralize(modelName)} = ${modelNamePlural};
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered${pluralize(modelName)} = ${modelNamePlural}.filter((${modelNameCamel}) => {
        return (
          ${generateSearchFields(model)}
        );
      });
    }

    // Apply sorting if provided
    if (sortConfig && sortConfig.key) {
      filtered${pluralize(modelName)}.sort((a: any, b: any) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (!aValue || !bValue) return 0;

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return {
      success: true,
      data: filtered${pluralize(modelName)},
    };
  } catch (error) {
    console.error("Error getting ${modelNamePlural}:", error);
    return {
      success: false,
      message: "Failed to retrieve ${modelNamePlural}",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a single ${modelNameCamel} by ID
 * @param id The ${modelNameCamel} ID
 */
export async function get${modelName}ById(id: string) {
  try {
    const ${modelNameCamel} = await prisma.${modelNameCamel}.findUnique({
      where: { id, deletedAt: null },
      include: {
        // Include related models as needed
        ${generateIncludeFields(model)}
      },
    });

    if (!${modelNameCamel}) {
      return {
        success: false,
        message: "${modelName} not found",
      };
    }

    return {
      success: true,
      data: ${modelNameCamel},
    };
  } catch (error) {
    console.error("Error getting ${modelNameCamel}:", error);
    return {
      success: false,
      message: "Failed to retrieve ${modelNameCamel}",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing ${modelNameCamel}
 * @param id The ${modelNameCamel} ID
 * @param formData The updated ${modelNameCamel} data
 */
export async function update${modelName}(id: string, formData: ${modelName}FormData): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = ${modelName}Schema.parse(formData);

    // Check if ${modelNameCamel} exists
    const existing${modelName} = await prisma.${modelNameCamel}.findUnique({
      where: { id },
    });

    if (!existing${modelName}) {
      return {
        success: false,
        message: "${modelName} not found",
      };
    }

    // Update ${modelNameCamel} in database
    const updated${modelName} = await prisma.${modelNameCamel}.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    // Revalidate relevant paths
    revalidatePath("/saas/${modelNamePlural}/list");
    revalidatePath(\`/saas/${modelNamePlural}/\${id}\`);

    return {
      success: true,
      message: "${modelName} updated successfully",
      data: updated${modelName},
    };
  } catch (error) {
    console.error("Error updating ${modelNameCamel}:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to update ${modelNameCamel}",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Soft delete a ${modelNameCamel}
 * @param id The ${modelNameCamel} ID
 */
export async function delete${modelName}(id: string): Promise<ActionResponse> {
  try {
    // Check if ${modelNameCamel} exists
    const existing${modelName} = await prisma.${modelNameCamel}.findUnique({
      where: { id },
    });

    if (!existing${modelName}) {
      return {
        success: false,
        message: "${modelName} not found",
      };
    }

    // Soft delete by setting deletedAt
    await prisma.${modelNameCamel}.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidate paths
    revalidatePath("/saas/${modelNamePlural}/list");

    return {
      success: true,
      message: "${modelName} deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting ${modelNameCamel}:", error);
    return {
      success: false,
      message: "Failed to delete ${modelNameCamel}",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
`;
}

function generateIncludeFields(model: Model): string {
  // Find relation fields
  const relationFields = model.fields.filter((field) => field.isRelation);

  if (relationFields.length === 0) {
    return "// No relations to include";
  }

  let includeCode = "";

  relationFields.forEach((field) => {
    if (field.relationModel) {
      includeCode += `${field.name}: {\n          select: {\n            id: true,\n`;

      // Add user relation if it's a common pattern
      if (field.relationModel === "User") {
        includeCode += `            firstName: true,\n            lastName: true,\n            email: true,\n`;
      }

      includeCode += `          },\n        },\n        `;
    }
  });

  return includeCode.trim();
}

function generateSearchFields(model: Model): string {
  // Generate search conditions for string fields
  const searchableFields = model.fields.filter((field) => field.type === "String" && !field.isRelation);

  if (searchableFields.length === 0) {
    return "true // No searchable fields";
  }

  let searchCode = searchableFields
    .map((field) => `${toCamelCase(model.name)}.${field.name}?.toLowerCase().includes(search)`)
    .join(" ||\n          ");

  return searchCode;
}

function generateFormComponent(model: Model): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);

  const fields = model.fields.filter((f) => !f.isId || !f.defaultValue);

  // Organize fields by type
  const stringFields = fields.filter((f) => f.type === "String" && !f.isRelation);
  const numberFields = fields.filter((f) => f.type === "Int" || f.type === "Float");
  const dateFields = fields.filter((f) => f.type === "DateTime");
  const booleanFields = fields.filter((f) => f.type === "Boolean");
  const relationFields = fields.filter((f) => f.isRelation);

  return `"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

import { create${modelName}, update${modelName} } from "@/app/saas/${pluralize(modelNameCamel)}/actions";
import { ${modelName}Schema } from "@/schemas/zodSchemas";

type ${modelName}FormValues = z.infer<typeof ${modelName}Schema>;

interface ${modelName}FormProps {
  initialData?: Partial<${modelName}FormValues> & { id?: string };
  isEditMode?: boolean;
}

export default function ${modelName}Form({ initialData, isEditMode = false }: ${modelName}FormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  ${relationFields.length > 0 ? `const [relatedData, setRelatedData] = useState<any>({});` : ""}

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<${modelName}FormValues>({
    resolver: zodResolver(${modelName}Schema),
    defaultValues: {
      ${fields
        .map((field) => {
          if (field.isRelation) {
            return `${field.name}: initialData?.${field.name} || "",`;
          } else if (field.type === "DateTime") {
            return `${field.name}: initialData?.${field.name} ? new Date(initialData.${field.name}) : undefined,`;
          } else if (field.type === "Boolean") {
            return `${field.name}: initialData?.${field.name} || false,`;
          } else if (field.type === "Int" || field.type === "Float") {
            return `${field.name}: initialData?.${field.name} || 0,`;
          } else {
            return `${field.name}: initialData?.${field.name} || "",`;
          }
        })
        .join("\n      ")}
    },
  });

  // Set form values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        const typedKey = key as keyof ${modelName}FormValues;
        if (initialData[typedKey] !== undefined) {
          if (key.endsWith('At') && initialData[typedKey]) {
            // Handle date fields
            setValue(typedKey, new Date(initialData[typedKey] as Date));
          } else {
            setValue(typedKey, initialData[typedKey] as any);
          }
        }
      });
    }
  }, [initialData, setValue]);

  ${
    relationFields.length > 0
      ? `
  // Fetch related data
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Fetch relation data here
        // const response = await getRelatedData();
        // if (response.success) {
        //   setRelatedData(response.data || {});
        // }
      } catch (error) {
        console.error("Error fetching related data:", error);
      }
    };

    fetchRelatedData();
  }, []);
  `
      : ""
  }

  const onSubmit = async (data: ${modelName}FormValues) => {
    setIsSubmitting(true);
    try {
      let response;

      if (isEditMode && initialData?.id) {
        response = await update${modelName}(initialData.id, data);
      } else {
        response = await create${modelName}(data);
      }

      if (response.success) {
        toast({
          title: isEditMode ? "${modelName} Updated" : "${modelName} Created",
          description: response.message,
        });

        router.push("/saas/${pluralize(modelNameCamel)}/list");
      } else {
        toast({
          title: "Error",
          description: response.error || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-transparent">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-2xl font-semibold">{isEditMode ? "Edit ${modelName}" : "Create ${modelName}"}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          ${generateFormFields(model)}

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/saas/${pluralize(modelNameCamel)}/list")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : isEditMode ? "Update ${modelName}" : "Create ${modelName}"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
`;
}

function generateFormFields(model: Model): string {
  const fields = model.fields.filter((f) => !f.isId || !f.defaultValue);

  let formFields = "";

  // Group fields by section
  const relationFields = fields.filter((f) => f.isRelation);
  const mainFields = fields.filter((f) => !f.isRelation);

  // Generate relation fields first (e.g., dropdowns for foreign keys)
  if (relationFields.length > 0) {
    formFields += `{/* Relation Fields */}\n`;
    relationFields.forEach((field) => {
      formFields += `
          <div className="flex flex-col gap-1">
            <Label htmlFor="${field.name}">${formatFieldLabel(field.name)}</Label>
            <Select 
              onValueChange={(value) => setValue("${field.name}", value)} 
              value={watch("${field.name}")}
              disabled={${field.isRequired ? "false" : "false"}}
            >
              <SelectTrigger id="${field.name}" className="w-full">
                <SelectValue placeholder="Select ${formatFieldLabel(field.name)}" />
              </SelectTrigger>
              <SelectContent>
                {/* Populate with related items */}
                <SelectItem value="placeholder">Select...</SelectItem>
              </SelectContent>
            </Select>
            {errors.${field.name} && <p className="mt-1 text-sm text-red-600">{errors.${field.name}?.message}</p>}
          </div>
      `;
    });
  }

  // Generate string fields
  const stringFields = mainFields.filter((f) => f.type === "String");
  if (stringFields.length > 0) {
    formFields += `\n          {/* String Fields */}\n`;

    // Create a two-column layout for shorter string fields
    const shortStringFields = stringFields.filter(
      (f) =>
        !f.name.toLowerCase().includes("description") &&
        !f.name.toLowerCase().includes("address") &&
        !f.name.toLowerCase().includes("comment"),
    );

    // Group fields in pairs for two-column layout
    for (let i = 0; i < shortStringFields.length; i += 2) {
      const field1 = shortStringFields[i];
      const field2 = i + 1 < shortStringFields.length ? shortStringFields[i + 1] : null;

      if (field2) {
        // Two-column layout
        formFields += `
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="${field1.name}">${formatFieldLabel(field1.name)}</Label>
              <Input id="${field1.name}" {...register("${field1.name}")} placeholder="Enter ${formatFieldLabel(field1.name).toLowerCase()}" />
              {errors.${field1.name} && <p className="mt-1 text-sm text-red-600">{errors.${field1.name}?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="${field2.name}">${formatFieldLabel(field2.name)}</Label>
              <Input id="${field2.name}" {...register("${field2.name}")} placeholder="Enter ${formatFieldLabel(field2.name).toLowerCase()}" />
              {errors.${field2.name} && <p className="mt-1 text-sm text-red-600">{errors.${field2.name}?.message}</p>}
            </div>
          </div>
        `;
      } else {
        // Single column for the last item if odd number
        formFields += `
          <div className="space-y-2">
            <Label htmlFor="${field1.name}">${formatFieldLabel(field1.name)}</Label>
            <Input id="${field1.name}" {...register("${field1.name}")} placeholder="Enter ${formatFieldLabel(field1.name).toLowerCase()}" />
            {errors.${field1.name} && <p className="mt-1 text-sm text-red-600">{errors.${field1.name}?.message}</p>}
          </div>
        `;
      }
    }

    // Handle longer text fields
    const longStringFields = stringFields.filter(
      (f) =>
        f.name.toLowerCase().includes("description") ||
        f.name.toLowerCase().includes("address") ||
        f.name.toLowerCase().includes("comment"),
    );

    longStringFields.forEach((field) => {
      formFields += `
          <div className="space-y-2">
            <Label htmlFor="${field.name}">${formatFieldLabel(field.name)}</Label>
            <textarea 
              id="${field.name}"
              {...register("${field.name}")}
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter ${formatFieldLabel(field.name).toLowerCase()}"
            />
            {errors.${field.name} && <p className="mt-1 text-sm text-red-600">{errors.${field.name}?.message}</p>}
          </div>
      `;
    });
  }

  // Generate number fields
  const numberFields = mainFields.filter((f) => f.type === "Int" || f.type === "Float");
  if (numberFields.length > 0) {
    formFields += `\n          {/* Number Fields */}\n`;

    // Group fields in pairs for two-column layout
    for (let i = 0; i < numberFields.length; i += 2) {
      const field1 = numberFields[i];
      const field2 = i + 1 < numberFields.length ? numberFields[i + 1] : null;

      if (field2) {
        // Two-column layout
        formFields += `
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="${field1.name}">${formatFieldLabel(field1.name)}</Label>
              <Input id="${field1.name}" type="number" {...register("${field1.name}", { valueAsNumber: true })} placeholder="Enter ${formatFieldLabel(field1.name).toLowerCase()}" />
              {errors.${field1.name} && <p className="mt-1 text-sm text-red-600">{errors.${field1.name}?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="${field2.name}">${formatFieldLabel(field2.name)}</Label>
              <Input id="${field2.name}" type="number" {...register("${field2.name}", { valueAsNumber: true })} placeholder="Enter ${formatFieldLabel(field2.name).toLowerCase()}" />
              {errors.${field2.name} && <p className="mt-1 text-sm text-red-600">{errors.${field2.name}?.message}</p>}
            </div>
          </div>
        `;
      } else {
        // Single column for the last item if odd number
        formFields += `
          <div className="space-y-2">
            <Label htmlFor="${field1.name}">${formatFieldLabel(field1.name)}</Label>
            <Input id="${field1.name}" type="number" {...register("${field1.name}", { valueAsNumber: true })} placeholder="Enter ${formatFieldLabel(field1.name).toLowerCase()}" />
            {errors.${field1.name} && <p className="mt-1 text-sm text-red-600">{errors.${field1.name}?.message}</p>}
          </div>
        `;
      }
    }
  }

  // Generate date fields
  const dateFields = mainFields.filter((f) => f.type === "DateTime");
  if (dateFields.length > 0) {
    formFields += `\n          {/* Date Fields */}\n`;

    // Group fields in pairs for two-column layout
    for (let i = 0; i < dateFields.length; i += 2) {
      const field1 = dateFields[i];
      const field2 = i + 1 < dateFields.length ? dateFields[i + 1] : null;

      if (field2) {
        // Two-column layout
        formFields += `
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="${field1.name}">${formatFieldLabel(field1.name)}</Label>
              <Input 
                id="${field1.name}" 
                type="date" 
                {...register("${field1.name}", { 
                  setValueAs: (value) => value ? new Date(value) : undefined 
                })} 
              />
              {errors.${field1.name} && <p className="mt-1 text-sm text-red-600">{errors.${field1.name}?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="${field2.name}">${formatFieldLabel(field2.name)}</Label>
              <Input 
                id="${field2.name}" 
                type="date" 
                {...register("${field2.name}", { 
                  setValueAs: (value) => value ? new Date(value) : undefined 
                })} 
              />
              {errors.${field2.name} && <p className="mt-1 text-sm text-red-600">{errors.${field2.name}?.message}</p>}
            </div>
          </div>
        `;
      } else {
        // Single column for the last item if odd number
        formFields += `
          <div className="space-y-2">
            <Label htmlFor="${field1.name}">${formatFieldLabel(field1.name)}</Label>
            <Input 
              id="${field1.name}" 
              type="date" 
              {...register("${field1.name}", { 
                setValueAs: (value) => value ? new Date(value) : undefined 
              })} 
              />
              {errors.${field1.name} && <p className="mt-1 text-sm text-red-600">{errors.${field1.name}?.message}</p>}
            </div>
        `;
      }
    }
  }

  // Generate boolean fields
  const booleanFields = mainFields.filter((f) => f.type === "Boolean");
  if (booleanFields.length > 0) {
    formFields += `\n          {/* Boolean Fields */}\n`;

    booleanFields.forEach((field) => {
      formFields += `
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="${field.name}" 
              checked={watch("${field.name}")} 
              onCheckedChange={(checked) => setValue("${field.name}", checked as boolean)}
            />
            <Label htmlFor="${field.name}" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              ${formatFieldLabel(field.name)}
            </Label>
            {errors.${field.name} && <p className="mt-1 text-sm text-red-600">{errors.${field.name}?.message}</p>}
          </div>
      `;
    });
  }

  return formFields;
}

function formatFieldLabel(fieldName: string): string {
  // Convert camelCase or snake_case to Title Case with spaces
  return fieldName
    .replace(/([A-Z])/g, " $1") // Insert space before capital letters
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
    .trim();
}

function generateListPage(model: Model): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const modelNamePlural = pluralize(modelNameCamel);
  const modelNamePluralCapital = pluralize(modelName);

  return `"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowUpDown, MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { delete${modelName}, get${modelNamePluralCapital} } from "../actions";
import { formatDate } from "@/utils/displayUtils";

interface ${modelName} {
  id: string;
  ${generateInterfaceFields(model)}
  createdAt: Date;
  updatedAt: Date;
}

interface SortConfig {
  key: string | null;
  direction: "asc" | "desc";
}

export default function ${modelNamePluralCapital}ListPage() {
  const router = useRouter();
  const [${modelNamePlural}, set${modelNamePluralCapital}] = useState<${modelName}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch ${modelNamePlural} with current filters and sorting
  const fetch${modelNamePluralCapital} = async () => {
    try {
      const response = await get${modelNamePluralCapital}(
        searchTerm,
        {},
        sortConfig.key ? { key: sortConfig.key, direction: sortConfig.direction } : undefined,
      );

      if (response.success) {
        set${modelNamePluralCapital}(response?.data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch ${modelNamePlural}",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching ${modelNamePlural}:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Fetch ${modelNamePlural} on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetch${modelNamePluralCapital}();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load ${modelNamePlural}",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle filtering whenever filters change
  useEffect(() => {
    fetch${modelNamePluralCapital}();
  }, [searchTerm, sortConfig]);

  // Handle sort column click
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Handle delete ${modelNameCamel}
  const handleDelete${modelName} = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this ${modelNameCamel}?")) {
      try {
        const response = await delete${modelName}(id);

        if (response.success) {
          toast({
            title: "Success",
            description: "${modelName} deleted successfully",
          });
          // Refresh the list
          fetch${modelNamePluralCapital}();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete ${modelNameCamel}",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting ${modelNameCamel}:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Navigate to create new ${modelNameCamel} page
  const handleCreate = () => {
    router.push("/saas/${modelNamePlural}/create");
  };

  // Navigate to view ${modelNameCamel} details
  const handleViewDetails = (id: string) => {
    router.push(\`/saas/${modelNamePlural}/\${id}\`);
  };

  // Navigate to edit ${modelNameCamel}
  const handleEdit${modelName} = (id: string) => {
    router.push(\`/saas/${modelNamePlural}/\${id}/edit\`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push("/saas/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">${modelNamePluralCapital}</h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap gap-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search ${modelNamePlural}..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {/* Add additional filters here if needed */}
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add ${modelName}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p>Loading ${modelNamePlural}...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  ${generateTableHeaders(model)}
                  <TableHead onClick={() => handleSort("createdAt")} className="cursor-pointer">
                    Created At <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {${modelNamePlural}.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={${getColumnCount(model)}} className="h-24 text-center">
                      No ${modelNamePlural} found.
                    </TableCell>
                  </TableRow>
                ) : (
                  ${modelNamePlural}.map((${modelNameCamel}) => (
                    <TableRow key={${modelNameCamel}.id}>
                      ${generateTableCells(model)}
                      <TableCell>{formatDate(${modelNameCamel}.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(${modelNameCamel}.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit${modelName}(${modelNameCamel}.id)}>
                              Edit ${modelName}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete${modelName}(${modelNameCamel}.id)}
                              className="text-red-600"
                            >
                              Delete ${modelName}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
`;
}

function generateInterfaceFields(model: Model): string {
  const fields = model.fields.filter((f) => !f.isId);

  return fields
    .map((field) => {
      const type = getFieldType(field);
      return `${field.name}: ${type}${field.isRequired ? "" : " | null"};`;
    })
    .join("\n  ");
}

function generateTableHeaders(model: Model): string {
  // Select key fields for display in the table
  const displayFields = getDisplayFields(model);

  return displayFields
    .map((field) => {
      return `<TableHead onClick={() => handleSort("${field.name}")} className="cursor-pointer">
                    ${formatFieldLabel(field.name)} <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  </TableHead>`;
    })
    .join("\n                  ");
}

function getDisplayFields(model: Model): Field[] {
  // Get fields suitable for display in table list view
  const fields = model.fields.filter(
    (f) => !f.isId && f.name !== "createdAt" && f.name !== "updatedAt" && f.name !== "deletedAt",
  );

  // Limit to first 4-5 fields to avoid table getting too wide
  return fields.slice(0, Math.min(4, fields.length));
}

function getColumnCount(model: Model): number {
  // Count the number of columns in the table
  // Display fields + created at + actions
  return getDisplayFields(model).length + 2;
}

function generateTableCells(model: Model): string {
  const displayFields = getDisplayFields(model);

  return displayFields
    .map((field) => {
      if (field.type === "Boolean") {
        return `<TableCell>{${toCamelCase(model.name)}.${field.name} ? "Yes" : "No"}</TableCell>`;
      } else if (field.type === "DateTime") {
        return `<TableCell>{formatDate(${toCamelCase(model.name)}.${field.name})}</TableCell>`;
      } else if (field.isRelation) {
        return `<TableCell>{${toCamelCase(model.name)}.${field.name}?.name || "N/A"}</TableCell>`;
      } else {
        return `<TableCell>{${toCamelCase(model.name)}.${field.name}}</TableCell>`;
      }
    })
    .join("\n                      ");
}

function generateDetailPage(model: Model): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const modelNamePlural = pluralize(modelNameCamel);

  return `"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { delete${modelName}, get${modelName}ById } from "@/app/saas/${modelNamePlural}/actions";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/displayUtils";

interface ${modelName} {
  id: string;
  ${generateInterfaceFields(model)}
  createdAt: Date;
  updatedAt: Date;
}

export default function ${modelName}DetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [${modelNameCamel}, set${modelName}] = useState<${modelName} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch${modelName} = async () => {
      setIsLoading(true);
      try {
        const response = await get${modelName}ById(params.id);
        if (response.success) {
          set${modelName}(response?.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch ${modelNameCamel} details",
            variant: "destructive",
          });
          router.push("/saas/${modelNamePlural}/list");
        }
      } catch (error) {
        console.error("Error fetching ${modelNameCamel} details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetch${modelName}();
  }, [params.id, router]);

  const handleBack = () => {
    router.push("/saas/${modelNamePlural}/list");
  };

  const handleEdit = () => {
    router.push(\`/saas/${modelNamePlural}/\${params.id}/edit\`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this ${modelNameCamel}?")) {
      try {
        const response = await delete${modelName}(params.id);

        if (response.success) {
          toast({
            title: "Success",
            description: "${modelName} deleted successfully",
          });
          router.push("/saas/${modelNamePlural}/list");
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete ${modelNameCamel}",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting ${modelNameCamel}:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading ${modelNameCamel} details...</p>
      </div>
    );
  }

  if (!${modelNameCamel}) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>${modelName} not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">${modelName} Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        ${generateDetailCards(model)}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="mt-1">{formatDate(${modelNameCamel}.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Updated At</p>
              <p className="mt-1">{formatDate(${modelNameCamel}.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;
}

function generateDetailCards(model: Model): string {
  // Group fields for display in cards
  const fields = model.fields.filter(
    (f) => !f.isId && f.name !== "createdAt" && f.name !== "updatedAt" && f.name !== "deletedAt",
  );

  // Basic info card with the first few fields
  const basicFields = fields.slice(0, Math.min(6, fields.length));
  let cards = `
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            ${basicFields
              .map((field) => {
                if (field.type === "Boolean") {
                  return `<div>
              <p className="text-sm font-medium text-gray-500">${formatFieldLabel(field.name)}</p>
              <p className="mt-1">{${toCamelCase(model.name)}.${field.name} ? "Yes" : "No"}</p>
            </div>`;
                } else if (field.type === "DateTime") {
                  return `<div>
              <p className="text-sm font-medium text-gray-500">${formatFieldLabel(field.name)}</p>
              <p className="mt-1">{formatDate(${toCamelCase(model.name)}.${field.name})}</p>
            </div>`;
                } else {
                  return `<div>
              <p className="text-sm font-medium text-gray-500">${formatFieldLabel(field.name)}</p>
              <p className="mt-1">{${toCamelCase(model.name)}.${field.name}}</p>
            </div>`;
                }
              })
              .join("\n            ")}
          </CardContent>
        </Card>
  `;

  // Additional cards for remaining fields
  const remainingFields = fields.slice(Math.min(6, fields.length));
  if (remainingFields.length > 0) {
    cards += `
        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            ${remainingFields
              .map((field) => {
                if (field.type === "Boolean") {
                  return `<div>
              <p className="text-sm font-medium text-gray-500">${formatFieldLabel(field.name)}</p>
              <p className="mt-1">{${toCamelCase(model.name)}.${field.name} ? "Yes" : "No"}</p>
            </div>`;
                } else if (field.type === "DateTime") {
                  return `<div>
              <p className="text-sm font-medium text-gray-500">${formatFieldLabel(field.name)}</p>
              <p className="mt-1">{formatDate(${toCamelCase(model.name)}.${field.name})}</p>
            </div>`;
                } else {
                  return `<div>
              <p className="text-sm font-medium text-gray-500">${formatFieldLabel(field.name)}</p>
              <p className="mt-1">{${toCamelCase(model.name)}.${field.name}}</p>
            </div>`;
                }
              })
              .join("\n            ")}
          </CardContent>
        </Card>
    `;
  }

  return cards;
}

function generateCreatePage(model: Model): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const modelNamePlural = pluralize(modelNameCamel);

  return `"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ${modelName}Form from "../components/${modelName}Form";

export default function Create${modelName}Page() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/saas/${modelNamePlural}/list");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Create New ${modelName}</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <${modelName}Form />
        </div>
      </div>
    </div>
  );
}
`;
}

function generateEditPage(model: Model): string {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const modelNamePlural = pluralize(modelNameCamel);

  return `"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ${modelName}Form from "../../components/${modelName}Form";
import { get${modelName}ById } from "@/app/saas/${modelNamePlural}/actions";
import { toast } from "@/hooks/use-toast";

export default function Edit${modelName}Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [${modelNameCamel}Data, set${modelName}Data] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch${modelName} = async () => {
      setIsLoading(true);
      try {
        const response = await get${modelName}ById(params.id);
        if (response.success) {
          set${modelName}Data(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch ${modelNameCamel} details",
            variant: "destructive",
          });
          router.push("/saas/${modelNamePlural}/list");
        }
      } catch (error) {
        console.error("Error fetching ${modelNameCamel} details:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        router.push("/saas/${modelNamePlural}/list");
      } finally {
        setIsLoading(false);
      }
    };

    fetch${modelName}();
  }, [params.id, router]);

  const handleBack = () => {
    router.push(\`/saas/${modelNamePlural}/\${params.id}\`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading ${modelNameCamel} details...</p>
      </div>
    );
  }

  if (!${modelNameCamel}Data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>${modelName} not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Edit ${modelName}</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <${modelName}Form initialData={${modelNameCamel}Data} isEditMode={true} />
        </div>
      </div>
    </div>
  );
}
`;
}

// Main file generation function
export function generateFiles(model: Model, basePath: string) {
  const modelName = model.name;
  const modelNameCamel = toCamelCase(modelName);
  const modelNamePlural = pluralize(modelNameCamel);
  const modelNameKebabPlural = toKebabCase(pluralize(modelName));

  // Create the base directory for the model in plural form
  const modelBasePath = path.join(basePath, `/${modelNameKebabPlural}`);
  ensureDirectoryExists(modelBasePath);

  // Create subdirectories
  const createPath = path.join(modelBasePath, "/create");
  const listPath = path.join(modelBasePath, "/list");
  const idPath = path.join(modelBasePath, "/[id]");
  const editPath = path.join(idPath, "/edit");
  const componentsPath = path.join(modelBasePath, "/components");
  const testsPath = path.join(modelBasePath, "/__tests__");

  ensureDirectoryExists(createPath);
  ensureDirectoryExists(listPath);
  ensureDirectoryExists(idPath);
  ensureDirectoryExists(editPath);
  ensureDirectoryExists(componentsPath);
  ensureDirectoryExists(testsPath);

  // Generate the Zod Schema
  const schemaBasePath = path.join(basePath, "/../../../schemas");
  ensureDirectoryExists(schemaBasePath);
  writeFileIfNotExists(path.join(schemaBasePath, `${modelNameCamel}Schema.ts`), generateZodSchema(model));

  // Generate server actions
  writeFileIfNotExists(path.join(modelBasePath, "actions.ts"), generateActionFile(model));

  // Generate components
  writeFileIfNotExists(path.join(componentsPath, `${modelName}Form.tsx`), generateFormComponent(model));

  // Generate pages
  writeFileIfNotExists(path.join(listPath, "page.tsx"), generateListPage(model));

  writeFileIfNotExists(path.join(createPath, "page.tsx"), generateCreatePage(model));

  writeFileIfNotExists(path.join(idPath, "page.tsx"), generateDetailPage(model));

  writeFileIfNotExists(path.join(editPath, "page.tsx"), generateEditPage(model));

  // Generate test stubs
  writeFileIfNotExists(path.join(testsPath, "actions.test.ts"), `// Tests for ${modelName} actions`);

  writeFileIfNotExists(path.join(testsPath, `${modelName}Form.test.tsx`), `// Tests for ${modelName} form component`);

  writeFileIfNotExists(path.join(testsPath, "ListPage.test.tsx"), `// Tests for ${modelName} list page`);

  writeFileIfNotExists(path.join(testsPath, "DetailPage.test.tsx"), `// Tests for ${modelName} detail page`);

  writeFileIfNotExists(path.join(testsPath, "CreatePage.test.tsx"), `// Tests for ${modelName} create page`);

  writeFileIfNotExists(path.join(testsPath, "EditPage.test.tsx"), `// Tests for ${modelName} edit page`);

  console.log(`Successfully generated files for ${modelName} in ${modelBasePath}`);
}
