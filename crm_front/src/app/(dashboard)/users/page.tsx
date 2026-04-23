"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserCard } from "@/components/users/UserCard";
import { Loader2 } from "lucide-react";

type RoleName = "ADMIN" | "TEACHER" | "STUDENT";
interface User {
  id: string;
  name: string;
  email: string;
  role: RoleName;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      const mappedUsers: User[] = data.map((user: any) => ({
        id: user.id,
        name: user.name || "Unknown User",
        email: user.email || "-",
        role: user.role as RoleName,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            currentUserId={session?.user?.id || ""}
            onDeleteSuccess={handleDeleteSuccess}
          />
        ))}
      </div>
      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
}
