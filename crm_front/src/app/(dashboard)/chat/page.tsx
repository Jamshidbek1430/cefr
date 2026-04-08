"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
    MessageCircle,
    Send,
    Image as ImageIcon,
    Search,
    ChevronLeft,
    Hash,
    Radio
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { LoadingState, PageCard, EmptyState } from "@/components/dashboard/education-ui";
import { cn } from "@/lib/utils";

type Message = {
    id: number;
    type: "text" | "image";
    content: string;
    sender_name: string;
    sender_username: string;
    sender_role?: string;
    is_teacher: boolean;
    sent_at: string;
    image_url?: string;
};

type Room = {
    id: number;
    name: string;
    date: string;
    is_live: boolean;
};

export default function ChatPage() {
    const { data: session, status } = useSession();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [mobileView, setMobileView] = useState<"rooms" | "chat">("rooms");
    const accessToken = (session as any)?.accessToken as string | undefined;

    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRooms = useCallback(async () => {
        try {
            const data = await apiFetch("/api/chat/rooms", { accessToken });
            setRooms(data || []);
        } catch (err) {
            console.error("Failed to fetch rooms", err);
        } finally {
            setRoomsLoading(false);
            setLoading(false);
        }
    }, [accessToken]);

    const fetchMessages = useCallback(async (lessonId: number) => {
        try {
            const data = await apiFetch(`/api/messages?lesson_id=${lessonId}`, { accessToken });
            setMessages(data || []);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    }, [accessToken]);

    const connectWebSocket = useCallback((lessonId: number) => {
        if (!accessToken) return;

        const cleanup = () => {
            if (socketRef.current) {
                socketRef.current.onopen = null;
                socketRef.current.onmessage = null;
                socketRef.current.onerror = null;
                socketRef.current.onclose = null;
                socketRef.current.close();
                socketRef.current = null;
            }
        };

        cleanup();

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const configuredWsUrl = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "");

        // Use window.location.hostname for robustness
        const backendHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "127.0.0.1:8000"
            : window.location.host;

        const wsBaseUrl = configuredWsUrl || `${protocol}//${backendHost}`;
        const wsUrl = `${wsBaseUrl}/ws/live-chat/${lessonId}/?token=${encodeURIComponent(accessToken)}`;

        console.log("Connecting to WebSocket:", wsUrl);
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket Connected");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "message" && data.message) {
                    setMessages(prev => [...prev, data.message]);
                } else if (data.type === "history" && Array.isArray(data.messages)) {
                    setMessages(data.messages);
                }
            } catch (error) {
                console.error("Invalid chat payload:", error);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        socket.onclose = (event) => {
            console.log("WebSocket Closed:", event.code, event.reason);
            // Attempt to reconnect after 3 seconds if not closed intentionally
            if (event.code !== 1000) {
                setTimeout(() => {
                    if (activeRoom?.id === lessonId) {
                        connectWebSocket(lessonId);
                    }
                }, 3000);
            }
        };
    }, [accessToken, activeRoom?.id]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchRooms();
        }
        if (status === "unauthenticated") {
            setRoomsLoading(false);
            setLoading(false);
        }
    }, [fetchRooms, status]);

    useEffect(() => {
        if (activeRoom) {
            fetchMessages(activeRoom.id);
            connectWebSocket(activeRoom.id);
            if (window.innerWidth < 768) setMobileView("chat");
        }
        return () => {
            socketRef.current?.close();
        };
    }, [activeRoom, connectWebSocket, fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        socketRef.current.send(JSON.stringify({
            type: "text",
            message: input.trim()
        }));
        setInput("");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeRoom) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("/api/live/chat/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            const data = await res.json();
            if (data.image_url && socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    type: "image",
                    message: data.image_url
                }));
            } else if (data.error) {
                console.error("Upload error:", data.error);
            }
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    if (status === "loading" || loading) return <LoadingState label="Loading chat..." />;

    return (
        <div className="flex h-[calc(100vh-120px)] gap-4 overflow-hidden">
            {/* LEFT: ROOMS LIST */}
            <div className={cn(
                "flex w-full flex-col md:w-80 lg:w-96",
                mobileView === "chat" ? "hidden md:flex" : "flex"
            )}>
                <PageCard className="flex flex-1 flex-col overflow-hidden bg-gray-950/50 p-0">
                    <div className="border-b border-gray-800 p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <input
                                placeholder="Search lessons..."
                                className="w-full rounded-xl border border-gray-800 bg-gray-900 py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 p-2">
                        {rooms.length === 0 && !roomsLoading && (
                            <p className="p-4 text-center text-sm text-gray-500">No chat rooms available.</p>
                        )}
                        {rooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoom(room)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-gray-900",
                                    activeRoom?.id === room.id ? "bg-teal-500/10 text-teal-400" : "text-gray-400"
                                )}
                            >
                                <div className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                                    room.is_live ? "bg-red-500/20 text-red-500" : "bg-gray-800 text-gray-500"
                                )}>
                                    {room.is_live ? <Radio className="h-6 w-6 animate-pulse" /> : <Hash className="h-6 w-6" />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate font-bold text-white">{room.name}</p>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-widest opacity-60">
                                        {room.date}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </PageCard>
            </div>

            {/* RIGHT: ACTIVE CHAT */}
            <div className={cn(
                "flex flex-1 flex-col overflow-hidden",
                mobileView === "rooms" ? "hidden md:flex" : "flex"
            )}>
                {activeRoom ? (
                    <PageCard className="flex flex-1 flex-col overflow-hidden bg-gray-950/70 p-0 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center gap-4 border-b border-gray-800 bg-gray-900/40 p-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileView("rooms")}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex-1">
                                <h2 className="font-black tracking-tight text-white">{activeRoom.name}</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className={cn("h-1.5 w-1.5 rounded-full", activeRoom.is_live ? "bg-red-500 animate-pulse" : "bg-gray-500")} />
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400">
                                        {activeRoom.is_live ? "Live now" : "Archived Session"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4"
                        >
                            {messages.map((msg, i) => {
                                const isMe = msg.sender_username === (session?.user as any)?.username;
                                return (
                                    <div key={msg.id || i} className={cn(
                                        "flex flex-col max-w-[85%] sm:max-w-[70%]",
                                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                                    )}>
                                        {!isMe && (
                                            <p className="mb-1 text-[10px] font-bold text-gray-500 ml-1">
                                                {msg.sender_name} {msg.is_teacher && "• Teacher"}
                                            </p>
                                        )}
                                        <div className={cn(
                                            "rounded-2xl px-4 py-2.5 shadow-lg",
                                            isMe
                                                ? "bg-teal-600 text-white rounded-tr-none"
                                                : "bg-gray-800/80 text-white rounded-tl-none border border-gray-700/50"
                                        )}>
                                            {msg.type === "text" ? (
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                            ) : (
                                                <img
                                                    src={msg.content}
                                                    alt="Uploaded"
                                                    className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition"
                                                />
                                            )}
                                        </div>
                                        <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-gray-600">
                                            {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="border-t border-gray-800 bg-gray-900/40 p-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl text-gray-400 hover:text-white"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageIcon className="h-5 w-5" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                    />
                                </Button>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                                <Button
                                    onClick={sendMessage}
                                    className="rounded-xl bg-teal-500 px-4 hover:bg-teal-400"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </PageCard>
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <EmptyState
                            title="Select a session"
                            description="Pick a lesson from the list to start chatting or view history."
                            icon={MessageCircle}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
