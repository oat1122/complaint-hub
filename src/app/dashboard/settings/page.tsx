import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/dashboard/settings-form";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Settings - Complaint Hub",
  description: "Admin settings for Complaint Hub",
};

async function getSettings() {
  try {
    // Fetch settings directly from database for server component
    const settings = await prisma.settings.findUnique({
      where: { id: "singleton" },
    });

    if (settings) {
      return {
        itemsPerPage: settings.itemsPerPage,
        autoArchiveDays: settings.autoArchiveDays,
        enableAutoArchive: settings.enableAutoArchive,
      };
    }
  } catch (error) {
    console.error("Failed to fetch settings:", error);
  }

  // Return default settings if fetch fails
  return {
    itemsPerPage: 10,
    autoArchiveDays: 90,
    enableAutoArchive: false,
  };
}

export default async function SettingsPage() {
  // Get authenticated session
  const session = await getServerSession(authOptions);

  // This page is admin-only
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch current settings
  const currentSettings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Badge className="bg-blue-600 hover:bg-blue-700">Admin Only</Badge>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">System Settings</h2>
        <SettingsForm initialSettings={currentSettings} />
      </div>
    </div>
  );
}
