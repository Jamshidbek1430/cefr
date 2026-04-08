"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export function AssignHomeworkDialog() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        groupId: "",
    });

    useEffect(() => {
        if (open) {
            const fetchGroups = async () => {
                const accessToken = (session as any)?.accessToken;
                if (!accessToken) return;
                try {
                    const data = await apiFetch("/api/groups", { accessToken });
                    setGroups(data);
                } catch (error) {
                    console.error("Failed to fetch groups:", error);
                }
            };
            fetchGroups();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.dueDate || !formData.groupId) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        const accessToken = (session as any)?.accessToken;
        try {
            await apiFetch("/api/homework", {
                method: "POST",
                accessToken,
                body: JSON.stringify(formData),
            });

            toast.success("Homework assigned successfully!");
            setOpen(false);
            setFormData({ title: "", description: "", dueDate: "", groupId: "" });
            router.refresh();
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Assign Homework
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Assign New Homework</DialogTitle>
                        <DialogDescription>
                            Assign a new task to an entire group of students.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="col-span-3"
                                placeholder="Chapter 1 Review"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desc" className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                Desc
                            </Label>
                            <Textarea
                                id="desc"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3 h-20"
                                placeholder="Optional instructions..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                Due
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="group" className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                Group
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.groupId}
                                    onValueChange={(val) => setFormData({ ...formData, groupId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select target group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem key={group.id} value={group.id.toString()}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Assignment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
