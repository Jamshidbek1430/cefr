"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Video = {
  id: string;
  title: string;
  created_at: string;
  teacher_name?: string;
};

export default function VideosPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchVideos();
  }, []);

  async function fetchVideos() {
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) return;

    try {
      const data = await apiFetch("/api/videos/", { accessToken });
      const results = Array.isArray(data) ? data : data.results || [];
      setVideos(results);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || status === "loading") {
    return null;
  }

  const role = session?.user?.role;

  function PlayIcon() {
    return (
      <svg viewBox="0 0 24 24" className="h-12 w-12 text-[#14b8a6]" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7L8 5Z" />
      </svg>
    );
  }

  if (loading) return <p className="p-10 text-gray-400">Loading videos...</p>;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Videos</h1>
          <p className="mt-2 text-gray-400">Watch recordings and practice videos.</p>
        </div>
        {(role === "TEACHER" || role === "ADMIN") && (
          <Link href="/videos/upload" className="rounded-2xl bg-[#14b8a6] px-5 py-3 text-center font-bold text-white hover:bg-teal-400">
            Upload Video
          </Link>
        )}
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {videos.length === 0 ? (
          <p className="text-gray-400">No videos found.</p>
        ) : (
          videos?.map((video) => (
            <Link key={video.id} href={`/videos/${video.id}`} className="group rounded-3xl border border-gray-800 bg-gray-900 p-5 transition hover:-translate-y-1 hover:border-[#14b8a6]">
              <div className="flex aspect-video items-center justify-center rounded-2xl bg-gray-950">
                <div className="rounded-full bg-[#14b8a6]/10 p-4 transition group-hover:bg-[#14b8a6]/20">
                  <PlayIcon />
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold">{video.title}</h2>
              <p className="mt-2 text-sm text-gray-400">{video.teacher_name || "Teacher"}</p>
              <p className="mt-1 text-sm text-gray-500">{new Date(video.created_at).toLocaleDateString()}</p>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
