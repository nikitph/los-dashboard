"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the shape of a loan detail entry for local state
interface Loan {
  outstandingLoan: string;
  emiAmount: string;
  loanDate: string;
  loanType: string;
  bankName: string;
}

export default function LoanObligationsForm() {
  const router = useRouter();
  const [cibilScore, setCibilScore] = useState("");
  const [loans, setLoans] = useState<Loan[]>([
    { outstandingLoan: "", emiAmount: "", loanDate: "", loanType: "", bankName: "" },
  ]);

  const handleAddLoan = () => {
    setLoans([...loans, { outstandingLoan: "", emiAmount: "", loanDate: "", loanType: "", bankName: "" }]);
  };

  const handleLoanChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newLoans = [...loans];
    newLoans[index][event.target.name as keyof Loan] = event.target.value;
    setLoans(newLoans);
  };

  const calculateTotalLoan = () => {
    return loans.reduce((total, loan) => total + Number(loan.outstandingLoan), 0);
  };

  const calculateTotalEmi = () => {
    return loans.reduce((total, loan) => total + Number(loan.emiAmount), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Existing Loan Obligations</h1>

      {/* CIBIL Score */}
      <div className="max-w-400px mb-6">
        <Label htmlFor="cibilScore" className="mb-2 block text-sm font-medium text-gray-700">
          CIBIL Score
        </Label>
        <Input
          type="text"
          id="cibilScore"
          className="mt-1 max-w-[200px]"
          value={cibilScore}
          onChange={(e) => setCibilScore(e.target.value)}
        />
      </div>

      {/* Loans Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-200 p-2 text-left"></th>
              <th className="border border-gray-200 p-2 text-left">Outstanding Loan</th>
              <th className="border border-gray-200 p-2 text-left">EMI Amount</th>
              <th className="border border-gray-200 p-2 text-left">Loan Date</th>
              <th className="border border-gray-200 p-2 text-left">Loan Type</th>
              <th className="border border-gray-200 p-2 text-left">Name of Bank</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan, index) => (
              <tr key={index}>
                <td className="border border-gray-200 p-2">{index + 1}.</td>
                <td className="border border-gray-200 p-2">
                  <Input
                    type="text"
                    name="outstandingLoan"
                    className="mt-1 w-full"
                    value={loan.outstandingLoan}
                    onChange={(e) => handleLoanChange(index, e)}
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  <Input
                    type="text"
                    name="emiAmount"
                    className="mt-1 w-full"
                    value={loan.emiAmount}
                    onChange={(e) => handleLoanChange(index, e)}
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  <Input
                    type="date"
                    name="loanDate"
                    className="mt-1 w-full"
                    value={loan.loanDate}
                    onChange={(e) => handleLoanChange(index, e)}
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  <Input
                    type="text"
                    name="loanType"
                    className="mt-1 w-full"
                    value={loan.loanType}
                    onChange={(e) => handleLoanChange(index, e)}
                  />
                </td>
                <td className="border border-gray-200 p-2">
                  <Input
                    type="text"
                    name="bankName"
                    className="mt-1 w-full"
                    value={loan.bankName}
                    onChange={(e) => handleLoanChange(index, e)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="link" onClick={handleAddLoan} className="mt-4 text-blue-600 hover:text-blue-800">
        + add more
      </Button>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalLoan" className="mb-2 block text-sm font-medium text-gray-700">
            Total Loan
          </Label>
          <Input type="text" id="totalLoan" className="mt-1 w-full bg-gray-100" value={calculateTotalLoan()} readOnly />
        </div>
        <div>
          <Label htmlFor="totalEmi" className="mb-2 block text-sm font-medium text-gray-700">
            Total existing EMI
          </Label>
          <Input type="text" id="totalEmi" className="mt-1 w-full bg-gray-100" value={calculateTotalEmi()} readOnly />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => router.back()} className="px-4 py-2">
          Back
        </Button>
        <Button variant="default" className="px-4 py-2">
          Proceed to Income Details
        </Button>
      </div>
    </div>
  );
}
