"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Clock,
  Edit2,
  Eye,
  Files,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

function IconWithBackground({ icon, variant = "default", size = "default" }) {
  const Icon = icon;

  const variantClasses = {
    default: "bg-slate-100 text-slate-900",
    warning: "bg-amber-100 text-amber-900",
    success: "bg-green-100 text-green-900",
    error: "bg-red-100 text-red-900",
  };

  const sizeClasses = {
    default: "w-8 h-8",
    medium: "w-10 h-10",
  };

  return (
    <div className={`flex items-center justify-center rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}>
      <Icon size={size === "medium" ? 20 : 16} />
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container space-y-6 px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Welcome back, Sarah</h1>
            <p className="text-sm font-medium text-slate-500">Monday, March 25, 2024</p>
          </div>
          <Link href="/saas/loan-applications/new">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              New Application
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <IconWithBackground icon={FileText} size="medium" />
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-slate-500">Today's Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <IconWithBackground icon={Files} variant="warning" size="medium" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-slate-500">Pending Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <IconWithBackground icon={CheckCircle} variant="success" size="medium" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-slate-500">Ready for Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <IconWithBackground icon={AlertCircle} variant="error" size="medium" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-slate-500">Rejected Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="px-6 pb-2">
            <div className="flex w-full items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                <Input placeholder="Search applications" className="pl-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="w-full space-y-0">
              <div className="flex items-center justify-between gap-4 border-b py-4">
                <div className="w-28 flex-none">
                  <p className="font-medium">APP-2024-001</p>
                  <p className="text-xs text-slate-500">John Smith</p>
                </div>
                <div className="flex w-80 flex-none items-center gap-2">
                  <Badge variant="outline" className="h-6 w-28 justify-center">
                    Home Loan
                  </Badge>
                  <span className="text-sm text-slate-500">$450,000</span>
                </div>
                <Badge variant="outline" className="flex gap-1 border-amber-200 bg-amber-50 text-amber-900">
                  <Clock size={14} /> Pending Documents
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Eye size={14} /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Edit2 size={14} /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Upload size={14} /> Upload Documents
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between gap-4 border-b py-4">
                <div className="w-28 flex-none">
                  <p className="font-medium">APP-2024-002</p>
                  <p className="text-xs text-slate-500">Emma Johnson</p>
                </div>
                <div className="flex w-80 flex-none items-center gap-2">
                  <Badge variant="outline" className="h-6 w-28 justify-center">
                    Business Loan
                  </Badge>
                  <span className="text-sm text-slate-500">$250,000</span>
                </div>
                <Badge variant="outline" className="flex gap-1 border-green-200 bg-green-50 text-green-900">
                  <Check size={14} /> Ready for Review
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Eye size={14} /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Edit2 size={14} /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Upload size={14} /> Upload Documents
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="px-6 pb-2">
              <div className="flex w-full items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Badge variant="secondary">5 pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <div className="flex items-center gap-4 rounded-md bg-slate-50 p-4">
                <IconWithBackground icon={Files} variant="warning" />
                <div>
                  <p className="font-medium">Document Collection</p>
                  <p className="text-xs text-slate-500">3 applications need documents</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-md bg-slate-50 p-4">
                <IconWithBackground icon={UserCheck} />
                <div>
                  <p className="font-medium">Verification Required</p>
                  <p className="text-xs text-slate-500">2 applications pending verification</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-6 pb-2">
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Document Collection</span>
                  <span className="font-medium">12</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Pending Verification</span>
                  <span className="font-medium">8</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Ready for Review</span>
                  <span className="font-medium">6</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
