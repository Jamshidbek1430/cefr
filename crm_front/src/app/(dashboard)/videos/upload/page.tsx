"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function UploadVideoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return null;
  }

  const role = session?.user?.role;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) { alert("Not authenticated."); return; }
    const raw = new FormData(event.currentTarget);

    // Build multipart FormData — do NOT set Content-Type manually
    const formData = new FormData();
    formData.append("title", String(raw.get("title") || ""));
    const videoFile = raw.get("video_file") as File | null;
    if (videoFile && videoFile.size > 0) {
      formData.append("video", videoFile);
    } else {
      const url = String(raw.get("youtube_url") || "").trim();
      if (url) formData.append("video_url", url);
    }

    try {
      const res = await fetch("http://localhost:8000/api/videos/", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.text();
        console.error("Video upload error:", errData);
        alert(`Upload failed: ${res.status}`);
        return;
      }
      setSaved(true);
      setTimeout(() => router.push("/videos"), 2000);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check console for details.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-gray-800 bg-gray-900 p-6">
        <h1 className="text-3xl font-black">Upload Video</h1>
        <p className="mt-2 text-gray-400">Add a new recorded lesson.</p>
        {role === "STUDENT" && <p className="mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-300">Only teachers and admins should upload videos.</p>}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Title</span>
            <input name="title" required className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none focus:border-[#14b8a6]" placeholder="Lesson 12 Recording" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Upload Video File</span>
            <input name="video_file" type="file" accept="video/*" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-gray-400 outline-none focus:border-[#14b8a6]" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Or paste YouTube / Video URL</span>
            <input name="youtube_url" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none focus:border-[#14b8a6]" placeholder="https://www.youtube.com/embed/..." />
          </label>
          <button type="submit" className="rounded-2xl bg-[#14b8a6] px-6 py-3 font-bold text-white hover:bg-teal-400">Submit</button>
        </form>

        {saved && <p className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">Video saved.</p>}
      </section>
    </main>
  );
}
