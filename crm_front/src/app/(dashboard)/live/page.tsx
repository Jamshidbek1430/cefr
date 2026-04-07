"use client";
import { useEffect, useRef, useState } from "react";

export default function LivePage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [isLive, setIsLive] = useState(false); // better than alert
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender_name: "You",
      content: text,
    };
    setMessages((prev) => [...prev, newMessage]);
    setText("");
  };

  const handleStart = () => {
    setIsLive(true);
    // You can add real logic later (e.g. notify backend)
    alert("Live started! Make sure OBS + VDO.Ninja push is running.");
  };

  const handleEnd = () => {
    setIsLive(false);
    alert("Live ended");
  };

  return (
    <main className="flex h-screen bg-[#0B1120] text-white overflow-hidden">
      {/* 🎥 LIVE STREAM AREA */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-800">
          Live Lesson {isLive && <span className="text-green-500 text-sm ml-2">(LIVE)</span>}
        </div>

        <div className="flex-1 p-4 bg-black relative">
          <iframe
            src="https://vdo.ninja/?room=il0v3y040_&cleanoutput&lowlatency"
            className="w-full h-full rounded-xl"
            allow="autoplay; fullscreen; display-capture"
            allowFullScreen
          />
          
          {/* Optional loading overlay */}
          {!isLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl">
              <div className="text-center">
                <div className="text-2xl mb-2">Waiting for live stream...</div>
                <p className="text-gray-400">Click "Start" when OBS is pushing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 💬 CHAT SIDEBAR */}
      <div className="w-[350px] border-l border-gray-800 flex flex-col">
        <div className="p-4 font-bold border-b border-gray-800">Live Chat</div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B1120]">
          {messages.length === 0 && (
            <div className="text-gray-500 text-center mt-10">No messages yet...</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className="bg-gray-800 p-3 rounded-lg">
              <b className="text-teal-400">{m.sender_name}</b>: {m.content}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-black border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-teal-500"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSend}
              className="bg-teal-500 hover:bg-teal-600 px-6 rounded-lg font-medium transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Controls */}
      <div className="fixed bottom-6 right-6 flex gap-3 z-50">
        <button
          onClick={handleStart}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          ▶️ Start Live
        </button>
        <button
          onClick={handleEnd}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium"
        >
          ⏹️ End Live
        </button>
      </div>
    </main>
  );
}
