"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, BookOpen, Calendar, MessageSquare, ClipboardCheck, ArrowUpRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

export default function TeacherGroupsPage() {
    const { data: session } = useSession();
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            const accessToken = (session as any)?.accessToken;
            if (!accessToken) return;
            try {
                const data = await apiFetch("/api/groups", { accessToken });
                setGroups(data);
            } catch (error) {
                console.error("Failed to fetch groups:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, [session]);

    const getDayName = (day: number) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[day];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">My Groups</h1>
                <p className="text-muted-foreground font-medium mt-1">Manage your classes and track student progress.</p>
            </div>

            {groups.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 bg-muted/20">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <CardTitle className="text-xl font-bold">No groups assigned</CardTitle>
                    <CardDescription>Wait for an administrator to assign you to a class group.</CardDescription>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <Card key={group.id} className="group overflow-hidden border-none bg-card/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 hover:ring-primary/50 transition-all duration-500">
                            <CardHeader className="relative pb-4">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="rounded-full px-3 py-0.5 border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                                        {group.course?.name || "General"}
                                    </Badge>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span className="text-xs font-bold">{group._count?.students || 0} Students</span>
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{group.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1.5 font-medium text-xs mt-1">
                                    <GraduationCap className="h-3.3 w-3.3" />
                                    {group.branch?.name || "Main Campus"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="space-y-4">
                                    <div className="bg-muted/30 rounded-2xl p-4 border border-white/5 space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                            <Calendar className="h-3 w-3 text-primary" />
                                            Weekly Schedule
                                        </div>
                                        {group.schedules?.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {group.schedules.slice(0, 4).map((s: any) => (
                                                    <div key={s.id} className="text-xs font-bold flex flex-col">
                                                        <span className="text-primary">{getDayName(s.dayOfWeek)}</span>
                                                        <span className="opacity-60">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs font-bold opacity-40 italic">TBD</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full w-[65%]" />
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest opacity-60">65% Progress</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2 pb-6">
                                <Link href="/attendance" className="w-full">
                                    <Button variant="outline" className="w-full h-10 rounded-xl border-white/10 hover:bg-primary hover:text-white font-bold text-xs gap-2">
                                        <ClipboardCheck className="h-4 w-4" />
                                        Attendance
                                    </Button>
                                </Link>
                                <Link href="/chat" className="w-full">
                                    <Button className="w-full h-10 rounded-xl font-bold text-xs gap-2 shadow-lg shadow-primary/20">
                                        <MessageSquare className="h-4 w-4" />
                                        Open Chat
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
