"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

// Zod schemas (for reference)

const documentTypes = [
  { id: "taxableIncomeITR", label: "Taxable Income as per ITR" },
  { id: "taxPaidITR", label: "Tax Paid as per ITR" },
  { id: "grossIncomeCOI", label: "Gross Income as per COI" },
  { id: "rentalIncome", label: "Rental Income" },
  { id: "incomeFromBusiness", label: "Income From Business" },
  { id: "depreciationCOI", label: "Depreciation as per COI" },
  { id: "grossCashIncome", label: "Gross Cash Income" },
  { id: "averageGrossCashIncome", label: "Average Gross Cash Income" },
];

const businessDocumentOptions = ["Nagar Nigam Certificate", "Option 2", "Option 3"];

export default function IncomeDocumentationPage() {
  const [incomeType, setIncomeType] = useState("");
  const [incomeDocuments, setIncomeDocuments] = useState({
    taxableIncomeITR: ["", "", ""],
    taxPaidITR: ["", "", ""],
    grossIncomeCOI: ["", "", ""],
    rentalIncome: ["", "", ""],
    incomeFromBusiness: ["", "", ""],
    depreciationCOI: ["", "", ""],
    grossCashIncome: ["", "", ""],
    averageGrossCashIncome: ["", "", ""],
  });
  const [dependents, setDependents] = useState("");
  const [expenditure, setExpenditure] = useState("");
  const [businessDocumentType, setBusinessDocumentType] = useState("");

  const handleIncomeTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncomeType(e.target.value);
  };

  const handleDocumentUpload = (documentType: string, yearIndex: number, file: File | null) => {
    setIncomeDocuments((prevDocuments) => {
      const updatedDocuments = { ...prevDocuments };
      const updatedYearData = [...updatedDocuments[documentType as keyof typeof incomeDocuments]];
      updatedYearData[yearIndex] = file ? file.name : "";
      updatedDocuments[documentType as keyof typeof incomeDocuments] = updatedYearData;
      return updatedDocuments;
    });
  };

  return (
    <div className="container mx-auto space-y-8 p-4">
      <h1 className="text-2xl font-bold">Income Documentation</h1>

      {/* Income Type Section */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-gray-700">Type of Income</Label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-indigo-600"
              name="incomeType"
              value="businessOwner"
              checked={incomeType === "businessOwner"}
              onChange={handleIncomeTypeChange}
            />
            <span className="ml-2 text-gray-700">Business Owner</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-indigo-600"
              name="incomeType"
              value="salariedEmployee"
              checked={incomeType === "salariedEmployee"}
              onChange={handleIncomeTypeChange}
            />
            <span className="ml-2 text-gray-700">Salaried Employee</span>
          </label>
        </div>
      </div>

      {/* Income Documents Table */}
      <div className="space-y-4">
        <Label className="text-sm font-bold text-gray-700">Income Documents</Label>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Document/Year</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Year 1</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Year 2</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Year 3</th>
              </tr>
            </thead>
            <tbody>
              {documentTypes.map((docType) => (
                <tr key={docType.id}>
                  <td className="border px-4 py-2 text-sm">{docType.label}</td>
                  {["Year1", "Year2", "Year3"].map((year, index) => (
                    <td key={year} className="border px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          placeholder={`Enter ${docType.label}`}
                          value={incomeDocuments[docType.id as keyof typeof incomeDocuments][index]}
                          readOnly
                          className="w-full"
                        />
                        <label htmlFor={`${docType.id}-${year}-upload`} className="cursor-pointer">
                          <svg
                            className="h-5 w-5 text-gray-400 hover:text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L19.5 19.5m-18 1.5v-2a2 2 0 012-2h2m-2-1.5V12a2 2 0 012-2h2m-2-1.5V8a2 2 0 012-2h2m-2-1.5V4a2 2 0 012-2h2m-2-1.5H2a2 2 0 01-2 2v18a2 2 0 012 2h18a2 2 0 012-2v-2M7 16l2 2 4-4-5-5"
                            />
                          </svg>
                        </label>
                        <input
                          id={`${docType.id}-${year}-upload`}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleDocumentUpload(docType.id, index, e.target.files?.[0] || null)}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Additional rows for Gross Cash Income and Average Gross Cash Income */}
              <tr>
                <td className="border px-4 py-2 text-sm">Gross Cash Income</td>
                {["Year1", "Year2", "Year3"].map((year) => (
                  <td key={year} className="border px-4 py-2">
                    <Input type="text" className="w-full" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border px-4 py-2 text-sm">Average Gross Cash Income</td>
                {["Year1", "Year2", "Year3"].map((year) => (
                  <td key={year} className="border px-4 py-2">
                    <Input type="text" className="w-full" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dependents and Expenditure */}
      <div className="grid max-w-[500px] grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="dependents" className="mb-2 block text-sm font-bold text-gray-700">
            Number of Dependents
          </Label>
          <Input
            type="number"
            id="dependents"
            placeholder="Enter number of dependents"
            value={dependents}
            onChange={(e) => setDependents(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="expenditure" className="mb-2 block text-sm font-bold text-gray-700">
            Average Monthly Expenditure
          </Label>
          <Select onValueChange={(val) => setExpenditure(val)} value={expenditure}>
            <SelectTrigger className="w-full">{/* You can customize the trigger text if needed */}</SelectTrigger>
            <SelectContent>
              <SelectItem value="20% or more">20% or more</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Business Documents Section */}
      <div className="max-w-[500px] space-y-4">
        <Label htmlFor="businessDocumentType" className="mb-2 block text-sm font-bold text-gray-700">
          Business Documents
        </Label>
        <div className="flex items-center space-x-4">
          <Select onValueChange={(val) => setBusinessDocumentType(val)} value={businessDocumentType}>
            <SelectTrigger className="w-full">
              {/* If no selection, the trigger can display a placeholder */}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nagar Nigam Certificate">Nagar Nigam Certificate</SelectItem>
              {businessDocumentOptions.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="default" type="button">
            Upload
          </Button>
          <label htmlFor="business-doc-upload" className="cursor-pointer">
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L19.5 19.5m-18 1.5v-2a2 2 0 012-2h2m-2-1.5V12a2 2 0 012-2h2m-2-1.5V8a2 2 0 012-2h2m-2-1.5V4a2 2 0 012-2h2m-2-1.5H2a2 2 0 01-2 2v18a2 2 0 012 2h18a2 2 0 012-2v-2M7 16l2 2 4-4-5-5"
              />
            </svg>
          </label>
          <Input id="business-doc-upload" type="file" className="hidden" />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-4">
        <Button variant="outline" type="button">
          Back
        </Button>
        <Button variant="default" type="button">
          Proceed to Loan Verification
        </Button>
      </div>
    </div>
  );
}
