"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const reports = [
    { title: "Monthly Financial Statement", date: "Mar 01, 2026", type: "financial", status: "Ready", icon: TrendingUp, color: "text-green-500" },
    { title: "Branch Performance Review", date: "Feb 28, 2026", type: "performance", status: "Action Required", icon: AlertCircle, color: "text-orange-500" },
    { title: "Attendance Variance Report", date: "Mar 03, 2026", type: "attendance", status: "Completed", icon: CheckCircle2, color: "text-blue-500" },
    { title: "Teacher Utilization Audit", date: "Mar 02, 2026", type: "audit", status: "Processing", icon: Clock, color: "text-purple-500" },
    { title: "Q1 Strategic Growth Plan", date: "Jan 15, 2026", type: "strategy", status: "Archived", icon: FileText, color: "text-muted-foreground" },
];

export function ReportsSection() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold">Generated Reports</CardTitle>
                <CardDescription>System summaries and financial audits</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-border">
                        {reports.map((report, i) => {
                            const Icon = report.icon;
                            return (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg bg-muted group-hover:bg-background transition-colors ${report.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{report.title}</p>
                                            <p className="text-xs text-muted-foreground">{report.date} • {report.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full bg-muted shadow-sm border`}>
                                            {report.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-muted/20">
                    <button className="w-full text-xs font-bold text-primary hover:underline uppercase tracking-widest">
                        Configure Automated Reports
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
