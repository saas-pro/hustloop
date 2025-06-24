"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, BarChart2, Users, Bell } from "lucide-react";
import type { View, DashboardTab } from "@/app/types";

interface DashboardTrayProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  setActiveView: (view: View) => void;
}

export default function DashboardTray({ activeTab, setActiveTab, setActiveView }: DashboardTrayProps) {
  const handleTabChange = (tab: string) => {
    setActiveView("dashboard");
    setActiveTab(tab as DashboardTab);
  };

  return (
    <div className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="activity">
              <BarChart2 className="mr-2 h-4 w-4" /> Activity Feed
            </TabsTrigger>
            <TabsTrigger value="mentors">
              <Users className="mr-2 h-4 w-4" /> My Mentors
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" /> Notifications
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
