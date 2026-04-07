"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock, BookOpen, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleListProps {
    schedule: any[];
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ScheduleList({ schedule }: ScheduleListProps) {
    if (!schedule || schedule.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        My Work Schedule
                    </CardTitle>
                    <CardDescription>No classes scheduled yet.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="shadow-md border-primary/10 overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    My Work Schedule
                </CardTitle>
                <CardDescription>Your weekly teaching plan</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                    {schedule.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group">
                            <div className="flex flex-col items-center justify-center min-w-16 h-16 rounded-lg bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <span className="text-[10px] uppercase font-bold tracking-wider leading-none opacity-70 group-hover:opacity-100">
                                    {days[item.dayOfWeek].substring(0, 3)}
                                </span>
                                <span className="text-lg font-bold">
                                    {new Date(item.startTime).getDate()}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <h4 className="font-semibold text-sm truncate flex items-center gap-2">
                                    <BookOpen className="h-3 w-3 text-primary" />
                                    {item.group?.name || "Private Session"}
                                </h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        Main Hall
                                    </div>
                                </div>
                            </div>

                            <div className="hidden sm:flex flex-col items-end gap-1">
                                <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    Confirmed
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
