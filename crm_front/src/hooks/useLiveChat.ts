"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

export type LiveChatMessage = {
    id: number;
    type: "text" | "image";
    content: string;
    sender_name: string;
    sender_username: string;
    sender_role: string;
    is_teacher: boolean;
    is_pinned?: boolean;
    sent_at: string;
};

const WS_BASE_URL = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000").replace(/\/$/, "");

function mergeMessages(...groups: LiveChatMessage[][]) {
    const merged = new Map<number, LiveChatMessage>();

    for (const group of groups) {
        for (const message of group) {
            merged.set(message.id, message);
        }
    }

    return [...merged.values()].sort(
        (left, right) => new Date(left.sent_at).getTime() - new Date(right.sent_at).getTime(),
    );
}

type UseLiveChatOptions = {
    lessonId?: number | null;
    accessToken?: string;
    initialMessages?: LiveChatMessage[];
    enabled?: boolean;
};

export function useLiveChat({
    lessonId,
    accessToken,
    initialMessages = [],
    enabled = true,
}: UseLiveChatOptions) {
    const [messages, setMessages] = useState<LiveChatMessage[]>(initialMessages);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectRef = useRef(0);
    const reconnectTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setMessages((current) => mergeMessages(current, initialMessages));
    }, [initialMessages]);

    const appendMessages = useEffectEvent((incoming: LiveChatMessage[]) => {
        setMessages((current) => mergeMessages(current, incoming));
    });

    const appendMessage = useEffectEvent((incoming: LiveChatMessage) => {
        setMessages((current) => mergeMessages(current, [incoming]));
    });

    useEffect(() => {
        if (!enabled || !lessonId || !accessToken) {
            setIsConnected(false);
            return;
        }

        let active = true;

        const clearReconnect = () => {
            if (reconnectTimerRef.current) {
                window.clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
        };

        const connect = () => {
            clearReconnect();

            const socket = new WebSocket(
                `${WS_BASE_URL}/ws/live-chat/${lessonId}/?token=${encodeURIComponent(accessToken)}`,
            );
            socketRef.current = socket;

            socket.onopen = () => {
                if (!active) return;
                reconnectRef.current = 0;
                setIsConnected(true);
            };

            socket.onmessage = (event) => {
                if (!active) return;
                try {
                    const payload = JSON.parse(event.data);
                    if (payload.type === "history") {
                        appendMessages(payload.messages || []);
                        return;
                    }
                    if (payload.type === "message" && payload.message) {
                        appendMessage(payload.message);
                    }
                } catch (error) {
                    console.error("Invalid live chat payload:", error);
                }
            };

            socket.onclose = () => {
                if (!active) return;
                setIsConnected(false);
                if (reconnectRef.current >= 5) return;
                reconnectRef.current += 1;
                reconnectTimerRef.current = window.setTimeout(connect, 3000);
            };

            socket.onerror = () => {
                socket.close();
            };
        };

        connect();

        return () => {
            active = false;
            clearReconnect();
            socketRef.current?.close();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [accessToken, appendMessage, appendMessages, enabled, lessonId]);

    const send = (type: "text" | "image", content: string) => {
        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN || !content.trim()) {
            return false;
        }

        socket.send(JSON.stringify({ type, content: content.trim() }));
        return true;
    };

    return useMemo(() => ({
        messages,
        sendMessage: (text: string) => send("text", text),
        sendImage: (url: string) => send("image", url),
        isConnected,
    }), [isConnected, messages]);
}
