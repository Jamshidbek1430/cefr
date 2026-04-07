"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function AIHelperPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm your AI learning assistant. How can I help you with your studies today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkAiStatus = async () => {
            try {
                const res = await fetch(`/api/ai/config`);
                const data = await res.json();
                setAiEnabled(data.enabled);
                if (!data.enabled) {
                    setMessages([{
                        role: "assistant",
                        content: "I'm currently offline as AI features are disabled. Please contact the administrator or add an OpenAI API key."
                    }]);
                }
            } catch (e) {
                console.error("Failed to check AI status", e);
            }
        };
        checkAiStatus();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [messages, isLoading]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !aiEnabled) return;

        const userMessage: Message = { role: "user", content: input.trim() };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch(`/api/ai/helper`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages.slice(-10) }),
            });

            if (res.status === 503) {
                const message = await res.text();
                toast.error(message, { duration: 5000 });
                setIsLoading(false);
                return;
            }

            if (!res.ok) throw new Error("Failed to get response");

            const data = await res.json();
            setMessages([...newMessages, { role: "assistant", content: data.message.content }]);
        } catch (error) {
            toast.error("AI Helper is currently unavailable.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
            {!aiEnabled && (
                <Alert variant="destructive" className="bg-destructive/10 shrink-0">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>AI Features Disabled</AlertTitle>
                    <AlertDescription>
                        AI features are not available yet – please add your OpenAI API key in environment variables to enable them.
                    </AlertDescription>
                </Alert>
            )}
            <Card className={cn("flex flex-col h-full shadow-lg border-primary/20 overflow-hidden", !aiEnabled && "opacity-60")}>
                <CardHeader className="border-b bg-muted/30 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">AI Assistant</CardTitle>
                            <CardDescription>Ask questions about your lessons or homework</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <ScrollArea ref={scrollRef} className="flex-1 p-4">
                        <div className="flex flex-col gap-6 py-4">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex gap-4 max-w-[85%]",
                                        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <Avatar className="h-8 w-8 mt-1 shrink-0">
                                        <AvatarFallback className={cn(
                                            msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                                        )}>
                                            {msg.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-muted rounded-tl-sm"
                                    )}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4 max-w-[85%]">
                                    <Avatar className="h-8 w-8 mt-1 shrink-0">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            <Bot className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="px-4 py-3 rounded-2xl bg-muted rounded-tl-sm flex items-center gap-2">
                                        <div className="h-2 w-2 bg-primary/50 flex-shrink-0 animate-bounce rounded-full" style={{ animationDelay: "0ms" }} />
                                        <div className="h-2 w-2 bg-primary/50 flex-shrink-0 animate-bounce rounded-full" style={{ animationDelay: "150ms" }} />
                                        <div className="h-2 w-2 bg-primary/50 flex-shrink-0 animate-bounce rounded-full" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-muted/10">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={aiEnabled ? "Ask me anything..." : "AI is disabled"}
                                disabled={isLoading || !aiEnabled}
                                className="flex-1 shadow-sm h-12"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !aiEnabled} className="h-12 w-12 shrink-0 rounded-xl">
                                <Send className="h-5 w-5" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                        <p className="text-[10px] text-center mt-2 text-muted-foreground">
                            AI can make mistakes. Consider verifying important information.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
