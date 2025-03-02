"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { GenericForm } from "@/components/ui/generic/GenericForm";
import { createBankAction, updateBankAction } from "./actions";

// Define schema for the form
const BankFormSchema = z.object({
  name: z.string().min(1, "Bank name is required"),
});

type BankFormProps = {
  bank?: z.infer<typeof BankFormSchema> & { id: string };
  onSuccess?: () => void;
};

export default function BankForm({ bank, onSuccess }: BankFormProps) {
  const router = useRouter();
  const isEditMode = !!bank;

  // Define form fields
  const fields = [
    {
      name: "name",
      label: "Bank Name",
      type: "text" as const,
      required: true,
    },
    // Add more fields as needed
  ];

  // Handle form submission - make this a client-side function that calls the server action
  const handleSubmit = async (data: z.infer<typeof BankFormSchema>) => {
    console.log("Form submitted with data:", data);
    try {
      if (isEditMode && bank) {
        const result = await updateBankAction(bank.id, data);
        console.log("Update result:", result);
        return result;
      } else {
        const result = await createBankAction(data);
        console.log("Create result:", result);
        return result;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  };

  return (
    <GenericForm
      fields={fields}
      schema={BankFormSchema}
      initialData={bank || { name: "" }} // Provide default values for all fields
      onSubmit={handleSubmit}
      submitLabel={isEditMode ? "Update Bank" : "Create Bank"}
      onSuccess={onSuccess || (() => router.push("/saas/banks/list"))}
    />
  );
}
