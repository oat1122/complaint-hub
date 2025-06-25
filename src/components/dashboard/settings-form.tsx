"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertTriangle } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // UI state management
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "warning" } | null>(null);
  
  // Form validation
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: "archive" | "delete" | null;
    confirmText: string;
    destructive: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: null,
    confirmText: "Confirm",
    destructive: false,
  });

  // Update settings when initialSettings change
  useEffect(() => {
    if (initialSettings) {
      setSettings({
        itemsPerPage: initialSettings.itemsPerPage,
        autoArchiveDays: initialSettings.autoArchiveDays,
        enableAutoArchive: initialSettings.enableAutoArchive,
      });
    }
  }, [initialSettings]);

  // Validate settings before submitting
  const validateSettings = () => {
    const errors: { [key: string]: string } = {};
    
    if (settings.itemsPerPage < 5 || settings.itemsPerPage > 100) {
      errors.itemsPerPage = "Items per page must be between 5 and 100";
    }
    
    if (settings.autoArchiveDays < 1 || settings.autoArchiveDays > 365) {
      errors.autoArchiveDays = "Auto-archive days must be between 1 and 365";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveSettings = async () => {
    if (!validateSettings()) {
      setMessage({ text: "Please correct the form errors", type: "error" });
      return;
    }
    
    try {
      setIsSaving(true);
      setMessage(null);
      
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }
      
      setMessage({ text: "Settings saved successfully. The changes will apply on your next page reload.", type: "success" });
      clearMessage();
      
      // If the items per page was changed, we need to reload the dashboard pages to apply the new setting
      if (initialSettings && initialSettings.itemsPerPage !== settings.itemsPerPage) {
        setTimeout(() => {
          // Soft reload to apply the new settings
          window.location.href = '/dashboard/complaints';
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setMessage({ text: `Error: ${error.message || "Failed to save settings"}`, type: "error" });
      clearMessage();
    } finally {
      setIsSaving(false);
    }
  };

  const openConfirmationDialog = (action: "archive" | "delete") => {
    if (action === "archive") {
      setConfirmDialog({
        isOpen: true,
        title: "Archive Old Complaints",
        description: `Are you sure you want to archive all complaints older than ${settings.autoArchiveDays} days? This action will change their status to "archived".`,
        action: "archive",
        confirmText: "Archive Complaints",
        destructive: false,
      });
    } else if (action === "delete") {
      setConfirmDialog({
        isOpen: true,
        title: "Delete Archived Complaints",
        description: "Are you sure you want to permanently delete ALL archived complaints? This action cannot be undone and all data will be lost.",
        action: "delete",
        confirmText: "Delete Permanently",
        destructive: true,
      });
    }
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.action === "archive") {
      await handleArchiveOld();
    } else if (confirmDialog.action === "delete") {
      await handleDeleteArchived();
    }
    
    setConfirmDialog({ ...confirmDialog, isOpen: false });
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to archive old complaints");
      }
      
      const data = await response.json();
      setMessage({ 
        text: data.message || `${data.count || 0} complaints archived successfully`, 
        type: "success" 
      });
      clearMessage();
    } catch (error: any) {
      console.error("Error archiving complaints:", error);
      setMessage({ text: `Error: ${error.message || "Failed to archive complaints"}`, type: "error" });
      clearMessage();
    } finally {
      setIsArchiving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setMessage(null);
      
      // Try to open export URL in new tab
      const exportUrl = "/api/complaints/export";
      window.open(exportUrl, "_blank");
      
      setMessage({ text: "Export initiated - check your downloads", type: "success" });
      clearMessage();
    } catch (error: any) {
      console.error("Error exporting data:", error);
      setMessage({ text: `Error: ${error.message || "Failed to export data"}`, type: "error" });
      clearMessage();
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteArchived = async () => {
    try {
      setIsDeleting(true);
      setMessage(null);
      
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteArchived" }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete archived complaints");
      }
      
      const data = await response.json();
      setMessage({ 
        text: data.message || `${data.count || 0} archived complaints deleted successfully`, 
        type: "success" 
      });
      clearMessage();
    } catch (error: any) {
      console.error("Error deleting archived complaints:", error);
      setMessage({ text: `Error: ${error.message || "Failed to delete archived complaints"}`, type: "error" });
      clearMessage();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div 
          className={`p-4 rounded-md flex items-center gap-3 ${
            message.type === "success" ? "bg-green-50 text-green-800" : 
            message.type === "warning" ? "bg-yellow-50 text-yellow-800" : 
            "bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* System Preferences */}
        <div>
          <h3 className="text-lg font-medium mb-2">System Preferences</h3>
          <p className="text-gray-600 mb-4">
            Configure system behavior and defaults
          </p>

          <div className="space-y-4 bg-white p-4 rounded-md border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Items Per Page
              </label>
              <p className="text-xs text-blue-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                จำนวนรายการต่อหน้าเริ่มต้นสำหรับหน้ารายการคำร้องเรียน
              </p>
              <select 
                className={`w-full sm:w-64 px-3 py-2 border rounded-md ${
                  formErrors.itemsPerPage ? "border-red-500" : "border-gray-300"
                }`}
                value={settings.itemsPerPage}
                onChange={(e) => {                      const value = parseInt(e.target.value);
                      setSettings({...settings, itemsPerPage: value});
                      
                      // Remove the error if it exists
                      if (formErrors.itemsPerPage) {
                        const updatedErrors = {...formErrors};
                        delete updatedErrors.itemsPerPage;
                        setFormErrors(updatedErrors);
                      }
                }}
              >
                <option value="5">5 items</option>
                <option value="10">10 items</option>
                <option value="25">25 items</option>
                <option value="50">50 items</option>
                <option value="100">100 items</option>
              </select>
              {formErrors.itemsPerPage && (
                <p className="text-sm text-red-500 mt-1">{formErrors.itemsPerPage}</p>
              )}
            </div>

            <div>
              <div className="flex items-center">
                <input
                  id="autoArchive"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={settings.enableAutoArchive}
                  onChange={(e) => setSettings({...settings, enableAutoArchive: e.target.checked})}
                />
                <label
                  htmlFor="autoArchive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Auto-archive complaints after 
                </label>
              </div>
              
              <div className="mt-2 ml-6">
                <div className="flex items-center">
                  <input 
                    type="number" 
                    className={`w-20 px-2 py-1 border rounded-md ${
                      formErrors.autoArchiveDays ? "border-red-500" : "border-gray-300"
                    }`}
                    value={settings.autoArchiveDays}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setSettings({...settings, autoArchiveDays: isNaN(value) ? 0 : value});
                      const updatedErrors = {...formErrors};
                      delete updatedErrors.autoArchiveDays;
                      setFormErrors(updatedErrors);
                    }}
                    min="1"
                    max="365"
                    disabled={!settings.enableAutoArchive}
                  /> 
                  <span className="ml-2 text-sm text-gray-700">days</span>
                </div>
                {formErrors.autoArchiveDays && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.autoArchiveDays}</p>
                )}
                {settings.enableAutoArchive && settings.autoArchiveDays < 30 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    <AlertTriangle size={14} className="inline mr-1" />
                    Short archive periods may archive complaints too quickly
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Data Management */}
        <div>
          <h3 className="text-lg font-medium mb-2">Data Management</h3>
          <p className="text-gray-600 mb-4">
            Manage your complaint data. Some actions cannot be undone.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-white">
              <div>
                <p className="font-medium">Archive Old Complaints</p>
                <p className="text-sm text-gray-500">
                  Archive complaints older than {settings.autoArchiveDays} days
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => openConfirmationDialog("archive")}
                disabled={isArchiving}
                className="min-w-[120px]"
              >
                {isArchiving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Archiving
                  </>
                ) : "Archive Old"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-white">
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
                className="min-w-[120px]"
              >
                {isExporting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Exporting
                  </>
                ) : "Export Data"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-md bg-red-50">
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
                onClick={() => openConfirmationDialog("delete")}
                disabled={isDeleting}
                className="min-w-[120px] font-medium text-base"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Deleting
                  </>
                ) : "Delete Archived"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving} 
          className="min-w-[120px] font-medium text-base"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving
            </>
          ) : "Save Settings"}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(isOpen: boolean) => setConfirmDialog({...confirmDialog, isOpen})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})}
              className="font-medium"
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.destructive ? "destructive" : "default"}
              onClick={handleConfirmAction}
              className="font-medium"
            >
              {confirmDialog.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
