"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, X, MessageCircle, Send, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIHelper() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([
        { role: "assistant", content: "Hello! I'm your AI Academic Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessages: { role: "assistant" | "user"; content: string }[] = [
            ...messages,
            { role: "user" as const, content: input }
        ];
        setMessages(newMessages);
        setInput("");

        // Simulate AI response
        setTimeout(() => {
            setMessages([
                ...newMessages,
                {
                    role: "assistant" as const,
                    content: "I'm currently in demo mode. Connect an OpenAI API key in your environment to enable real-time architectural and academic support!"
                }
            ]);
        }, 800);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-16 w-16 rounded-full shadow-2xl shadow-primary/40 p-0 overflow-hidden group border-none"
                    variant="default"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 animate-pulse group-hover:scale-110 transition-transform" />
                    <Sparkles className="relative h-7 w-7 text-white" />
                </Button>
            ) : (
                <Card className="w-80 sm:w-96 border-none bg-card/60 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10 animate-in slide-in-from-bottom-5">
                    <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Brain className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-sm font-black tracking-tight">Academic AI Helper</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-96 overflow-y-auto p-4 space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={cn(
                                    "p-3 rounded-2xl text-sm font-medium leading-relaxed",
                                    m.role === "assistant"
                                        ? "bg-muted/40 text-foreground mr-8 rounded-tl-none"
                                        : "bg-primary text-white ml-8 rounded-tr-none"
                                )}>
                                    {m.content}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/5 flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Ask anything..."
                                className="flex-1 bg-muted/20 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            />
                            <Button size="icon" className="rounded-xl h-10 w-10" onClick={handleSend}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
