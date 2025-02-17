"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VerificationEntry = ({
  id,
  name,
  designation,
  date,
  time,
  type,
}: {
  id: string;
  name: string;
  designation: string;
  date: string;
  time: string;
  type: "Residence Verification" | "Business Verification";
}) => (
  <div className="space-y-4 rounded-lg border bg-gray-50 p-6">
    <div className="grid grid-cols-6 gap-4 text-sm">
      <div>{id}</div>
      <div>{name}</div>
      <div>{designation}</div>
      <div>{date}</div>
      <div>{time}</div>
      <div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">Verified</span>
      </div>
    </div>
    <div className="flex gap-4">
      <div className="rounded-md bg-[#2A3558] px-4 py-2 text-sm text-white">{type}</div>
      <div className="flex-1 rounded-lg border bg-white p-4">
        All the necessities have been checked and verified, the loan is recommended for sanction.
      </div>
    </div>
  </div>
);
const VerificationSection = ({
  title,
  remarks = "The inspecting officer reports are satisfactory.",
}: {
  title: string;
  remarks?: string;
}) => (
  <div className="space-y-6">
    {/* Remarks Section */}
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Your Remarks</h2>
      <Textarea className="min-h-[100px]" defaultValue={remarks} />
    </div>
    {/* Result Section */}
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Result</h2>
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
  </div>
);
const PhysicalVerification = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-left max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Physical Verification</h1>
          <div className="rounded-md bg-[#2A3558] px-4 py-2 text-white">Abha 32430294</div>
        </div>
        {/* Residence Verification */}
        <div className="space-y-6">
          <VerificationEntry
            id="192837188"
            name="Abha"
            designation="Inspecting Officer"
            date="14/12/2024"
            time="3:33 AM"
            type="Residence Verification"
          />
          <VerificationSection title="Residence Verification" />
        </div>
        {/* Business Verification */}
        <div className="space-y-6">
          <VerificationEntry
            id="192837188"
            name="Abha"
            designation="Inspecting Officer"
            date="14/12/2024"
            time="6:39 AM"
            type="Business Verification"
          />
          <VerificationSection title="Business Verification" />
        </div>
        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-4">
          <Button variant="outline" className="w-[200px]">
            Back
          </Button>
          <Button className="w-[200px] bg-[#2A3558] hover:bg-[#2A3558]/90">Proceed to Final Remarks</Button>
        </div>
      </div>
    </div>
  );
};
export default PhysicalVerification;
