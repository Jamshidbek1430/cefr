"use client";

import { useState } from "react";
import { Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  userRole: string;
  currentUserId: string;
  onDeleteSuccess?: (userId: string) => void;
}

export function DeleteUserButton({ userId, userName, userRole, currentUserId, onDeleteSuccess }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const isDisabled = userRole === "ADMIN" || userId === currentUserId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete user");
      }

      toast.success(`User "${userName}" has been deleted successfully.`);
      setShowDialog(false);
      
      // Call the callback to update parent component immediately
      if (onDeleteSuccess) {
        onDeleteSuccess(userId);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDisabled) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed opacity-50"
        title={userId === currentUserId ? "Cannot delete yourself" : "Cannot delete admin users"}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDialog(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setShowDialog(false)}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Delete User</h2>
              </div>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{userName}</span>? 
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
