"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, DollarSign, MapPin, Users, BookOpen } from "lucide-react";
import Link from "next/link";

interface Branch {
    id: number;
    name: string;
    location: string;
    revenue: number;
    avgRating: string;
    teacherCount: number;
    groupCount: number;
    studentCount: number;
}

export function BranchCards({ branches }: { branches: Branch[] }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {branches.map((branch) => (
                <Link key={branch.id} href={`/branches/${branch.id}`}>
                    <Card className="relative overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 cursor-pointer border border-white/5 bg-gradient-to-br from-card/90 to-card/40 backdrop-blur-xl group hover:-translate-y-2">
                        {/* Decorative Gradient Background */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
                        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />

                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 relative z-10">
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tighter group-hover:text-primary transition-colors duration-300">
                                    {branch.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1.5 mt-1.5 font-medium text-muted-foreground/80">
                                    <div className="p-1 rounded-md bg-muted/50">
                                        <MapPin className="h-3 w-3 text-primary" />
                                    </div>
                                    {branch.location}
                                </CardDescription>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 p-3 rounded-2xl border border-yellow-500/20 shadow-lg shadow-yellow-500/5 group-hover:scale-110 transition-transform duration-500">
                                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                            </div>
                        </CardHeader>

                        <CardContent className="relative z-10">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Teachers</p>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/10">
                                            <Users className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-lg font-black tracking-tight">{branch.teacherCount}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Groups</p>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/10">
                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <span className="text-lg font-black tracking-tight">{branch.groupCount}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">MTD Profit</p>
                                    <div className="flex items-center gap-1 text-green-500 font-black text-lg tracking-tighter">
                                        <DollarSign className="h-4 w-4" />
                                        {branch.revenue.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-3.5 w-3.5 ${star <= Math.round(parseFloat(branch.avgRating))
                                                    ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.3)]'
                                                    : 'text-muted/20'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-black text-foreground/80">{branch.avgRating} <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase ml-1">Rating</span></span>
                                </div>
                                <Badge variant="secondary" className="bg-muted/50 hover:bg-muted font-bold text-[11px] px-3 py-1 rounded-full border-none tracking-tight">
                                    {branch.studentCount} Active Students
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
