"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

type Video = {
  id: string;
  title: string;
  created_at: string;
  teacher_name?: string;
  video_url?: string;
  upload_date?: string;
};

export default function VideoDetailPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const params = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (params?.id) {
      fetchVideo(params.id);
    }
  }, [params?.id]);

  async function fetchVideo(id: string) {
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) return;

    try {
      const data = await apiFetch(`/api/videos/${id}/`, { accessToken });
      setVideo(data);
      console.log("VIDEO DATA:", data);
    } catch (err) {
      console.error("Failed to fetch video:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || status === "loading") {
    return null;
  }

  const role = session?.user?.role;
  const isStudent = role === "STUDENT";

  if (loading)
    return <p className="p-10 text-gray-400">Loading video...</p>;

  if (!video)
    return <p className="p-10 text-gray-400">Video not found.</p>;

  const videoDate = video.upload_date || video.created_at;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/videos"
          className="inline-flex rounded-2xl border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 hover:border-[#8B1E2D] hover:text-white"
        >
          ← Videolarga qaytish
        </Link>

        {(role === "TEACHER" || role === "ADMIN") && (
          <Link
            href="/videos/upload"
            className="inline-flex rounded-2xl bg-[#8B1E2D] px-4 py-2 text-sm font-bold text-white hover:bg-[#A52335]"
          >
            Video yuklash
          </Link>
        )}
      </div>

      <section className="mt-6 rounded-3xl border border-gray-800 bg-gray-900 p-6">
        <h1 className="text-3xl font-black">{video.title}</h1>

        <p className="mt-2 text-gray-400">
          {video.teacher_name || "O'qituvchi"} -{" "}
          {videoDate ? new Date(videoDate).toLocaleDateString() : "Sana yo'q"}
        </p>

        <div 
          className="mt-6 aspect-video overflow-hidden rounded-3xl border border-gray-800 bg-black relative"
          onContextMenu={(e) => isStudent && e.preventDefault()}
        >
          {video.video_url ? (
            video.video_url.includes("youtube.com") ||
            video.video_url.includes("youtu.be") ||
            video.video_url.includes("vdo.ninja") ? (
              <iframe
                src={video.video_url.replace("watch?v=", "embed/")}
                title={video.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={video.video_url}
                src={video.video_url}
                controls
                controlsList={isStudent ? "nodownload" : undefined}
                className="h-full w-full"
                onContextMenu={(e) => isStudent && e.preventDefault()}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Video mavjud emas
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
