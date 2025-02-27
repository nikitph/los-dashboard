"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "select" | "textarea";
  options?: { label: string; value: string }[]; // For select fields
  required?: boolean;
}

interface GenericFormProps {
  fields: Field[];
  schema: z.ZodTypeAny;
  initialData?: any;
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  submitLabel?: string;
  onSuccess?: () => void;
}

export function GenericForm({
  fields,
  schema,
  initialData = {},
  onSubmit,
  submitLabel = "Submit",
  onSuccess,
}: GenericFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("Initial data:", initialData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  // Log errors whenever they change
  console.log("Form errors:", errors);
  console.log("Form is valid:", isValid);

  // Handle specialized field changes (select, checkbox, etc.)
  const handleFieldChange = (name: string, value: any) => {
    console.log(`Field change: ${name} = ${value}`);
    setValue(name, value, { shouldValidate: true });
  };

  const processSubmit = async (data: any) => {
    console.log("Form submitted with data:", data);
    setIsSubmitting(true);
    try {
      if (!onSubmit) {
        console.error("No onSubmit function provided");
        toast({
          title: "Error",
          description: "Form submission handler is missing",
          variant: "destructive",
        });
        return;
      }

      console.log("Calling onSubmit with data:", data);
      const result = await onSubmit(data);
      console.log("onSubmit result:", result);

      if (result.success) {
        toast({
          title: "Success",
          description: "Operation completed successfully",
        });
        if (onSuccess) {
          console.log("Calling onSuccess callback");
          onSuccess();
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    toast({
      title: "Validation Error",
      description: "Please check the form for errors",
      variant: "destructive",
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit, onError)} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name}>{field.label}</Label>

          {field.type === "text" && <Input id={field.name} {...register(field.name)} className="mt-1 w-full" />}

          {field.type === "number" && (
            <Input
              id={field.name}
              type="number"
              {...register(field.name, { valueAsNumber: true })}
              className="mt-1 w-full"
            />
          )}

          {field.type === "date" && (
            <Input
              id={field.name}
              type="date"
              {...register(field.name, { valueAsDate: true })}
              className="mt-1 w-full"
            />
          )}

          {field.type === "textarea" && (
            <textarea
              id={field.name}
              {...register(field.name)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
              rows={4}
            />
          )}

          {field.type === "boolean" && (
            <div className="mt-1 flex items-center space-x-2">
              <Checkbox
                id={field.name}
                checked={watch(field.name)}
                onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              />
              <label htmlFor={field.name} className="text-sm">
                {field.label}
              </label>
            </div>
          )}

          {field.type === "select" && field.options && (
            <Select value={watch(field.name)} onValueChange={(value) => handleFieldChange(field.name, value)}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Display validation errors */}
          {errors[field.name] && <p className="mt-1 text-sm text-red-600">{errors[field.name]?.message as string}</p>}
        </div>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
