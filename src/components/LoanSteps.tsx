"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Step {
  label: string;
  status: "completed" | "current" | "upcoming";
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function LoanSteps({ steps, currentStep }: StepIndicatorProps) {
  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="w-full max-w-xs rounded-lg bg-transparent p-6">
      <div className="mb-6 space-y-2">
        <div className="text-gray-600">Progress</div>
        <Progress value={progress} className="h-1 rounded" />
        <div className="text-gray text-sm">{progress}%</div>
      </div>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.label} className="mb-8 flex items-start last:mb-0">
            <div className="relative">
              <div
                className={cn(
                  "h-4 w-4 rounded-full",
                  step.status === "current"
                    ? "border-black bg-black"
                    : step.status === "completed"
                      ? "border-gray-400 bg-gray-400"
                      : "border-2 border-gray-400",
                )}
              />
              {index !== steps.length - 1 && (
                <div className="absolute left-2 top-4 h-[calc(36px)] w-[2px] -translate-x-1/2 bg-gray-400" />
              )}
            </div>
            <span className={cn("ml-3 text-sm", step.status === "current" ? "text-black" : "text-gray-600")}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
