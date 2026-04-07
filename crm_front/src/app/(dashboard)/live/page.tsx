/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: number;
  type: "text" | "image";
  content: string;
  sender_name: string;
  sender_username: string;
  is_teacher: boolean;
  is_pinned: boolean;
  sent_at: string;
  image_url?: string;
};

const mockMessages: ChatMessage[] = [];

function getCountdown(targetISO: string, now: number) {
  const targetUTC = new Date(targetISO).getTime();
  const diff = targetUTC - now;

  return {
    total: diff,
    days: Math.max(0, Math.floor(diff / 86400000)),
    hours: Math.max(0, Math.floor((diff % 86400000) / 3600000)),
    minutes: Math.max(0, Math.floor((diff % 3600000) / 60000)),
    seconds: Math.max(0, Math.floor((diff % 60000) / 1000)),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function chatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function LivePage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [lesson, setLesson] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [text, setText] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showVideoReminder, setShowVideoReminder] = useState(false);
  const [startingLesson, setStartingLesson] = useState(false);
  const [endingLesson, setEndingLesson] = useState(false);
  const accessToken = (session as any)?.accessToken as string | undefined;
  const role = session?.user?.role;

  const videoRef = useRef<HTMLDivElement | null>(null);
  const hlsVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const fetchLiveLesson = useCallback(async () => {
    if (!accessToken) return;

    try {
      const data = await apiFetch("/api/lessons/active/", { accessToken });
      if (data && data.id) {
        setLesson(data);
      } else {
        setLesson(null);
      }
    } catch (err) {
      console.error("Failed to fetch live lesson:", err);
      // Could be a 404 meaning no active lesson
      setLesson(null);
    }
  }, [accessToken]);

  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (!accessToken) return;
    fetchLiveLesson();
    const interval = setInterval(fetchLiveLesson, 15000);
    return () => clearInterval(interval);
  }, [accessToken, fetchLiveLesson]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxImage(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // WebSocket Connection
  useEffect(() => {
    if (!lesson?.id || !accessToken) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const configuredWsUrl = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "");
    const host = window.location.hostname === "localhost" ? "localhost:8000" : window.location.host;
    const wsBaseUrl = configuredWsUrl || `${protocol}//${host}`;
    const wsUrl = `${wsBaseUrl}/ws/live-chat/${lesson.id}/?token=${encodeURIComponent(accessToken)}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "history") {
          setMessages(data.messages || []);
        } else if (data.type === "message" && data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (err) {
        console.error("Invalid live chat payload:", err);
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    return () => {
      socket.close();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [accessToken, lesson?.id]);

  // ─── HLS Player Setup ────────────────────────────────────────────────────────
  useEffect(() => {
    const video = hlsVideoRef.current;
    if (!video || !lesson?.hls_url) return;

    const src = lesson.hls_url;

    // Safari/iOS handles HLS natively
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    // Chrome/Firefox: load hls.js dynamically
    let hlsInstance: any = null;
    import("hls.js").then(({ default: Hls }) => {
      if (!Hls.isSupported()) {
        console.warn("HLS not supported in this browser");
        return;
      }
      hlsInstance = new Hls({
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    });

    return () => {
      if (hlsInstance) hlsInstance.destroy();
    };
  }, [lesson?.hls_url]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!lesson?.id || role !== "TEACHER") return;
    if (lesson.status !== "finished" || lesson.video_uploaded) return;

    const reminderKey = `lesson_${lesson.id}_reminded`;
    if (window.localStorage.getItem(reminderKey)) return;

    setShowVideoReminder(true);
    window.localStorage.setItem(reminderKey, "true");
  }, [lesson?.id, lesson?.status, lesson?.video_uploaded, role]);

  async function handleStartLesson() {
    if (!accessToken || !lesson?.id || startingLesson) return;

    setStartingLesson(true);
    try {
      const res = await apiFetch(`/api/lessons/${lesson.id}/start/`, {
        method: "POST",
        accessToken,
      });
      if (res && res.id) {
        setLesson(res);
      }
    } catch (err) {
      console.error("Failed to start lesson:", err);
    } finally {
      setStartingLesson(false);
    }
  }

  async function handleEndLesson() {
    if (!accessToken || !lesson?.id || endingLesson) return;

    setEndingLesson(true);
    try {
      const payload = await apiFetch(`/api/lessons/${lesson.id}/end/`, {
        method: "POST",
        accessToken
      });
      if (!payload || !payload.id) {
        throw new Error("Failed to end live lesson");
      }

      setJoined(false);
      setLesson(payload);
    } catch (err) {
      console.error("Failed to end lesson:", err);
    } finally {
      setEndingLesson(false);
    }
  }

  const videoReminder = showVideoReminder ? (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
      <section className="pointer-events-auto w-full max-w-sm animate-in fade-in zoom-in-95 duration-200 rounded-3xl border border-teal-500/20 bg-gray-950/95 p-6 text-white shadow-2xl shadow-black/60 backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Reminder</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight">Lesson finished</h2>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          You can upload the recorded video for students to review later.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/videos/upload"
            className="rounded-2xl bg-[#14b8a6] px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-teal-500/30 transition-colors hover:bg-teal-400"
          >
            Upload Video
          </Link>
          <button
            type="button"
            onClick={() => setShowVideoReminder(false)}
            className="rounded-2xl border border-gray-800 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
          >
            Later
          </button>
        </div>
      </section>
    </div>
  ) : null;

  if (!mounted || status === "loading") {
    return null;
  }

  const lessonData = lesson;
  const lessonStatus = lessonData?.status;
  const isFinished = lessonStatus === "finished";
  const countdown = lessonData ? getCountdown(lessonData.datetime, now) : { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  let state = "none";
  if (lessonData) {
    if (lessonStatus === "finished") state = "finished";
    else if (lessonStatus === "live" || joined) state = "live";
    else if (lessonStatus === "scheduled") state = "scheduled";
  }

  const handleSend = async () => {
    if (!text.trim()) return;

    console.log("Sending message:", text.trim());

    const isConnected = socketRef.current && socketRef.current.readyState === WebSocket.OPEN;

    if (isConnected) {
      // Optimistic UI update for socket
      const tempMessage = {
        id: Date.now(),
        type: "text" as const,
        content: text.trim(),
        sender_name: session?.user?.name || "User",
        sender_username: session?.user?.email || "user",
        is_teacher: role === "TEACHER",
        is_pinned: false,
        sent_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMessage]);
      socketRef.current?.send(JSON.stringify({ type: "text", content: text.trim() }));
      setText("");
    } else {
      // HTTP Fallback
      try {
        const res = await apiFetch(`/api/attendance/lessons/${lessonData?.id}/messages/`, {
          method: "POST",
          accessToken,
          body: JSON.stringify({ message: text.trim() })
        });

        console.log("Response:", res);

        // IMPORTANT: update UI immediately
        if (res && res.id) {
          setMessages(prev => [...prev, res]);
        }
        setText("");
      } catch (err) {
        console.error("Failed to send message via HTTP:", err);
      }
    }
  };

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || !lesson?.id) return;

    if (!accessToken) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("lesson", lesson.id);

    try {
      const res = await apiFetch("/api/live/chat/upload/", {
        method: "POST",
        accessToken,
        body: formData,
      });
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "image", content: res.image_url }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
    event.target.value = "";
  }

  if (state === "none" || !lessonData) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-gray-950 text-white font-sans text-center">
        <section>
          <h1 className="text-2xl font-black text-gray-500 uppercase italic tracking-tighter">No live session.</h1>
          <p className="mt-2 text-sm text-gray-700">Check back later or view the video archive.</p>
        </section>
      </main>
    );
  }

  if (state === "scheduled") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-gray-950 text-white font-sans p-6">
        <section className="w-full max-w-3xl rounded-[2.5rem] border border-gray-800/50 bg-gray-900/40 backdrop-blur-xl p-12 text-center shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-400 border border-teal-500/20">
            <span className="h-2 w-2 rounded-full bg-teal-500 opacity-60"></span>
            Scheduled Lesson
          </div>
          <h1 className="mt-8 text-5xl font-black italic tracking-tighter text-white uppercase">{lessonData.title}</h1>
          <p className="mt-4 text-gray-400 font-medium tracking-wide">
            Next lesson starts on: <span className="text-teal-400">{new Date(lessonData.datetime).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', weekday: 'long', month: 'long', day: 'numeric' })} (Tashkent)</span>
          </p>
          <div className="mt-12">
            {role === "TEACHER" ? (
              <button
                onClick={handleStartLesson}
                disabled={startingLesson}
                className="w-full max-w-sm rounded-[2rem] bg-teal-500 px-8 py-6 text-xl font-black text-white hover:bg-teal-400 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-teal-500/40 uppercase tracking-tighter"
              >
                {startingLesson ? "STARTING..." : "START LIVE"}
              </button>
            ) : (
              <div className="opacity-50 select-none grayscale pointer-events-none">
                <div className="text-3xl font-black uppercase tracking-widest text-gray-700">Waiting for teacher...</div>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (state === "finished") {
    return (
      <main className="relative flex min-h-[70vh] items-center justify-center bg-gray-950 p-6 text-center font-sans text-white">
        <section className="w-full max-w-3xl rounded-[2.5rem] border border-gray-800/50 bg-gray-900/40 p-12 shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-400">
            Finished
          </div>
          <h1 className="mt-8 text-5xl font-black uppercase italic tracking-tighter text-white">{lessonData.title}</h1>
          <p className="mt-4 text-sm font-medium text-gray-400">
            The live session has ended. You can continue using the dashboard or upload the recording whenever you are ready.
          </p>
        </section>
        {videoReminder}
      </main>
    );
  }

  if (state === "scheduled" || state === "soon") {
    return null; // Should be handled by "scheduled" above
  }

  if (state === "live" && !joined) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-gray-950 text-white font-sans p-6">
        <section className="w-full max-w-3xl rounded-[3rem] border border-gray-800/50 bg-teal-950/20 backdrop-blur-3xl p-12 text-center shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white animate-pulse shadow-lg shadow-red-500/40">
            SESSION ACTIVE
          </div>
          <h1 className="mt-8 text-6xl font-black italic tracking-tighter text-white uppercase">{lessonData.title}</h1>
          <p className="mt-4 text-gray-400 font-medium">The session is active and ready for you to join.</p>
          <button
            onClick={() => setJoined(true)}
            className="mt-12 w-full max-w-sm rounded-[2rem] bg-teal-500 px-8 py-6 text-xl font-black text-white hover:bg-teal-400 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-teal-500/40 uppercase tracking-tighter"
          >
            Join Live Stream
          </button>
        </section>
      </main>
    );
  }

  const pinnedMessages = messages.filter((message) => message.is_pinned);

  return (
    <main className="bg-gray-950 text-white overflow-hidden h-auto lg:h-[calc(100vh-4rem)]">
      <div className="flex h-full flex-col lg:flex-row gap-4 p-4">
        {/* LEFT: VIDEO (2/3) */}
        <section ref={videoRef} className="lg:flex-[2] aspect-video lg:aspect-auto relative overflow-hidden rounded-[2rem] border border-gray-800/50 bg-black shadow-2xl group flex flex-col">
          <div className="flex-1 relative">
            {lesson?.hls_url ? (
              /* ── HLS Player ── */
              <video
                ref={hlsVideoRef}
                controls
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full bg-black object-contain"
                onError={() => console.warn("HLS playback error — stream may have not started yet")}
              />
            ) : (
              /* ── No Stream Yet Fallback ── */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/20">
                  <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-teal-400 opacity-20" />
                  <svg className="h-7 w-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                </div>
                <p className="text-lg font-black uppercase tracking-widest text-gray-400">Live will start soon</p>
                <p className="text-xs text-gray-600 max-w-xs">
                  The teacher will begin streaming shortly via OBS.
                  <br />
                  Stream: <span className="text-teal-500 font-mono">rtmp://{process.env.NEXT_PUBLIC_STREAM_URL || "YOUR_SERVER_IP"}/LiveApp</span>
                </p>
              </div>
            )}
          </div>

          <div className="absolute top-6 left-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-600/40">
              <span className="h-3 w-3 animate-ping rounded-full bg-white opacity-75" />
              <span className="h-2 w-2 rounded-full bg-white" />
            </div>
            <div className="rounded-xl bg-black/60 backdrop-blur-md px-4 py-2 text-sm font-bold text-white border border-white/10 shadow-xl">
              LIVE • {lessonData.title}
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {role === "TEACHER" && (
              <button
                onClick={handleEndLesson}
                disabled={endingLesson}
                className="rounded-xl bg-red-600/90 px-6 py-3 text-sm font-black text-white hover:bg-red-500 backdrop-blur-md shadow-xl transition-all hover:scale-105"
              >
                {endingLesson ? "ENDING..." : "END SESSION"}
              </button>
            )}
            <button
              onClick={() => videoRef.current?.requestFullscreen()}
              className="rounded-xl bg-gray-900/90 px-6 py-3 text-sm font-black text-white hover:bg-teal-500 backdrop-blur-md border border-white/10 shadow-xl transition-all hover:scale-105"
            >
              FULLSCREEN
            </button>
          </div>
        </section>

        {/* RIGHT: CHAT (1/3) */}
        <aside className="lg:flex-1 h-[500px] lg:h-auto min-w-[320px] flex flex-col overflow-hidden rounded-[2rem] border border-gray-800/50 bg-gray-900/40 backdrop-blur-xl shadow-2xl">
          <header className="p-4 md:p-5 border-b border-gray-800/50 flex items-center justify-between">
            <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-gray-400">Live Chat</h2>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{messages.length} Messages</span>
            </div>
          </header>

          {pinnedMessages.length > 0 && (
            <section className="max-h-[140px] overflow-y-auto border-b border-gray-800/50 p-4 bg-teal-950/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Pinned</span>
              </div>
              <div className="space-y-3">
                {pinnedMessages.map((message) => (
                  <div key={message.id} className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-3">
                    <p className="text-xs font-bold text-teal-400">{message.sender_name}</p>
                    <p className="mt-1 text-sm text-gray-200">{message.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5 scroll-smooth custom-scrollbar">
            {messages.map((message) => (
              <article key={message.id} className={`group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <p className={`text-xs font-black uppercase tracking-wider ${message.is_teacher ? "text-teal-400" : "text-gray-400"}`}>
                    {message.sender_name}
                  </p>
                  <span className="text-[9px] font-bold text-gray-600 tabular-nums">{chatTime(message.sent_at)}</span>
                </div>
                {message.type === "image" && message.content ? (
                  <button className="mt-2 block overflow-hidden rounded-2xl border border-gray-800/50 hover:border-teal-500/50 transition-colors" onClick={() => setLightboxImage(message.content)}>
                    <img src={message.content} alt="Chat image" className="max-w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
                  </button>
                ) : (
                  <p className="text-sm text-gray-300 leading-relaxed break-words">{message.content}</p>
                )}
              </article>
            ))}
          </section>

          <footer className="p-5 border-t border-gray-800/50 space-y-4">
            <div className="relative group">
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") handleSend(); }}
                placeholder="Message..."
                className="w-full rounded-2xl border border-gray-800/50 bg-gray-950/50 px-5 py-3.5 md:py-4 text-sm md:text-base text-white outline-none focus:border-teal-500 transition-colors placeholder:text-gray-700"
              />
              <button
                onClick={handleSend}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-teal-500 p-2 text-white hover:bg-teal-400 shadow-lg shadow-teal-500/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            </div>
            <div className="flex gap-3">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 rounded-2xl border border-gray-800/50 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-gray-600 transition-all font-bold"
              >
                Upload Image
              </button>
            </div>
          </footer>
        </aside>
      </div>

      {lightboxImage && (
        <div onClick={() => setLightboxImage(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <img src={lightboxImage} alt="Uploaded chat image" className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl" />
        </div>
      )}

      {videoReminder}
    </main>
  );
}
