"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CreateGroupDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
    const router = useRouter();

    const [formData, setFormData] = useState<{
        name: string;
        teacherIds: number[];
    }>({
        name: "",
        teacherIds: [],
    });

    useEffect(() => {
        if (open) {
            const fetchTeachers = async () => {
                try {
                    const res = await fetch(`/api/users?role=TEACHER`);
                    if (res.ok) {
                        const data = await res.json();
                        setAvailableTeachers(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch teachers:", error);
                }
            };
            fetchTeachers();
        }
    }, [open]);

    const handleTeacherToggle = (teacherId: number) => {
        setFormData((prev) => {
            const isSelected = prev.teacherIds.includes(teacherId);
            if (isSelected) {
                return {
                    ...prev,
                    teacherIds: prev.teacherIds.filter((id) => id !== teacherId),
                };
            } else {
                return {
                    ...prev,
                    teacherIds: [...prev.teacherIds, teacherId],
                };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.teacherIds.length === 0) {
            toast.error("Please provide a name and select at least one teacher.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/groups`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Group created successfully!");
                setOpen(false);
                setFormData({ name: "", teacherIds: [] });
                router.refresh();
            } else {
                const errorData = await res.text();
                throw new Error(errorData || "Failed to create group");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Group
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Group</DialogTitle>
                        <DialogDescription>
                            Create a new study group and assign one or more teachers.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Group Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Advanced English A"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Assign Teachers</Label>
                            <Card className="p-0 overflow-hidden">
                                <ScrollArea className="h-[150px] p-4">
                                    <div className="space-y-3">
                                        {availableTeachers.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">Loading teachers...</p>
                                        ) : (
                                            availableTeachers.map((teacher) => (
                                                <div key={teacher.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`teacher-${teacher.id}`}
                                                        checked={formData.teacherIds.includes(teacher.id)}
                                                        onCheckedChange={() => handleTeacherToggle(teacher.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`teacher-${teacher.id}`}
                                                        className="text-sm font-normal cursor-pointer"
                                                    >
                                                        {teacher.name}
                                                    </Label>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </Card>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Group
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
