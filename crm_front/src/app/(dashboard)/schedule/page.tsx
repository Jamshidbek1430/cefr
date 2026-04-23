"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Lesson = {
  id: number;
  title: string;
  scheduled_at: string;
  youtube_url?: string;
};

function dateKey(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function timeValue(value: string) {
  return new Date(value).toTimeString().slice(0, 5);
}

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [month, setMonth] = useState(new Date("2026-04-01T00:00:00"));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("14:00");
  const [youtubeUrl, setYoutubeUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");

  useEffect(() => {
    setMounted(true);
    fetchLessons();
  }, [session]);

  async function fetchLessons() {
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) return;

    try {
      const data = await apiFetch("/api/lessons/", { accessToken });
      const results = Array.isArray(data) ? data : data.results || [];
      const mapped = results.map((l: any) => ({
        id: l.id,
        title: l.title,
        scheduled_at: `${l.date}T${l.time}`,
        youtube_url: l.youtube_embed_url
      }));
      setLessons(mapped);
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
    }
  }

  if (!mounted || status === "loading") {
    return null;
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6">
          <h1 className="text-2xl font-bold">Admin only</h1>
          <p className="mt-2 text-gray-400">Only admins can manage the schedule.</p>
        </section>
      </main>
    );
  }

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const emptyCells = Array.from({ length: firstDay.getDay() }, (_, index) => index);
  const days = Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthIndex, index + 1));
  const selectedKey = selectedDate ? dateKey(selectedDate) : "";
  const selectedLesson = lessons.find((lesson) => dateKey(lesson.scheduled_at) === selectedKey);

  function openDay(date: Date) {
    const lesson = lessons.find((item) => dateKey(item.scheduled_at) === dateKey(date));
    setSelectedDate(date);
    setTitle(lesson?.title || "");
    setTime(lesson ? timeValue(lesson.scheduled_at) : "14:00");
    setYoutubeUrl(lesson?.youtube_url || "https://www.youtube.com/embed/dQw4w9WgXcQ");
  }

  async function saveLesson() {
    if (!selectedDate) return;
    const accessToken = (session as any)?.accessToken;
    const body = {
      title,
      date: dateKey(selectedDate),
      time: `${time}:00`,
      youtube_embed_url: youtubeUrl
    };

    try {
      const url = selectedLesson
        ? `/api/lessons/${selectedLesson.id}/`
        : `/api/lessons/`;
      const method = selectedLesson ? "PATCH" : "POST";

      await apiFetch(url, {
        method,
        accessToken,
        body: JSON.stringify(body),
      });

      fetchLessons();
      setSelectedDate(null);
    } catch (err) {
      console.error("Failed to save lesson:", err);
    }
  }

  async function deleteLesson() {
    if (!selectedLesson) return;
    const accessToken = (session as any)?.accessToken;
    try {
      await apiFetch(`/api/lessons/${selectedLesson.id}/`, {
        method: "DELETE",
        accessToken,
      });
      fetchLessons();
      setSelectedDate(null);
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Schedule</h1>
          <p className="mt-2 text-gray-400">Manage monthly live lessons.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} className="rounded-2xl border border-gray-800 px-4 py-3 hover:border-[#8B1E2D]">Prev</button>
          <span className="rounded-2xl border border-gray-800 bg-gray-900 px-5 py-3 font-bold">
            {month.toLocaleDateString([], { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} className="rounded-2xl border border-gray-800 px-4 py-3 hover:border-[#8B1E2D]">Next</button>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-800 bg-gray-900 p-4">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="py-2">{day}</div>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {emptyCells.map((cell) => <div key={`empty-${cell}`} className="min-h-24 rounded-2xl border border-transparent" />)}
          {days?.map((day) => {
            const lesson = lessons.find((item) => dateKey(item.scheduled_at) === dateKey(day));
            return (
              <button key={day.toISOString()} onClick={() => openDay(day)} className="min-h-24 rounded-2xl border border-gray-800 bg-gray-950 p-3 text-left hover:border-[#8B1E2D]">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{day.getDate()}</span>
                  {lesson && <span className="h-2.5 w-2.5 rounded-full bg-[#8B1E2D]" />}
                </div>
                {lesson && <p className="mt-3 truncate text-sm text-[#8B1E2D]">{lesson.title}</p>}
              </button>
            );
          })}
        </div>
      </section>

      {selectedDate && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-gray-800 bg-gray-950 p-6 shadow-2xl">
          <button onClick={() => setSelectedDate(null)} className="mb-6 rounded-2xl border border-gray-800 px-4 py-2 hover:border-[#8B1E2D]">Close</button>
          <h2 className="text-2xl font-black">{selectedLesson ? "Edit lesson" : "Add lesson"}</h2>
          <p className="mt-2 text-gray-400">{selectedDate.toDateString()}</p>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-gray-300">Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3 outline-none focus:border-[#8B1E2D]" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-300">Time</span>
              <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3 outline-none focus:border-[#8B1E2D]" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-300">YouTube URL</span>
              <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3 outline-none focus:border-[#8B1E2D]" />
            </label>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={saveLesson} className="flex-1 rounded-2xl bg-[#8B1E2D] px-5 py-3 font-bold text-white hover:bg-[#8B1E2D]">{selectedLesson ? "Save" : "Add"}</button>
            {selectedLesson && <button onClick={deleteLesson} className="rounded-2xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-500">Delete</button>}
          </div>
        </aside>
      )}
    </main>
  );
}
