"use client";

import * as React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepProps {
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  index: number;
}

export const Step: React.FC<StepProps> = ({ title, description, isCompleted, isActive, index }) => {
  return (
    <div className="flex items-center">
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border-[1px]",
            isCompleted
              ? "border-primary bg-primary text-primary-foreground"
              : isActive
                ? "border-primary"
                : "border-gray-300",
          )}
        >
          {isCompleted ? <Check className="h-3 w-3" /> : <span className="text-xs font-medium">{index + 1}</span>}
        </div>
      </div>
      {
        <div className="ml-2">
          {/*<p*/}
          {/*  className={cn("text-sm font-medium", isActive || isCompleted ? "text-foreground" : "text-muted-foreground")}*/}
          {/*>*/}
          {/*  {title}*/}
          {/*</p>*/}
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
      }
    </div>
  );
};

interface StepperProps {
  steps: Array<{ title: string; description?: string }>;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function HorizontalSteps({ steps, currentStep, onStepChange }: StepperProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-3 mt-3 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.title}>
            <Step
              title={step.title}
              description={step.description}
              isCompleted={index < currentStep}
              index={index}
              isActive={index === currentStep}
            />
            {index < steps.length - 1 && <ChevronRight className="hidden text-muted-foreground md:block" />}
          </React.Fragment>
        ))}
      </div>
      {/*<div className="flex justify-between">*/}
      {/*  <Button variant="outline" onClick={() => onStepChange(currentStep - 1)} disabled={currentStep === 0}>*/}
      {/*    Previous*/}
      {/*  </Button>*/}
      {/*  <Button onClick={() => onStepChange(currentStep + 1)} disabled={currentStep === steps.length - 1}>*/}
      {/*    {currentStep === steps.length - 1 ? "Finish" : "Next"}*/}
      {/*  </Button>*/}
      {/*</div>*/}
    </div>
  );
}
