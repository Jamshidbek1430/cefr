"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, MapPin, BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

export default function TeacherSchedulePage() {
    const { data: session } = useSession();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            const accessToken = (session as any)?.accessToken;
            if (!accessToken) return;
            try {
                const data = await apiFetch("/api/teacher/schedule", { accessToken });
                setSchedules(data);
            } catch (error) {
                console.error("Failed to fetch schedule:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, [session]);

    const days = [
        { id: 1, name: "Monday" },
        { id: 2, name: "Tuesday" },
        { id: 3, name: "Wednesday" },
        { id: 4, name: "Thursday" },
        { id: 5, name: "Friday" },
        { id: 6, name: "Saturday" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Professional Agenda</h1>
                <p className="text-muted-foreground font-medium mt-1">Your weekly commitment and classroom allocation summary.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-7">
                <div className="lg:col-span-5 space-y-8">
                    {days.map((day) => {
                        const daySchedules = schedules.filter(s => s.dayOfWeek === day.id);
                        return (
                            <div key={day.id} className="relative pl-8 group">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10 group-hover:bg-primary/30 transition-colors" />
                                <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />

                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">{day.name}</h3>

                                <div className="space-y-4">
                                    {daySchedules.length === 0 ? (
                                        <div className="p-6 rounded-3xl bg-muted/20 border border-white/5 border-dashed">
                                            <p className="text-xs font-bold text-muted-foreground opacity-40 uppercase tracking-widest">No classes scheduled</p>
                                        </div>
                                    ) : (
                                        daySchedules.map((s) => (
                                            <Card key={s.id} className="border-none bg-card/60 backdrop-blur-xl shadow-xl ring-1 ring-white/10 overflow-hidden hover:ring-primary/40 transition-all group/card">
                                                <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                                                    <div className="flex items-center gap-4 md:w-48 shrink-0">
                                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                                            <Clock className="h-5 w-5" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-black tracking-tighter">
                                                                {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                                                until {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="h-10 w-px bg-white/5 hidden md:block" />

                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-primary/20 bg-primary/5 text-primary">
                                                                {s.group.course?.name || "Academic"}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="text-lg font-black tracking-tight">{s.group.name}</h4>
                                                        <div className="flex items-center gap-4 text-muted-foreground">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter">
                                                                <MapPin className="h-3 w-3" />
                                                                Room 302B
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter">
                                                                <Layers className="h-3 w-3" />
                                                                Module 4
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none bg-primary/90 text-primary-foreground p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                        <Calendar className="h-8 w-8 mb-4 opacity-50" />
                        <CardTitle className="text-2xl font-black tracking-tight mb-2 leading-tight">Sync Agenda</CardTitle>
                        <p className="text-sm font-medium opacity-80 leading-relaxed">
                            Your schedule is synchronized with the central administration server. Contact support for shift adjustments.
                        </p>
                    </Card>

                    <Card className="border-none bg-card/40 backdrop-blur-xl shadow-xl ring-1 ring-white/10 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-black tracking-tight">Schedule Notes</p>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Arrival 15 mins before class",
                                "Update materials weekly",
                                "Verify student attendance",
                                "Report classroom issues"
                            ].map((note, i) => (
                                <li key={i} className="flex items-start gap-2 text-[11px] font-medium text-muted-foreground">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
