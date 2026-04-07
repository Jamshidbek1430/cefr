"use client";

import { useState, useEffect } from "react";
import { PenTool, Loader2, Send, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function WritingPage() {
    const [text, setText] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);

    useEffect(() => {
        const checkAiStatus = async () => {
            try {
                const res = await fetch(`/api/ai/config`);
                const data = await res.json();
                setAiEnabled(data.enabled);
            } catch (e) {
                console.error("Failed to check AI status", e);
            }
        };
        checkAiStatus();
    }, []);

    const analyzeWriting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            toast.error("Please enter some text to analyze.");
            return;
        }

        setIsAnalyzing(true);
        setFeedback(null);
        try {
            const res = await fetch(`/api/ai/analyze-text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, type: "writing" }),
            });

            if (res.status === 503) {
                const message = await res.text();
                toast.error(message, { duration: 5000 });
                return;
            }

            if (!res.ok) throw new Error("Failed to analyze");

            const data = await res.json();
            setFeedback(data.feedback);
        } catch (error) {
            toast.error("Failed to get AI feedback. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Writing Check</h1>
                <p className="text-muted-foreground">
                    Submit your essays or paragraphs for instant grammar and style feedback.
                </p>
            </div>

            {!aiEnabled && (
                <Alert variant="destructive" className="bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>AI Features Disabled</AlertTitle>
                    <AlertDescription>
                        AI features are not available yet – please add your OpenAI API key in environment variables to enable them.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card className={cn("h-fit", !aiEnabled && "opacity-60 cursor-not-allowed")}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PenTool className="h-5 w-5" />
                            Your Text
                        </CardTitle>
                        <CardDescription>
                            Type or paste your writing here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={analyzeWriting} className="space-y-4">
                            <Textarea
                                placeholder="Once upon a time..."
                                className="min-h-[300px] resize-none"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={isAnalyzing || !aiEnabled}
                            />
                            <Button type="submit" className="w-full" disabled={isAnalyzing || !text.trim() || !aiEnabled}>
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Get Feedback
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-muted/30 border-dashed h-fit min-h-[450px]">
                    <CardHeader>
                        <CardTitle className="text-primary">AI Suggestions</CardTitle>
                        <CardDescription>
                            Feedback will appear here after analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p>Reviewing grammar, style, and clarity...</p>
                            </div>
                        ) : feedback ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap">{feedback}</div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground text-center px-4">
                                <PenTool className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p>Submit your text to see detailed corrections and suggestions for improvement.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
