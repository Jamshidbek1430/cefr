"use client";

import { Card } from "@/components/ui/card";
import { RoleManager } from "./RoleManager";
import { DeleteUserButton } from "./DeleteUserButton";

type RoleName = "ADMIN" | "TEACHER" | "STUDENT";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: RoleName;
  };
  currentUserId: string;
  onDeleteSuccess?: (userId: string) => void;
}

export function UserCard({ user, currentUserId, onDeleteSuccess }: UserCardProps) {
  return (
    <Card className="h-full flex flex-col p-6 hover:shadow-lg transition-all duration-200 group border border-gray-200">
      <div className="flex flex-col gap-4 h-full">
        {/* User Info Section */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          {/* User Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {user.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            user.role === "ADMIN" 
              ? "bg-red-100 text-red-800" 
              : user.role === "TEACHER"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}>
            {user.role}
          </span>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-2 pt-2 mt-auto border-t border-gray-100">
          <RoleManager userId={user.id} currentRole={user.role} />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DeleteUserButton
              userId={user.id}
              userName={user.name}
              userRole={user.role}
              currentUserId={currentUserId}
              onDeleteSuccess={onDeleteSuccess}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
