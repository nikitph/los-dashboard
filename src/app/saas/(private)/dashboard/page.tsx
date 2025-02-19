"use client";

import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

const statisticsData = [
  { years: "Less than 5", male: 2, female: 2.2 },
  { years: "5 to 15", male: 3, female: 2.8 },
  { years: "More than 15", male: 4, female: 3.8 },
];

interface Task {
  id: number;
  applicant: string;
  type: string;
  documents: string[];
  requestDate: string;
  status: string;
  disbursementStatus?: string;
}

const tasks: Task[] = [
  {
    id: 1,
    applicant: "Amul Rangnekar",
    type: "Personal Loan Application",
    documents: ["Aadhar", "PAN", "Bank Statement", "Financial Deposits", "Property", "Valuation"],
    requestDate: "31/7/2024",
    status: "Sanction Granted",
    disbursementStatus: "Disbursement pending",
  },
  {
    id: 2,
    applicant: "John Boe",
    type: "Personal Loan Application",
    documents: ["Aadhar", "PAN", "Bank Statement", "Financial Deposits", "Property", "Valuation"],
    requestDate: "16/7/2024",
    status: "Sanction Granted",
    disbursementStatus: "Disbursement pending",
  },
];

const recentActivity = [
  { action: "Completed Sanction form for Ramesh Joshi", time: "5 min ago" },
  { action: "Completed Sanction form for Awanish Tiwari", time: "2 hours ago" },
  { action: "Started Application for John Doe", time: "1 day ago" },
];

const applications = Array(6)
  .fill(null)
  .map((_, i) => ({
    id: i + 1,
    name: "John Doe",
  }));

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="mx-auto max-w-[1400px] space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">My Tasks</h1>
          <Button variant="link" className="text-[#6366F1] hover:text-[#4F46E5]">
            See All
          </Button>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {tasks.map((task) => (
            <Card key={task.id} className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-sm">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-[#2A3558]/95 to-[#2A3558]/90 text-white">
                <CardTitle className="space-y-1">
                  <h3 className="text-xl font-medium">{task.applicant}</h3>
                  <p className="text-sm font-normal opacity-90">{task.type}</p>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-3 divide-x text-sm">
                  <div className="space-y-2 p-4">
                    <h4 className="font-medium text-gray-700">Documents</h4>
                    <ul className="space-y-1 text-gray-600">
                      {task.documents.map((doc) => (
                        <li key={doc}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2 p-4">
                    <h4 className="font-medium text-gray-700">Date of Request</h4>
                    <p className="text-gray-600">{task.requestDate}</p>
                  </div>
                  <div className="space-y-2 p-4">
                    <h4 className="font-medium text-gray-700">Current Status</h4>
                    <p className="text-gray-600">{task.status}</p>
                    {task.disbursementStatus && <p className="text-xs text-red-500">{task.disbursementStatus}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Task Card */}
          <Card className="group cursor-pointer border-2 border-dashed border-gray-200 bg-transparent transition-colors hover:bg-gray-50/50">
            <CardContent className="flex h-full items-center justify-center p-6">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#2A3558]/90 to-[#2A3558]/80 transition-all group-hover:from-[#2A3558] group-hover:to-[#2A3558]">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Add New Task</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Applications */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-sm">
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-gradient-to-r from-[#2A3558]/90 to-[#2A3558]/80" />
                      <span className="text-sm text-gray-700">{app.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-sm text-gray-700">{activity.action}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-sm">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statisticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="years" />
                  <YAxis />
                  <Bar dataKey="male" fill="#2A3558" />
                  <Bar dataKey="female" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
