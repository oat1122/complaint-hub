"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SettingsFormProps {
  initialSettings?: {
    itemsPerPage: number;
    autoArchiveDays: number;
    enableAutoArchive: boolean;
  };
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState({
    itemsPerPage: initialSettings?.itemsPerPage || 10,
    autoArchiveDays: initialSettings?.autoArchiveDays || 90,
    enableAutoArchive: initialSettings?.enableAutoArchive || false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
      
      setMessage({ text: "Settings saved successfully", type: "success" });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setMessage({ text: `Error: ${error.message || "Failed to save settings"}`, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveOld = async () => {
    try {
      setIsArchiving(true);
      setMessage(null);
      
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archiveOld" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to archive old complaints");
      }
      
      const data = await response.json();
      setMessage({ text: data.message || "Complaints archived successfully", type: "success" });
    } catch (error: any) {
      console.error("Error archiving complaints:", error);
      setMessage({ text: `Error: ${error.message || "Failed to archive complaints"}`, type: "error" });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setMessage(null);
      
      // Redirect to export endpoint
      window.open("/api/complaints/export", "_blank");
      
      setMessage({ text: "Export started", type: "success" });
    } catch (error: any) {
      console.error("Error exporting data:", error);
      setMessage({ text: `Error: ${error.message || "Failed to export data"}`, type: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteArchived = async () => {
    if (!window.confirm("Are you sure you want to delete all archived complaints? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      setMessage(null);
      
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteArchived" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete archived complaints");
      }
      
      const data = await response.json();
      setMessage({ text: data.message || "Archived complaints deleted successfully", type: "success" });
    } catch (error: any) {
      console.error("Error deleting archived complaints:", error);
      setMessage({ text: `Error: ${error.message || "Failed to delete archived complaints"}`, type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div 
          className={`p-4 rounded-md ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

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
                  Archive complaints older than {settings.autoArchiveDays} days
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={handleArchiveOld}
                disabled={isArchiving}
              >
                {isArchiving ? "Archiving..." : "Archive Old"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
              <div>
                <p className="font-medium">Export All Complaints</p>
                <p className="text-sm text-gray-500">
                  Download all complaint data as CSV
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>
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
              <Button 
                variant="destructive"
                onClick={handleDeleteArchived}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Archived"}
              </Button>
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
              <select 
                className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md"
                value={settings.itemsPerPage}
                onChange={(e) => setSettings({...settings, itemsPerPage: parseInt(e.target.value)})}
              >
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
                checked={settings.enableAutoArchive}
                onChange={(e) => setSettings({...settings, enableAutoArchive: e.target.checked})}
              />
              <label
                htmlFor="autoArchive"
                className="ml-2 block text-sm text-gray-700"
              >
                Auto-archive complaints after 
                <input 
                  type="number" 
                  className="mx-2 w-16 inline-block px-2 py-1 border border-gray-300 rounded-md"
                  value={settings.autoArchiveDays}
                  onChange={(e) => setSettings({...settings, autoArchiveDays: parseInt(e.target.value)})}
                  min="1"
                  max="365"
                /> 
                days
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
