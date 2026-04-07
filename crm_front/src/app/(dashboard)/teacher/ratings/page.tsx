"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, MessageSquare, TrendingUp, Users, Quote, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

export default function TeacherRatingsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRatings = async () => {
            const accessToken = (session as any)?.accessToken;
            if (!accessToken) return;
            try {
                const res = await apiFetch("/api/teacher/ratings", { accessToken });
                setData(res);
            } catch (error) {
                console.error("Failed to fetch ratings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRatings();
    }, [session]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    const ratingValue = parseFloat(data?.average || "0.0");

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Professional Influence</h1>
                <p className="text-muted-foreground font-medium mt-1">Real-time feedback loops from your student community.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="border-none bg-primary/90 text-primary-foreground shadow-2xl relative overflow-hidden group p-8 flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <Star className="h-12 w-12 mb-4 fill-white" />
                    <div className="text-7xl font-black tracking-tighter mb-2">{data?.average}</div>
                    <div className="flex gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("h-4 w-4", s <= Math.round(ratingValue) ? "fill-white" : "opacity-30")} />
                        ))}
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-80">Aggregate Score</p>
                    <p className="text-xs mt-2 opacity-60">Based on {data?.total} anonymous responses</p>
                </Card>

                <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
                    {[
                        { label: "Positive Sentiment", value: "94%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
                        { label: "Response Rate", value: "82%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Top Quality", value: "Clarity", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                        { label: "Survey Cycle", value: "Weekly", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
                    ].map((stat, i) => (
                        <Card key={i} className="border-none bg-card/40 backdrop-blur-xl shadow-xl p-6 relative overflow-hidden group">
                            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40", stat.bg)} />
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-black tracking-tight">Student Testimonials</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data?.ratings?.filter((r: any) => r.comment).map((rating: any) => (
                        <Card key={rating.id} className="border-none bg-card/60 backdrop-blur-2xl shadow-xl ring-1 ring-white/10 p-6 flex flex-col group hover:ring-primary/40 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={cn("h-3 w-3", s <= rating.stars ? "text-yellow-500 fill-yellow-500" : "text-muted opacity-30")} />
                                    ))}
                                </div>
                                <Quote className="h-4 w-4 text-primary/30" />
                            </div>
                            <p className="text-sm font-medium italic text-muted-foreground flex-1 leading-relaxed">
                                "{rating.comment}"
                            </p>
                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter opacity-50">Anonymous Student</Badge>
                                <span className="text-[9px] font-bold text-muted-foreground opacity-60">
                                    {new Date(rating.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </Card>
                    ))}
                    {(!data?.ratings || data.ratings.every((r: any) => !r.comment)) && (
                        <div className="col-span-full p-12 text-center opacity-40 border-2 border-dashed rounded-3xl">
                            <MessageSquare className="h-10 w-10 mx-auto mb-4" />
                            <p className="font-bold">No feedback comments archived yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
