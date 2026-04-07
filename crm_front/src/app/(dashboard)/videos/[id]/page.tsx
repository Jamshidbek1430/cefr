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
      if (data && data.video_url) console.log(data.video_url);
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
  if (loading) return <p className="p-10 text-gray-400">Loading video...</p>;
  if (!video) return <p className="p-10 text-gray-400">Video not found.</p>;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/videos" className="inline-flex rounded-2xl border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 hover:border-[#14b8a6] hover:text-white">
          Back to videos
        </Link>
        {(role === "TEACHER" || role === "ADMIN") && (
          <Link href="/videos/upload" className="inline-flex rounded-2xl bg-[#14b8a6] px-4 py-2 text-sm font-bold text-white hover:bg-teal-400">
            Upload Video
          </Link>
        )}
      </div>

      <section className="mt-6 rounded-3xl border border-gray-800 bg-gray-900 p-6">
        <h1 className="text-3xl font-black">{video.title}</h1>
        <p className="mt-2 text-gray-400">{video.teacher_name || "Teacher"} - {new Date(video.created_at).toLocaleDateString()}</p>
        <div className="mt-6 aspect-video overflow-hidden rounded-3xl border border-gray-800 bg-black">
          {video.video_url?.includes("youtube.com") || video.video_url?.includes("youtu.be") ? (
            <iframe
              src={video.video_url.replace("watch?v=", "embed/")}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video controls>
              <source src={video.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </section>
    </main>
  );
}
