"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { UserCog, Loader2, Shield, User, GraduationCap } from "lucide-react";
import { toast } from "sonner";

type RoleName = "ADMIN" | "TEACHER" | "STUDENT";

interface RoleManagerProps {
    userId: string;
    currentRole: RoleName;
}

export function RoleManager({ userId, currentRole }: RoleManagerProps) {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const updateRole = async (newRole: RoleName) => {
        if (newRole === currentRole) return;

        const accessToken = (session as any)?.accessToken;
        try {
            await apiFetch(`/api/users/${userId}/role`, {
                method: "PATCH",
                accessToken,
                body: JSON.stringify({ roleName: newRole }),
            });

            toast.success(`User promoted to ${newRole.replace('_', ' ')}`);
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to update role");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCog className="h-4 w-4" />}
                    Manage Role
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Assign New Role</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => updateRole("ADMIN")}
                    className="flex justify-between items-center"
                    disabled={currentRole === "ADMIN"}
                >
                    <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" /> Admin
                    </span>
                    {currentRole === "ADMIN" && <span className="text-[10px] text-muted-foreground">(Current)</span>}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => updateRole("TEACHER")}
                    className="flex justify-between items-center"
                    disabled={currentRole === "TEACHER"}
                >
                    <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-500" /> Teacher
                    </span>
                    {currentRole === "TEACHER" && <span className="text-[10px] text-muted-foreground">(Current)</span>}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => updateRole("STUDENT")}
                    className="flex justify-between items-center"
                    disabled={currentRole === "STUDENT"}
                >
                    <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-500" /> Student
                    </span>
                    {currentRole === "STUDENT" && <span className="text-[10px] text-muted-foreground">(Current)</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
