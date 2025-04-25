"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const brands = ["Toyota", "Honda", "Hyundai", "Maruti Suzuki", "Tata", "Mahindra"];
const types = ["Hatchback", "Sedan", "SUV", "MUV", "Luxury"];

const VehicleAppraisalForm = ({ lid, aid }) => {
  const navigate = (index: number) => {};
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const getModels = (brand: string) => {
    const modelsByBrand: Record<string, string[]> = {
      toyota: ["Innova", "Fortuner", "Camry", "Glanza"],
      honda: ["City", "Amaze", "WR-V", "Jazz"],
      hyundai: ["Creta", "Venue", "i20", "Verna"],
      "maruti suzuki": ["Swift", "Baleno", "Brezza", "Dzire"],
      tata: ["Nexon", "Harrier", "Safari", "Punch"],
      mahindra: ["XUV700", "Thar", "Scorpio", "XUV300"],
    };
    return modelsByBrand[brand.toLowerCase()] || [];
  };

  return (
    <div className="mx-center min-h-screen w-full p-6">
      <div className="mx-left max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-medium">Vehicle Loan Appraisal</h1>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Dealership Details */}
          <div className="space-y-4">
            <h2 className="text-base font-medium">Dealership Name and Location</h2>
            <Input placeholder="Dealership Name" className="bg-white" />
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

          {/* Vehicle Details */}
          <div className="space-y-4">
            <h2 className="text-base font-medium">Vehicle Details</h2>
            <div className="grid grid-cols-3 gap-4">
              <Select onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand.toLowerCase()}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {getModels(selectedBrand).map((model) => (
                    <SelectItem key={model} value={model.toLowerCase()}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Input placeholder="On Road Price as per quotation" className="flex-1 bg-white" readOnly />
              <Button className="bg-[#2A3558] hover:bg-[#2A3558]/90">Upload</Button>
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

export default VehicleAppraisalForm;
