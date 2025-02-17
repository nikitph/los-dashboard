"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Calendar as CalendarIcon, Upload } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const BusinessVerification = () => {
  const [date, setDate] = useState<Date>();
  const [image, setImage] = useState<string | null>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-2xl rounded-xl bg-transparent">
        <div className="form-fade-in space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">Business Verification</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Verification Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Verification Time</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={`${i}:00`}>
                        {i < 12 ? `${i || 12}:00 AM` : `${i - 12 || 12}:00 PM`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <Label>Business Address</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ca">California</SelectItem>
                    <SelectItem value="ny">New York</SelectItem>
                    <SelectItem value="tx">Texas</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="sf">San Francisco</SelectItem>
                    <SelectItem value="la">Los Angeles</SelectItem>
                    <SelectItem value="sd">San Diego</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Zip Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="94101">94101</SelectItem>
                    <SelectItem value="94102">94102</SelectItem>
                    <SelectItem value="94103">94103</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Full Address 1" />
          </div>
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input placeholder="Business Name" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="proprietorship">Proprietorship</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contact Details</Label>
              <Input placeholder="Contact no." type="tel" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Business Existence</Label>
              <Select defaultValue="yes">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nature of Business</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Sale/Income per day</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="5000-10000">5,000-10,000</SelectItem>
                    <SelectItem value="10000-20000">10,000-20,000</SelectItem>
                    <SelectItem value="20000-50000">20,000-50,000</SelectItem>
                    <SelectItem value="50000+">50,000+</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Photograph of Business</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                {image && (
                  <div className="h-20 w-20 overflow-hidden rounded-lg">
                    <img src={image} alt="Business" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Less than 5 MB</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Remark</Label>
            <Textarea
              placeholder="Add your remarks here"
              className="min-h-[100px]"
              defaultValue="Based on the verification findings, it is concluded that the applicant's Business at [Business Address] has been verified and the application can proceed to the next stage."
            />
          </div>
          <div className="space-y-2">
            <Label>Result</Label>
            <Select defaultValue="yes">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-sm text-green-600">Verification has been successful, no discrepancies were found</p>
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline">Back</Button>
            <Button>Proceed to Complete Verification</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BusinessVerification;
