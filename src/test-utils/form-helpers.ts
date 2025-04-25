import { act, renderHook } from "@testing-library/react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Helper to create a test form with a specified schema
 *
 * @param schema - Zod schema for validation
 * @param defaultValues - Initial form values
 * @returns The form instance for testing
 */
export function setupTestForm<T extends z.ZodType>(
  schema: T,
  defaultValues = {},
): { result: { current: UseFormReturn<z.infer<T>> } } {
  const { result } = renderHook(() =>
    useForm<z.infer<T>>({
      resolver: zodResolver(schema),
      // @ts-ignore
      defaultValues,
    }),
  );

  return { result };
}

/**
 * Submit a form with test data
 *
 * @param form - React Hook Form instance
 * @param data - Data to submit
 */
export async function submitForm<T extends FieldValues>(form: UseFormReturn<T>, data: Partial<T>) {
  await act(async () => {
    form.reset(data as T);
    await form.handleSubmit((formData) => {
      // This is intentionally empty as we're just testing the validation
    })();
  });

  return form;
}

/**
 * Generate mock form data based on a schema
 *
 * @param schema - Zod schema to base mock data on
 * @returns Object with mock data matching the schema
 */
export function generateMockFormData<T extends z.ZodType>(schema: T): z.infer<T> {
  // Handle different schema types
  let shape: Record<string, z.ZodTypeAny> = {};

  // Object schemas
  if (schema instanceof z.ZodObject) {
    shape = schema.shape;
  }
  // If not an object schema, return an empty object
  else {
    return {} as z.infer<T>;
  }

  const result: Record<string, any> = {};

  for (const [key, field] of Object.entries(shape)) {
    // Basic type mappings
    if (field instanceof z.ZodString) {
      result[key] = `Test-${key}`;
    } else if (field instanceof z.ZodNumber) {
      result[key] = 123;
    } else if (field instanceof z.ZodBoolean) {
      result[key] = true;
    } else if (field instanceof z.ZodEnum) {
      result[key] = field.options[0];
    } else if (field instanceof z.ZodDate) {
      result[key] = new Date();
    } else if (field instanceof z.ZodOptional) {
      // For optional fields, provide a value 50% of the time
      if (Math.random() > 0.5) {
        const innerType = field.unwrap();
        if (innerType instanceof z.ZodString) {
          result[key] = `Optional-${key}`;
        }
      }
    } else {
      result[key] = undefined;
    }
  }

  return result as z.infer<T>;
}
