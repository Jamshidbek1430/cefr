import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCog, User, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleManager } from "@/components/users/RoleManager";
import { AddUserModal } from "@/components/users/AddUserModal";

type RoleName = "ADMIN" | "TEACHER" | "STUDENT";
type BackendUser = {
    id: string;
    username?: string;
    full_name?: string;
    telegram_username?: string;
    email?: string;
    role?: string;
};
type BackendUsersResponse = BackendUser[] | { results?: BackendUser[] };
type SessionWithToken = {
    user?: { id?: string; role?: RoleName };
    accessToken?: string;
};

function mapBackendRole(role?: string): RoleName {
    if (role === "admin" || role === "branch_admin") return "ADMIN";
    if (role === "teacher") return "TEACHER";
    return "STUDENT";
}

export default async function UsersPage() {
    const session = await getServerSession(authOptions) as SessionWithToken | null;

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const accessToken = session.accessToken;
    const usersResponse = await apiFetch("/api/users/", { accessToken }) as BackendUsersResponse;
    const usersList = Array.isArray(usersResponse) ? usersResponse : usersResponse.results || [];

    const users = usersList.map((user) => ({
        id: user.id as string,
        name: user.full_name || user.username || "Unknown",
        email: user.email || (user.telegram_username ? `@${user.telegram_username}` : "-"),
        role: mapBackendRole(user.role),
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage system users, roles, and permissions.
                    </p>
                </div>
                <AddUserModal />
            </div>

            <div className="grid gap-4 mt-6">
                {users.map((user) => (
                    <Card key={user.id} className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 relative overflow-hidden group">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border shadow-sm">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-base font-semibold">{user.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <span className="text-xs">{user.email}</span>
                                    <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                                    <span className="flex items-center gap-1 text-xs font-medium text-primary uppercase">
                                        {user.role === "ADMIN" && <Shield className="w-3 h-3 text-primary/70" />}
                                        {user.role === "TEACHER" && <UserCog className="w-3 h-3" />}
                                        {user.role === "STUDENT" && <User className="w-3 h-3" />}
                                        {String(user.role).replace('_', ' ')}
                                    </span>
                                </CardDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                            <RoleManager userId={user.id} currentRole={user.role} />
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="destructive" size="sm" disabled={user.role === "ADMIN"}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
