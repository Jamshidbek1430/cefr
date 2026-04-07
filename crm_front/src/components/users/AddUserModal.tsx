"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
export function AddUserModal() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const data = {
            full_name: formData.get("full_name"),
            telegram_username: String(formData.get("telegram_username") || "").replace(/^@+/, ""),
            password: formData.get("password"),
            role: formData.get("role"),
        };

        const accessToken = (session as any)?.accessToken;
        try {
            await apiFetch("/api/users/", {
                method: "POST",
                accessToken,
                body: JSON.stringify(data),
            });

            setOpen(false);
            window.location.reload();
        } catch (err: any) {
            console.error("Create user error:", err);
            setError(err.message || "Failed to create user. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Create a new user with a specific role. Teachers and Admins can log in to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" name="full_name" placeholder="John Doe" required className="bg-gray-950 border-gray-800" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="telegram_username">Telegram Username</Label>
                            <Input id="telegram_username" name="telegram_username" placeholder="johndoe" required className="bg-gray-950 border-gray-800" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Temporary Password</Label>
                            <Input id="password" name="password" type="password" required className="bg-gray-950 border-gray-800" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" defaultValue="student">
                                <SelectTrigger className="bg-gray-950 border-gray-800">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
