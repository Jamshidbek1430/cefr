"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ClipboardList, CheckCircle2, Loader2, Landmark, User, Heart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function StudentSurveyPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [period, setPeriod] = useState("");

    const [teacherRating, setTeacherRating] = useState(0);
    const [centerRating, setCenterRating] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/students/survey`);
                if (res.ok) {
                    const data = await res.json();
                    setCanSubmit(data.canSubmit);
                    setPeriod(data.period);
                }
            } catch (error) {
                console.error("Failed to check survey status");
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);

    const handleSubmit = async () => {
        if (teacherRating === 0 || centerRating === 0) {
            toast.error("Please provide ratings for both your teacher and the center.");
            return;
        }

        setSubmitting(true);
        try {
            // Submit ratings
            const res = await fetch(`/api/students/survey`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stars: centerRating,
                    comment: comment,
                    period: period
                })
            });

            // Also submit teacher rating to existing Rating model
            await fetch(`/api/ratings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stars: teacherRating,
                    comment: `[Monthly Survey Feedback]: ${comment}`,
                    period: period
                })
            });

            if (res.ok) {
                setSubmitted(true);
                toast.success("Thank you for your anonymous feedback!");
            }
        } catch (error) {
            toast.error("Failed to submit survey.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    if (submitted || !canSubmit) {
        return (
            <div className="max-w-xl mx-auto py-12 text-center animate-in zoom-in-95 duration-700">
                <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-2">Feedback Received!</h2>
                <p className="text-muted-foreground font-medium mb-8">
                    Your contribution helps us maintain high standards for the entire community.
                    {canSubmit === false && ` You have already completed the survey for ${period}.`}
                </p>
                <Button variant="outline" className="rounded-2xl font-black" asChild>
                    <a href="/dashboard">Back to Dashboard</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            <div>
                <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Sorovnoma</h1>
                <p className="text-muted-foreground font-medium mt-1">Your voice matters. All submissions are strictly anonymous.</p>
            </div>

            <div className="grid gap-10">
                <Card className="border-none bg-card/60 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight">Teacher Performance</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60">Rate your current mentor</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <p className="text-sm font-medium text-muted-foreground">How would you rate your teacher's clarity, support, and professionalism this period?</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setTeacherRating(star)}
                                    className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ring-2 ring-transparent",
                                        teacherRating >= star ? "bg-yellow-500/20 text-yellow-600 ring-yellow-500/30" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    <Star className={cn("h-7 w-7", teacherRating >= star ? "fill-yellow-600" : "fill-none")} />
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/60 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Landmark className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight">Academic Center</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60">Overall organizational experience</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <p className="text-sm font-medium text-muted-foreground">Rate the facility, administrative support, and overall learning environment.</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setCenterRating(star)}
                                    className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ring-2 ring-transparent",
                                        centerRating >= star ? "bg-primary/10 text-primary ring-primary/30" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    <Star className={cn("h-7 w-7", centerRating >= star ? "fill-primary" : "fill-none")} />
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/60 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight">Open Feedback</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60">Suggestions or concerns</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <Textarea
                            placeholder="Share your thoughts anonymously..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="bg-muted/40 border-white/5 rounded-2xl p-6 min-h-[150px] font-medium focus-visible:ring-primary/20 transition-all text-base"
                        />
                        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <Heart className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                Your safety and anonymity are our priority. We use aggregated results to improve our educational quality.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || teacherRating === 0 || centerRating === 0}
                            className="w-full h-16 rounded-2xl font-black text-lg gap-2 shadow-2xl shadow-primary/20 group"
                        >
                            {submitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Submit Anonymous Response
                                    <CheckCircle2 className="h-5 w-5 group-hover:scale-125 transition-transform" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
