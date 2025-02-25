"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const propertyTypes = ["House", "Apartment", "Villa", "Plot"];
const valuers = ["Michael Brown", "Sarah Wilson", "David Clark"];
const lawyers = ["John Doe", "Jane Smith", "Robert Johnson"];

const MortgageLoanAppraisal = () => {
  const navigate = (index: number) => {
    // Implement navigation logic here
  };
  const [valuationDate, setValuationDate] = useState<Date>();
  const [searchDate, setSearchDate] = useState<Date>();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50 p-6">
      <div className="mx-left max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-medium">Mortgage Loan Appraisal</h1>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Property Address */}
          <div className="space-y-4">
            <h2 className="text-base font-medium">Mortgage property address</h2>
            <div className="grid grid-cols-3 gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ka">Karnataka</SelectItem>
                  <SelectItem value="mh">Maharashtra</SelectItem>
                  <SelectItem value="dl">Delhi</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blr">Bangalore</SelectItem>
                  <SelectItem value="mum">Mumbai</SelectItem>
                  <SelectItem value="del">Delhi</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Zip Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="560001">560001</SelectItem>
                  <SelectItem value="560002">560002</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Full Address 1" className="bg-white" />
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type of property</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="House" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plot Size (in sq. ft.)</Label>
              <Input type="number" placeholder="Enter plot size" className="bg-white" />
            </div>

            <div className="space-y-2">
              <Label>Built area (in sq. ft.)</Label>
              <Input type="number" placeholder="Enter built area" className="bg-white" />
            </div>
          </div>

          {/* Valuation Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Property Valuation</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Name of the valuer" />
                </SelectTrigger>
                <SelectContent>
                  {valuers.map((valuer) => (
                    <SelectItem key={valuer} value={valuer.toLowerCase()}>
                      {valuer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date of valuation</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start bg-white text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {valuationDate ? format(valuationDate, "PP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={valuationDate} onSelect={setValuationDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Guideline value</Label>
              <Input type="number" placeholder="Enter value" className="bg-white" />
            </div>
          </div>

          {/* Reports */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valuation Report</Label>
              <div className="flex gap-2">
                <Input placeholder="Choose file" className="bg-white" readOnly />
                <Button className="bg-[#2A3558] hover:bg-[#2A3558]/90">Upload</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Market value</Label>
              <Input type="number" placeholder="Enter market value" className="bg-white" />
            </div>
          </div>

          {/* Legal Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of search Report</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start bg-white text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchDate ? format(searchDate, "PP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={searchDate} onSelect={setSearchDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Name of lawyer</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select lawyer" />
                </SelectTrigger>
                <SelectContent>
                  {lawyers.map((lawyer) => (
                    <SelectItem key={lawyer} value={lawyer.toLowerCase()}>
                      {lawyer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Legal Reports */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Legal search Report</Label>
              <div className="flex gap-2">
                <Input placeholder="Choose file" className="bg-white" readOnly />
                <Button className="bg-[#2A3558] hover:bg-[#2A3558]/90">Upload</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Legal Property documents as per LSR</Label>
              <div className="flex gap-2">
                <Input placeholder="Choose file" className="bg-white" readOnly />
                <Button className="bg-[#2A3558] hover:bg-[#2A3558]/90">Upload</Button>
              </div>
            </div>
          </div>

          {/* Loan Eligibility */}
          <div className="space-y-4">
            <h2 className="text-base font-medium">Loan Eligibility</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <Input value="20,00,000" className="h-12 w-[280px] bg-white text-center text-xl" readOnly />
                <span className="text-base">As Per Income Document</span>
              </div>

              <div className="flex items-center gap-8">
                <Input value="50,00,000" className="h-12 w-[280px] bg-white text-center text-xl" readOnly />
                <span className="text-base">As Per Property valuation</span>
              </div>

              <div className="flex items-center gap-8">
                <Input value="30,00,000" className="h-12 w-[280px] bg-white text-center text-xl" readOnly />
                <span className="text-base">As Per Loan Application</span>
              </div>

              <div className="flex items-center gap-8">
                <Input value="25,00,000" className="h-12 w-[280px] bg-white text-center text-xl" readOnly />
                <span className="text-base">Proposed Loan Amount</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" className="w-32 bg-white" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button className="w-64 bg-gradient-to-r from-[#2A3558] to-[#2A3558]/90 hover:from-[#2A3558]/90 hover:to-[#2A3558]">
              Proceed to Loan Verification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageLoanAppraisal;
