import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">System Settings</h2>

        <div className="space-y-8">
          {/* Data Management */}
          <div>
            <h3 className="text-lg font-medium mb-2">Data Management</h3>
            <p className="text-gray-600 mb-4">
              Manage your complaint data. These actions cannot be undone.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">Archive Old Complaints</p>
                  <p className="text-sm text-gray-500">
                    Archive complaints older than 90 days
                  </p>
                </div>
                <Button variant="outline">Archive Old</Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">Export All Complaints</p>
                  <p className="text-sm text-gray-500">
                    Download all complaint data as CSV
                  </p>
                </div>
                <Button variant="outline">Export Data</Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-red-50">
                <div>
                  <p className="font-medium text-red-700">
                    Delete All Archived Complaints
                  </p>
                  <p className="text-sm text-red-600">
                    Permanently delete all archived complaints
                  </p>
                </div>
                <Button variant="destructive">Delete Archived</Button>
              </div>
            </div>
          </div>

          {/* System Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-2">System Preferences</h3>
            <p className="text-gray-600 mb-4">
              Configure system behavior and defaults
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Items Per Page
                </label>
                <select className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md">
                  <option value="10">10 items</option>
                  <option value="25">25 items</option>
                  <option value="50">50 items</option>
                  <option value="100">100 items</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="autoArchive"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="autoArchive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Auto-archive complaints after 90 days
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
