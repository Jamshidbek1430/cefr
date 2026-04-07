"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Loader2, Save, Users, CalendarDays, History, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

export default function AttendancePage() {
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [attendanceData, setAttendanceData] = useState<Record<number, { status: string, note: string }>>({});
    const [view, setView] = useState<"mark" | "history">("mark");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || status === "loading") {
        return null;
    }

    useEffect(() => {
        const fetchGroups = async () => {
            const accessToken = (session as any)?.accessToken;
            if (!accessToken) return;
            try {
                const data = await apiFetch("/api/groups", { accessToken });
                setGroups(data);
                if (data.length > 0) setSelectedGroup(data[0].id.toString());
            } catch (err) {
                console.error("Failed to fetch groups:", err);
            }
        };
        fetchGroups();
    }, [session]);

    useEffect(() => {
        if (!selectedGroup || view !== "mark") return;
        const accessToken = (session as any)?.accessToken;
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const data = await apiFetch(`/api/users/?group=${selectedGroup}`, { accessToken });
                const results = Array.isArray(data) ? data : data.results || [];
                // Map full_name to name
                const mapped = results.map((s: any) => ({
                    ...s,
                    name: s.full_name || s.username
                }));
                setStudents(mapped);
                const initial: any = {};
                mapped.forEach((s: any) => {
                    initial[s.id] = { status: "PRESENT", note: "" };
                });
                setAttendanceData(initial);
            } catch (error) {
                toast.error("Failed to fetch students.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedGroup, view, session]);

    const handleStatusChange = (studentId: number, status: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleNoteChange = (studentId: number, note: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], note }
        }));
    };

    const saveAttendance = async () => {
        setSaving(true);
        const accessToken = (session as any)?.accessToken;
        try {
            const promises = students.map(s =>
                apiFetch("/api/attendance", {
                    method: "POST",
                    accessToken,
                    body: JSON.stringify({
                        studentId: s.id,
                        groupId: parseInt(selectedGroup, 10),
                        status: attendanceData[s.id].status,
                        note: attendanceData[s.id].note,
                        date: new Date().toISOString()
                    })
                })
            );
            await Promise.all(promises);
            toast.success("Attendance saved successfully!");
        } catch (error) {
            toast.error("Failed to save attendance.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground">Track and manage student presence.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={view === "mark" ? "default" : "outline"}
                        onClick={() => setView("mark")}
                        className="gap-2"
                    >
                        <CalendarDays className="h-4 w-4" />
                        Mark Attendance
                    </Button>
                    <Button
                        variant={view === "history" ? "default" : "outline"}
                        onClick={() => setView("history")}
                        className="gap-2"
                    >
                        <History className="h-4 w-4" />
                        View History
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="space-y-1">
                        <CardTitle>Select Group</CardTitle>
                        <CardDescription>Choose a group to manage attendance.</CardDescription>
                    </div>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.map((g) => (
                                <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : view === "mark" ? (
                        <div className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Notes / Reason</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    {student.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant={attendanceData[student.id]?.status === "PRESENT" ? "default" : "outline"}
                                                        className={cn(
                                                            "h-8 px-2 gap-1",
                                                            attendanceData[student.id]?.status === "PRESENT" && "bg-green-600 hover:bg-green-700"
                                                        )}
                                                        onClick={() => handleStatusChange(student.id, "PRESENT")}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        Present
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={attendanceData[student.id]?.status === "ABSENT" ? "default" : "outline"}
                                                        className={cn(
                                                            "h-8 px-2 gap-1",
                                                            attendanceData[student.id]?.status === "ABSENT" && "bg-destructive hover:bg-destructive/90"
                                                        )}
                                                        onClick={() => handleStatusChange(student.id, "ABSENT")}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                        Absent
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={attendanceData[student.id]?.status === "LATE" ? "default" : "outline"}
                                                        className={cn(
                                                            "h-8 px-2 gap-1",
                                                            attendanceData[student.id]?.status === "LATE" && "bg-yellow-500 hover:bg-yellow-600 text-white"
                                                        )}
                                                        onClick={() => handleStatusChange(student.id, "LATE")}
                                                    >
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Late
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Reason for absence..."
                                                    className="h-8 text-xs"
                                                    value={attendanceData[student.id]?.note || ""}
                                                    onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex justify-end pt-4">
                                <Button onClick={saveAttendance} disabled={saving || students.length === 0} className="gap-2">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Attendance
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>History view coming soon. You can currently see recent logs in the Dashboard.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
