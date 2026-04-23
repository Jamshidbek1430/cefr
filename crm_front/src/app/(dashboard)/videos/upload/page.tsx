"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UploadVideoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setLoading(true);
    setError("");
    
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) { 
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    
    const raw = new FormData(event.currentTarget);
    const formData = new FormData();
    
    const title = String(raw.get("title") || "").trim();
    if (!title) {
      setError("Title is required");
      setLoading(false);
      return;
    }
    formData.append("title", title);
    
    const videoFile = raw.get("video_file") as File | null;
    const youtubeUrl = String(raw.get("youtube_url") || "").trim();
    
    if (videoFile && videoFile.size > 0) {
      console.log("Uploading file:", videoFile.name, videoFile.size, "bytes");
      formData.append("file", videoFile);
    } else if (youtubeUrl) {
      console.log("Uploading URL:", youtubeUrl);
      formData.append("video_url", youtubeUrl);
    } else {
      setError("Please select a file or enter a URL");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending request to /api/videos...");
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      
      const responseText = await res.text();
      console.log("Response status:", res.status);
      console.log("Response body:", responseText);
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/videos"), 2000);
      } else {
        setError(`Upload failed (${res.status}): ${responseText}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Upload failed: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-gray-800 bg-gray-900 p-6">
        <h1 className="text-3xl font-black">Upload Video</h1>
        <p className="mt-2 text-gray-400">Add a new recorded lesson.</p>
        {role === "STUDENT" && (
          <p className="mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-300">
            Only teachers and admins should upload videos.
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Title</span>
            <input 
              name="title" 
              required 
              disabled={loading}
              className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none focus:border-[#8B1E2D] disabled:opacity-50" 
              placeholder="Lesson 12 Recording" 
            />
          </label>
          
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Upload Video File</span>
            <input 
              name="video_file" 
              type="file" 
              accept="video/*"
              disabled={loading}
              className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-gray-400 outline-none focus:border-[#8B1E2D] disabled:opacity-50" 
            />
          </label>
          
          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Or paste YouTube / Video URL</span>
            <input 
              name="youtube_url"
              disabled={loading}
              className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none focus:border-[#8B1E2D] disabled:opacity-50" 
              placeholder="https://www.youtube.com/embed/..." 
            />
          </label>
          
          <button 
            type="submit" 
            disabled={loading}
            className="rounded-2xl bg-[#8B1E2D] px-6 py-3 font-bold text-white hover:bg-[#A52335] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Submit"}
          </button>
        </form>

        {error && (
          <p className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        )}
        
        {saved && (
          <p className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-300">
            Video saved! Redirecting...
          </p>
        )}
      </section>
    </main>
  );
}
