"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityDay {
    date: string;
    level: number; // 0-3
}

export function TrainingActivityWidget() {
    // Mock data for the last 30 days
    const data = useMemo(() => {
        const days: ActivityDay[] = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            days.push({
                date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
                level: Math.floor(Math.random() * 4), // Level 0-3
            });
        }
        return days;
    }, []);

    const getDayBlocks = (level: number) => {
        // blockIndex 0 is bottom, 1 is middle, 2 is top
        const blocks = [];
        for (let i = 0; i < 3; i++) {
            let isFilled = level > i;
            let colorClass = "bg-muted/10 border border-border/20"; // Level 0 (empty)

            if (isFilled) {
                if (level === 1) {
                    colorClass = "bg-emerald-500/20 border border-emerald-500/30"; // Light green
                } else if (level === 2) {
                    colorClass = "bg-emerald-500/50 border border-emerald-500/60"; // Medium green
                } else if (level === 3) {
                    colorClass = "bg-emerald-500 border border-emerald-500";       // Strong green
                }
            }

            blocks.push(
                <div
                    key={i}
                    className={cn(
                        "w-5 h-5 rounded-sm transition-all duration-300",
                        colorClass
                    )}
                />
            );
        }
        return blocks.reverse(); // Standard GitHub-like stack where bottom is first level
    };

    return (
        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-lg">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-foreground/90">
                    Training Activeness (Last 30 Days)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex gap-2.5 min-w-max px-1">
                        {data.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className="flex flex-col gap-1">
                                    {getDayBlocks(day.level)}
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium select-none">
                                    {day.date}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(16, 185, 129, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(16, 185, 129, 0.2);
          }
        `}</style>
            </CardContent>
        </Card>
    );
}
