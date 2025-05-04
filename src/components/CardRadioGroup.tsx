import React from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarDays, CreditCard } from "lucide-react";

export type TenureOption = {
  id: string;
  tenure: number;
  unit: string;
  emi: number;
};

type Props = {
  options: TenureOption[];
  selectedValue: string;
  setSelectedValue: (value: string) => void;
};

const EMITenureSelector = ({ options, selectedValue, setSelectedValue }: Props) => {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <RadioGroup
        value={selectedValue}
        onValueChange={setSelectedValue}
        className="flex space-x-3 overflow-x-auto pb-2"
      >
        {options.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "relative w-[140px] cursor-pointer",
              selectedValue === option.id
                ? "border-2 border-primary bg-primary/5"
                : "border hover:border-gray-300 hover:shadow-sm",
            )}
          >
            <label htmlFor={option.id} className="block h-full cursor-pointer">
              <input
                type="radio"
                id={option.id}
                value={option.id}
                checked={selectedValue === option.id}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="sr-only"
              />

              <CardContent className="p-4">
                {/* Tenure Section */}
                <div className="mb-3 flex items-center justify-center">
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full p-1.5",
                      selectedValue === option.id ? "bg-primary text-white" : "bg-gray-100",
                    )}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-bold">{option.tenure}</span>
                    <span className="ml-1 text-xs text-muted-foreground">{option.unit}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-3 border-t border-dashed border-gray-200"></div>

                {/* EMI Section */}
                <div className="text-center">
                  <div className="mb-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    <span>Monthly EMI</span>
                  </div>
                  <p className={cn("text-lg font-bold", selectedValue === option.id ? "text-primary" : "")}>
                    {`₹${option.emi.toLocaleString("en-IN")}`}
                  </p>
                </div>
              </CardContent>
            </label>
          </Card>
        ))}
      </RadioGroup>

      <div className="mt-6 flex items-center">
        <div className="rounded-md bg-gray-50 px-3 py-2">
          <p className="text-sm">
            Selected tenure:{" "}
            <span className="font-bold">
              {options.find((o) => o.id === selectedValue)?.tenure} {options.find((o) => o.id === selectedValue)?.unit}
            </span>{" "}
            with EMI of <span className="font-bold">{options.find((o) => o.id === selectedValue)?.emi}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EMITenureSelector;
