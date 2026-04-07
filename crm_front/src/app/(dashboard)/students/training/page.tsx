"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, Brain, Sparkles, BookOpen, CheckCircle2, XCircle, RefreshCcw, History, ArrowRight, Pen, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Question = {
    id: number;
    text: string;
    options: string[];
    answer: string;
    explanation: string;
};

type TrainingMode = "Quiz" | "Speaking" | "Writing";

export default function StudentTrainingPage() {
    const [mode, setMode] = useState<TrainingMode>("Quiz");
    const [step, setStep] = useState<"topic" | "practice" | "result">("topic");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [inputText, setInputText] = useState("");
    const [aiFeedback, setAiFeedback] = useState("");

    const topics = [
        "React Fundamentals",
        "Next.js App Router",
        "Prisma Orm & DB",
        "Tailwind CSS Layouts",
        "TypeScript Basics"
    ];

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/students/training`);
            if (res.ok) setHistory(await res.json());
        } catch (error) {
            console.error("History fetch fail");
        }
    };

    const startTraining = async (topic: string) => {
        setLoading(true);
        try {
            // In a real app, this would call AI to generate questions.
            // For now, we simulate with rich demo data to show the UI excellence.
            setTimeout(() => {
                const demoQuestions: Question[] = [
                    {
                        id: 1,
                        text: `In context of ${topic}, which of the following best describes its core purpose?`,
                        options: ["Data persistence", "UI State Management", "Networking", "Package Management"],
                        answer: topic === "React Fundamentals" ? "UI State Management" : "Data persistence",
                        explanation: `${topic} is designed primarily to handle the underlying architecture and performance of modern web applications.`
                    },
                    {
                        id: 2,
                        text: "What is the primary benefit of using this technology?",
                        options: ["Faster development", "Cost reduction", "Legacy support", "Native mobile performance"],
                        answer: "Faster development",
                        explanation: "Modern frameworks prioritize developer experience and high-level abstractions."
                    }
                ];
                setQuestions(demoQuestions);
                setStep("practice");
                setCurrentIdx(0);
                setScore(0);
                setLoading(false);
                setSelectedOption(null);
                setShowExplanation(false);
                setInputText("");
            }, 1500);
        } catch (error) {
            toast.error("Failed to generate training session.");
            setLoading(false);
        }
    };

    const handleAnswer = () => {
        if (!selectedOption) return;

        const isCorrect = selectedOption === questions[currentIdx].answer;
        if (isCorrect) setScore(score + 1);
        setShowExplanation(true);
    };

    const nextQuestion = () => {
        if (currentIdx + 1 < questions.length) {
            setCurrentIdx(currentIdx + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            finishSession();
        }
    };

    const finishSession = async () => {
        setStep("result");
        try {
            await fetch(`/api/students/training`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: questions[0].text.includes("React") ? "React" : "General",
                    score: score + (selectedOption === questions[currentIdx].answer ? 1 : 0),
                    totalQuestions: questions.length
                })
            });
            fetchHistory();
        } catch (error) {
            console.error("Save session fail");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Brain className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-black tracking-tight text-primary">AI is architecting your quiz...</p>
                    <p className="text-sm text-muted-foreground font-medium">Generating unique challenges based on your curriculum.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Practice Hub</h1>
                    <p className="text-muted-foreground font-medium mt-2 italic flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Sharpen your skills with AI-powered personalized benchmarks.
                    </p>
                </div>
            </header>

            {step === "topic" && (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-black tracking-tight">Select Training Topic</h2>
                        </div>
                        <div className="flex gap-2 p-1 bg-muted/40 rounded-2xl w-fit">
                            {(["Quiz", "Speaking", "Writing"] as TrainingMode[]).map((m) => (
                                <Button
                                    key={m}
                                    variant={mode === m ? "default" : "ghost"}
                                    onClick={() => setMode(m)}
                                    className={cn(
                                        "rounded-xl font-black text-xs uppercase tracking-widest px-6",
                                        mode === m ? "shadow-lg shadow-primary/20" : "text-muted-foreground"
                                    )}
                                >
                                    {m === "Speaking" ? <Mic className="h-3.5 w-3.5 mr-2" /> : m === "Writing" ? <Pen className="h-3.5 w-3.5 mr-2" /> : <Brain className="h-3.5 w-3.5 mr-2" />}
                                    {m}
                                </Button>
                            ))}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {topics.map((t) => (
                                <Card
                                    key={t}
                                    className="group cursor-pointer border-none bg-card/60 backdrop-blur-xl shadow-xl ring-1 ring-white/10 hover:ring-primary/40 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                                    onClick={() => startTraining(t)}
                                >
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-black text-lg tracking-tight">{t}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {mode === "Quiz" ? "10 Questions" : mode === "Speaking" ? "Voice Analysis" : "Text Review"} • Intermediate
                                            </p>
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <History className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-black tracking-tight">Recent Activity</h2>
                        </div>
                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <p className="text-xs font-bold text-muted-foreground opacity-40 px-2 italic">No sessions logged yet.</p>
                            ) : (
                                history.map((s) => (
                                    <div key={s.id} className="p-4 rounded-2xl bg-muted/30 border border-white/5 flex justify-between items-center group">
                                        <div>
                                            <p className="text-sm font-bold tracking-tight">{s.topic}</p>
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">
                                                {new Date(s.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="font-black text-xs border-primary/20 text-primary bg-primary/5">
                                            {s.score}/{s.totalQuestions}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === "practice" && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px]">
                            {mode} Mode • {mode === "Quiz" ? `Question ${currentIdx + 1} of ${questions.length}` : "Active Practice"}
                        </Badge>
                        {mode === "Quiz" && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black tracking-tighter opacity-60">SCORE: {score}</span>
                            </div>
                        )}
                    </div>

                    {mode === "Quiz" && <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-2.5 rounded-full bg-muted/50 overflow-hidden shadow-inner" />}

                    <Card className="border-none bg-card/60 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                        {mode === "Quiz" ? (
                            <>
                                <CardHeader className="p-8">
                                    <CardTitle className="text-2xl font-black leading-tight tracking-tight">
                                        {questions[currentIdx].text}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-4">
                                    {questions[currentIdx].options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => !showExplanation && setSelectedOption(opt)}
                                            className={cn(
                                                "w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 font-bold flex items-center justify-between group",
                                                selectedOption === opt
                                                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-4 ring-primary/5"
                                                    : "border-white/5 bg-muted/20 hover:border-white/20 hover:bg-muted/40",
                                                showExplanation && opt === questions[currentIdx].answer && "border-green-500 bg-green-500/10",
                                                showExplanation && opt === selectedOption && opt !== questions[currentIdx].answer && "border-red-500 bg-red-500/10"
                                            )}
                                        >
                                            <span className="text-lg">{opt}</span>
                                            {showExplanation && opt === questions[currentIdx].answer && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                                            {showExplanation && opt === selectedOption && opt !== questions[currentIdx].answer && <XCircle className="h-6 w-6 text-red-500" />}
                                        </button>
                                    ))}
                                </CardContent>
                            </>
                        ) : mode === "Speaking" ? (
                            <CardContent className="p-12 text-center space-y-8">
                                <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
                                    <Mic className="h-10 w-10 text-primary" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black tracking-tight">Voice Transcription Active</h3>
                                    <p className="text-muted-foreground font-medium italic">"{inputText || "Explain the concept aloud..."}"</p>
                                </div>
                                <div className="flex justify-center gap-4">
                                    <Button size="lg" className="rounded-2xl px-8 py-6 h-auto font-black" onClick={() => setInputText("React is a library for building user interfaces...")}>
                                        Simulate Speech
                                    </Button>
                                    <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 h-auto font-black" onClick={finishSession}>
                                        Done
                                    </Button>
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Technical Review</label>
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Type your technical writing here for AI audit..."
                                        className="w-full h-48 bg-muted/20 rounded-2xl p-6 border-white/5 focus:ring-2 focus:ring-primary/40 outline-none transition-all font-medium text-lg"
                                    />
                                </div>
                                <Button className="w-full h-14 rounded-2xl font-black shadow-xl shadow-primary/20" onClick={finishSession} disabled={!inputText}>
                                    Run AI Audit
                                </Button>
                            </CardContent>
                        )}

                        {showExplanation && (
                            <CardFooter className="p-8 bg-muted/30 border-t border-white/5 animate-in slide-in-from-top-2">
                                <div className="space-y-4 w-full">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Sparkles className="h-5 w-5" />
                                        <p className="font-black text-sm uppercase tracking-widest">AI Explanation</p>
                                    </div>
                                    <p className="text-muted-foreground font-medium leading-relaxed">
                                        {questions[currentIdx].explanation}
                                    </p>
                                    <Button onClick={nextQuestion} className="w-full h-14 rounded-2xl font-black text-md shadow-xl shadow-primary/20 gap-2">
                                        {currentIdx + 1 === questions.length ? "Finish Assessment" : "Next Question"}
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardFooter>
                        )}
                        {(!showExplanation && mode === "Quiz") && (
                            <div className="p-8 pt-0">
                                <Button
                                    onClick={handleAnswer}
                                    disabled={!selectedOption}
                                    className="w-full h-14 rounded-2xl font-black text-md shadow-xl shadow-primary/20"
                                >
                                    Submit Answer
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {step === "result" && (
                <Card className="max-w-xl mx-auto border-none bg-card/60 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 p-12 text-center space-y-8 animate-in zoom-in-95 duration-700">
                    <div className="relative inline-block">
                        <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto ring-8 ring-primary/5">
                            <Sparkles className="h-16 w-16 text-primary" />
                        </div>
                        <Badge className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 text-white font-black rounded-full border-4 border-background">
                            COMPLETED
                        </Badge>
                    </div>

                    <div>
                        <h2 className="text-4xl font-black tracking-tighter">Session Complete!</h2>
                        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-xs mt-2">Personal Score Summary</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-muted/40 border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Score</p>
                            <p className="text-4xl font-black text-primary">{Math.round((score / questions.length) * 100)}%</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-muted/40 border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Accuracy</p>
                            <p className="text-4xl font-black">{score}/{questions.length}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Button className="w-full h-14 rounded-2xl font-black text-md shadow-xl shadow-primary/20 gap-2" onClick={() => setStep("topic")}>
                            <RefreshCcw className="h-5 w-5" />
                            Retrain on Different Topic
                        </Button>
                        <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-muted-foreground hover:bg-muted" onClick={() => setStep("topic")}>
                            Back to Dashboard
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
