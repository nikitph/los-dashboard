"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const LoanProcessing = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-left max-w-4xl rounded-xl bg-transparent">
        <div className="space-y-8 p-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-semibold tracking-tight">Loan Processing</h1>
            </div>
            <div className="rounded-md bg-[#2A3558] px-4 py-2 text-white">Siddharth 1234758239</div>
          </div>
          {/* Processing Details Table */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Designation</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date of Verification</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Time of Verification</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-4">32948023</td>
                  <td className="px-6 py-4">Siddharth</td>
                  <td className="px-6 py-4">Clerical Officer</td>
                  <td className="px-6 py-4">12/12/2024</td>
                  <td className="px-6 py-4">11:00 AM</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      Verified
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Loan Processing Section */}
          <div className="space-y-4">
            <Button variant="secondary" className="bg-[#2A3558] text-white hover:bg-[#2A3558]/90">
              Loan Processing
            </Button>
            <div className="rounded-lg border p-4">
              All the necessities have been checked and verified, the loan is recommended for sanction.
            </div>
          </div>
          {/* View Process Button */}
          <Button variant="outline" className="w-full">
            View Loan Processing Process
          </Button>
          {/* Remarks Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Remarks</h2>
            <Textarea className="min-h-[100px]" defaultValue="Clerical officer's remarks are satisfactory" />
          </div>
          {/* Result Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Result</h2>
            <div className="flex items-start gap-4">
              <Select defaultValue="yes">
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-green-600">Verification has been successful, no discrepancies were found</p>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-between gap-4 border-t pt-4">
            <Button variant="outline">Back</Button>
            <Button className="bg-[#2A3558] hover:bg-[#2A3558]/90">Proceed to Physical Verification Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoanProcessing;
