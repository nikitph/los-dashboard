"use client";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface TenureData {
  years: number;
  emi: string;
}

const tenureData: TenureData[] = [
  { years: 1, emi: "2,80,000" },
  { years: 2, emi: "" },
  { years: 3, emi: "" },
  { years: 4, emi: "" },
  { years: 5, emi: "" },
];

const LoanEligibility = () => {
  const navigate = () => {};
  const [selectedTenure, setSelectedTenure] = useState("1");

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-left max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-medium">Loan Eligibility Amount</h1>
        </div>

        {/* Amount Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-8">
            <Input value="20,00,000" className="h-12 w-[280px] text-center text-2xl" readOnly />
            <span className="text-base">As Per Income Document</span>
          </div>

          <div className="flex items-center gap-8">
            <Input value="30,00,000" className="h-12 w-[280px] text-center text-2xl" readOnly />
            <span className="text-base">As Per Loan Application</span>
          </div>

          <div className="flex items-center gap-8">
            <Input value="30,00,000" className="h-12 w-[280px] text-center text-2xl font-semibold" readOnly />
            <span className="text-base">Proposed Loan Amount</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="bg-gray-300 p-3 text-center">Message forwarded to Applicant</div>

        {/* Tenure Selection */}
        <div className="space-y-4">
          <h2 className="text-base font-normal">Tenure chosen by the applicant</h2>

          <div className="overflow-hidden rounded-sm border">
            <table className="w-full">
              <tbody>
                <tr className="bg-[#2A3558] text-white">
                  <td className="border-r p-3 text-sm">Tenure (in yrs)</td>
                  {tenureData.map((data) => (
                    <td key={data.years} className="p-3 text-center text-sm">
                      {data.years}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border-r bg-[#2A3558] p-3 text-sm text-white">EMI</td>
                  {tenureData.map((data) => (
                    <td key={data.years} className="border-r p-3 text-center text-sm last:border-r-0">
                      {data.emi}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <RadioGroup
            value={selectedTenure}
            onValueChange={setSelectedTenure}
            className="flex justify-center gap-12 pt-2"
          >
            {tenureData.map((data) => (
              <div key={data.years} className="flex items-center space-x-2">
                <RadioGroupItem value={data.years.toString()} id={`tenure-${data.years}`} />
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Agreement Section */}
        <div className="space-y-4">
          <h2 className="text-base font-normal">Applicant agrees to the loan amount</h2>
          <div className="flex gap-4">
            <Button className="w-24 bg-[#2A3558] px-8 text-base hover:bg-[#2A3558]/90">Yes</Button>
            <Button variant="outline" className="w-24 px-8 text-base">
              No
            </Button>
          </div>
        </div>

        {/* Income Status */}

        <div className="w-fit bg-[#2A3558] p-3 text-base text-white">Applicant Income does not match</div>
      </div>
    </div>
  );
};

export default LoanEligibility;
