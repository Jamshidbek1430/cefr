"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Calendar, Clock, User, Users, Activity } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const DAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export default function SchedulesPage() {
    const { data: session } = useSession();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [teacherId, setTeacherId] = useState("");
    const [groupId, setGroupId] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState("1"); // Monday
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:30");

    useEffect(() => {
        fetchData();
    }, [session]);

    const fetchData = async () => {
        const accessToken = (session as any)?.accessToken;
        if (!accessToken) return;

        setLoading(true);
        try {
            const [schedData, teacherData, groupData] = await Promise.all([
                apiFetch("/api/schedules/", { accessToken }),
                apiFetch("/api/users/?role=TEACHER", { accessToken }),
                apiFetch("/api/groups/", { accessToken })
            ]);

            setSchedules(schedData);
            setTeachers(teacherData);
            setGroups(groupData);
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacherId || !groupId) {
            toast.error("Please select a teacher and a group.");
            return;
        }

        const accessToken = (session as any)?.accessToken;
        setSubmitting(true);

        // Convert time strings to full Date objects for Prisma
        const today = new Date();
        const start = new Date(today.setHours(parseInt(startTime.split(":")[0]), parseInt(startTime.split(":")[1]), 0, 0));
        const end = new Date(today.setHours(parseInt(endTime.split(":")[0]), parseInt(endTime.split(":")[1]), 0, 0));

        try {
            await apiFetch("/api/schedules/", {
                method: "POST",
                accessToken,
                body: JSON.stringify({
                    teacherId,
                    groupId,
                    dayOfWeek,
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                }),
            });

            toast.success("Schedule added successfully!");
            fetchData();
            setTeacherId("");
            setGroupId("");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to add schedule.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;
        const accessToken = (session as any)?.accessToken;

        try {
            await apiFetch(`/api/schedules/${id}/`, {
                method: "DELETE",
                accessToken
            });
            toast.success("Schedule deleted.");
            setSchedules(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Schedule Management</h1>
                    <p className="text-muted-foreground font-medium">Define and oversee teacher work schedules with precision.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                    <Activity className="h-3 w-3" />
                    Live System
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-2 h-fit border border-white/5 bg-gradient-to-br from-card/90 to-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />
                    <CardHeader className="relative z-10 pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-primary/10 border border-primary/10 shadow-inner">
                                <Plus className="h-5 w-5 text-primary" />
                            </div>
                            Add New Schedule
                        </CardTitle>
                        <CardDescription>Assign a teacher to a group and time slot.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <form onSubmit={handleAdd} className="space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                                    <User className="h-3 w-3" /> Teacher
                                </label>
                                <Select value={teacherId} onValueChange={setTeacherId}>
                                    <SelectTrigger className="bg-background/50 border-white/5 h-11 transition-all focus:ring-primary/20">
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                                    <Users className="h-3 w-3" /> Group
                                </label>
                                <Select value={groupId} onValueChange={setGroupId}>
                                    <SelectTrigger className="bg-background/50 border-white/5 h-11 transition-all focus:ring-primary/20">
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map(g => (
                                            <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Day
                                    </label>
                                    <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                                        <SelectTrigger className="bg-background/50 border-white/5 h-11 transition-all focus:ring-primary/20">
                                            <SelectValue placeholder="Select day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAYS.map((day, idx) => (
                                                <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> Time Slot
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-background/50 border-white/5 h-11 text-center font-bold" />
                                        <span className="text-muted-foreground opacity-30 font-black">/</span>
                                        <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-background/50 border-white/5 h-11 text-center font-bold" />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl text-sm font-black uppercase tracking-widest bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all duration-300">
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <> <Plus className="h-5 w-5 mr-2" /> Create Schedule </>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border border-white/5 bg-gradient-to-br from-card/90 to-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
                    <CardHeader className="relative z-10 border-b border-white/5 pb-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/10 shadow-inner">
                                <Calendar className="h-5 w-5 text-blue-500" />
                            </div>
                            Current Schedules
                        </CardTitle>
                        <CardDescription>Overview of all assigned teaching slots across branches.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 p-0">
                        {loading ? (
                            <div className="flex justify-center p-20">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-4 border-primary/20" />
                                    <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0" />
                                </div>
                            </div>
                        ) : schedules.length === 0 ? (
                            <div className="text-center py-24 text-muted-foreground/60 italic font-medium px-8">
                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                No active schedules found.
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {schedules.map((s) => (
                                    <div key={s.id} className="group items-center flex justify-between p-6 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-start gap-5">
                                            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-muted/30 border border-white/5 min-w-[3.5rem] group-hover:border-primary/20 transition-colors">
                                                <span className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground leading-none mb-1">{DAYS[s.dayOfWeek].substring(0, 3)}</span>
                                                <span className="text-xl font-black leading-none">{s.dayOfWeek}</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <h3 className="font-black text-lg tracking-tight flex items-center gap-3">
                                                    {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    <span className="text-muted-foreground/30 font-normal">→</span>
                                                    {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 items-center">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/10 shadow-sm transition-all group-hover:bg-primary/20">
                                                        <User className="h-3 w-3" />
                                                        {s.teacher?.name}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/10 shadow-sm transition-all group-hover:bg-blue-500/20">
                                                        <Users className="h-3 w-3" />
                                                        {s.group?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                            onClick={() => handleDelete(s.id)}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
