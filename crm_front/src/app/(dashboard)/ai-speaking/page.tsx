"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Use proper typing for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export default function SpeakingPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    const recognitionRef = useRef<any>(null);

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

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event: any) => {
                    let currentTranscript = "";
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(currentTranscript);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsRecording(false);
                    if (event.error !== "no-speech") {
                        toast.error("Microphone error. Please allow microphone access.");
                    }
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                };
            } else {
                toast.error("Your browser does not support Speech Recognition. Try Chrome.");
            }
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            if (transcript.trim().length > 0) {
                analyzeSpeech(transcript);
            }
        } else {
            setTranscript("");
            setFeedback(null);
            try {
                recognitionRef.current?.start();
                setIsRecording(true);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const analyzeSpeech = async (text: string) => {
        setIsAnalyzing(true);
        try {
            const res = await fetch(`/api/ai/analyze-text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, type: "speaking" }),
            });

            if (res.status === 503) {
                const message = await res.text();
                toast.error(message, {
                    duration: 5000,
                });
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
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
                <p className="text-muted-foreground">
                    Practice your pronunciation and receive AI feedback on your grammar.
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

            <Card className={cn(!aiEnabled && "opacity-60 cursor-not-allowed")}>
                <CardHeader>
                    <CardTitle>Record Speech</CardTitle>
                    <CardDescription>
                        Click the microphone to start recording. Speak clearly into your device's microphone.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-6 p-12">
                    <Button
                        size="lg"
                        variant={isRecording ? "destructive" : "default"}
                        className="h-24 w-24 rounded-full"
                        onClick={toggleRecording}
                        disabled={isAnalyzing || !aiEnabled}
                    >
                        {isRecording ? <Square className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                    </Button>

                    {isRecording && (
                        <div className="flex items-center gap-2 text-destructive animate-pulse font-medium">
                            <span className="h-3 w-3 rounded-full bg-destructive" />
                            Recording in progress...
                        </div>
                    )}

                    {transcript && (
                        <div className="w-full mt-8 p-4 bg-muted/50 rounded-lg min-h-[100px]">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Volume2 className="h-4 w-4" />
                                Live Transcript
                            </div>
                            <p className="text-lg">{transcript}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {(isAnalyzing || feedback) && (
                <Card className="border-primary/20 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <CheckCircle2 className="h-5 w-5" />
                            AI Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isAnalyzing ? (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Analyzing your speech patterns...
                            </div>
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap">{feedback}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
