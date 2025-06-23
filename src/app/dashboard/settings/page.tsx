import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/dashboard/settings-form";

export const metadata: Metadata = {
  title: "Settings - Complaint Hub",
  description: "Admin settings for Complaint Hub",
};

export default async function SettingsPage() {
  // Get authenticated session
  const session = await getServerSession(authOptions);

  // This page is admin-only
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Define default settings
  const defaultSettings = {
    itemsPerPage: 10,
    autoArchiveDays: 90,
    enableAutoArchive: false,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">System Settings</h2>
        <SettingsForm initialSettings={defaultSettings} />
      </div>
    </div>
  );
}
