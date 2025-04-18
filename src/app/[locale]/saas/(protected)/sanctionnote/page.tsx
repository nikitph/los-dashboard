"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface VerificationItem {
  id: number;
  title: string;
  document: string;
}

const verificationItems: VerificationItem[] = [
  { id: 1, title: "Address", document: "Aadhar" },
  { id: 2, title: "Identity", document: "PAN" },
  { id: 3, title: "Income", document: "Income Documents" },
  { id: 4, title: "Loan Eligibility", document: "Loan Policy" },
  { id: 5, title: "Residence", document: "Verification Report" },
  { id: 6, title: "Business", document: "Verification Report" },
];

const SanctionNote = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-left max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-medium tracking-tight">Sanction Note</h1>
          <div className="rounded-md bg-[#2A3558] px-4 py-2 text-white">Abha 32430294</div>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-700">
          All of the documents their verification listed below are in order as per the bank loan policy.
        </p>

        {/* Verification Table */}
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableBody>
              {verificationItems.map((item, index) => (
                <TableRow key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <TableCell className="font-large w-16">{item.id}.</TableCell>
                  <TableCell className="w-48 font-medium">{item.title}</TableCell>
                  <TableCell className="text-gray-600">{item.document}</TableCell>
                  <TableCell className="text-right">
                    <RadioGroup defaultValue="yes" className="flex justify-end gap-8">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`yes-${item.id}`} />
                        <Label htmlFor={`yes-${item.id}`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`no-${item.id}`} />
                        <Label htmlFor={`no-${item.id}`}>No</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Remarks Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Your Remark</h2>
          <Textarea
            className="min-h-[100px]"
            defaultValue="I have verified all of the above documents myself and authorize this application for sanction"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
          <Button variant="outline" className="w-[200px]">
            Back
          </Button>
          <Button className="w-[500px] bg-[#2A3558] hover:bg-[#2A3558]/90">Proceed for Sanction and Approve</Button>
        </div>
      </div>
    </div>
  );
};

export default SanctionNote;
