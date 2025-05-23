"use client";

import React from "react";
import { CheckboxCard } from "@/subframe/components/CheckboxCard";
import { TextField } from "@/subframe/components/TextField";
import { Badge } from "@/subframe/components/Badge";
import { IconButton } from "@/subframe/components/IconButton";
import { Button } from "@/subframe/components/Button";

function LoanNumberConfigForm({ bankId }: { bankId: string }) {
  return (
    <div className="flex w-full flex-col items-start gap-6 bg-default-background px-6 py-6">
      <span className="font-heading-2 text-heading-2 text-default-font">Loan Application Number Configuration</span>
      <div className="flex w-full items-start gap-6">
        <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6">
          <div className="flex w-full flex-col items-start gap-4">
            <span className="font-heading-3 text-heading-3 text-default-font">Configure Format</span>
            <div className="flex w-full flex-col items-start gap-2">
              <CheckboxCard checked={false} onCheckedChange={(checked: boolean) => {}}>
                <span className="font-body text-body text-default-font">Bank Name Prefix (First 3 letters)</span>
              </CheckboxCard>
              <CheckboxCard checked={false} onCheckedChange={(checked: boolean) => {}}>
                <span className="font-body text-body text-default-font">Branch Serial Number</span>
              </CheckboxCard>
              <CheckboxCard checked={false} onCheckedChange={(checked: boolean) => {}}>
                <span className="font-body text-body text-default-font">Type of Loan</span>
              </CheckboxCard>
              <CheckboxCard checked={false} onCheckedChange={(checked: boolean) => {}}>
                <span className="font-body text-body text-default-font">Date of Application</span>
              </CheckboxCard>
              <CheckboxCard checked={false} onCheckedChange={(checked: boolean) => {}}>
                <span className="font-body text-body text-default-font">Serial Number</span>
              </CheckboxCard>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="font-heading-3 text-heading-3 text-default-font">Format Settings</span>
            <TextField className="h-auto w-full flex-none" label="Separator" helpText="">
              <TextField.Input
                placeholder="Hyphen (-)"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
            <TextField className="h-auto w-full flex-none" label="Bank Name" helpText="">
              <TextField.Input
                placeholder="First National Bank"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
            <TextField className="h-auto w-full flex-none" label="Branch Number" helpText="">
              <TextField.Input
                placeholder="001"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
            <TextField className="h-auto w-full flex-none" label="Loan Type" helpText="">
              <TextField.Input
                placeholder="Home Loan (HL)"
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
          </div>
        </div>
        <div className="flex shrink-0 grow basis-0 flex-col items-start gap-6">
          <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4">
            <span className="font-heading-3 text-heading-3 text-default-font">Application Number Preview</span>
            <div className="flex w-full items-center justify-center rounded-md border border-solid border-neutral-border bg-default-background px-4 py-2">
              <span className="font-heading-2 text-heading-2 text-default-font">00001</span>
            </div>
            <span className="font-caption text-caption text-subtext-color">
              This is how the application number will appear in your system
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-4 rounded-md border border-dashed border-error-300 bg-error-50 px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <span className="font-heading-3 text-heading-3 text-default-font">Application Number Rules</span>
              <Badge variant="error">DIV</Badge>
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <IconButton
                  size="small"
                  icon="FeatherInfo"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <span className="font-body text-body text-default-font">
                  Serial number is always included by default
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  size="small"
                  icon="FeatherInfo"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <span className="font-body text-body text-default-font">
                  Bank name prefix uses the first 3 letters of the bank&#39;s name
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  size="small"
                  icon="FeatherInfo"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <span className="font-body text-body text-default-font">Date format is DDMMYY (day, month, year)</span>
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  size="small"
                  icon="FeatherInfo"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <span className="font-body text-body text-default-font">
                  Serial numbers are always padded with leading zeros
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              <span className="font-body-bold text-body-bold text-default-font">Sample Application Numbers</span>
              <div className="flex w-full flex-col items-start gap-1">
                <span className="font-body text-body text-default-font">FNB-001-HL-230624-00001</span>
                <span className="font-body text-body text-default-font">FNB/001/PL/230624/00002</span>
                <span className="font-body text-body text-default-font">FNB_AL_00003</span>
                <span className="font-body text-body text-default-font">001.230624.00004</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-start gap-2 rounded-md bg-brand-50 px-4 py-4">
          <IconButton
            size="small"
            icon="FeatherLightbulb"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          />
          <span className="font-body text-body text-default-font">
            Creating a structured application number format helps in quick identification and categorization of
            applications. Consider what information is most important for your bank&#39;s workflow.
          </span>
        </div>
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="neutral-secondary" onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>
            Reset
          </Button>
          <Button onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>Save Configuration</Button>
        </div>
      </div>
    </div>
  );
}

export default LoanNumberConfigForm;
