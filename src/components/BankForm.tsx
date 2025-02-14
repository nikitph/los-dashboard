"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createBankAction, updateBankAction } from "@/app/saas/(private)/banks/actions";

interface BankFormProps {
  bank?: {
    id: string;
    name: string;
  };
}

export default function BankForm({ bank }: BankFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    if (bank) {
      await updateBankAction(bank.id, { name });
    } else {
      await createBankAction({ name });
    }

    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{bank ? "Edit Bank" : "Create Bank"}</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{bank ? "Edit Bank" : "Create Bank"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Input name="name" defaultValue={bank?.name} placeholder="Bank Name" />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
