"use client";
import { useTranslation } from 'react-i18next';
import '@/i18n';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

type Video = {
  id: string;
  title: string;
  created_at: string;
  teacher_name?: string;
  upload_date?: string;
};

export default function VideosPage() {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchVideos();
  }, [session]);

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

  async function handleDeleteVideo(videoId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Bu videoni o'chirmoqchimisiz?")) return;
    
    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        alert("Video o'chirildi!");
        setVideos(prev => prev.filter(v => v.id !== videoId));
      } else {
        const error = await res.text();
        alert("O'chirishda xatolik: " + error);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Xatolik: " + err);
    }
  }

  if (!mounted || status === "loading") {
    return null;
  }

  const role = session?.user?.role;
  const isTeacherOrAdmin = role === "TEACHER" || role === "ADMIN";

  function PlayIcon() {
    return (
      <svg viewBox="0 0 24 24" className="h-12 w-12 text-[#8B1E2D]" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7L8 5Z" />
      </svg>
    );
  }

  if (loading) return <p className="p-10 text-gray-400">Videolar yuklanmoqda...</p>;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Videolar</h1>
          <p className="mt-2 text-gray-400">Dars yozuvlari va mashq videolarini tomosha qiling.</p>
        </div>
        {isTeacherOrAdmin && (
          <Link href="/videos/upload" className="rounded-2xl bg-[#8B1E2D] px-5 py-3 text-center font-bold text-white hover:bg-[#A52335]">
            Video yuklash
          </Link>
        )}
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {videos.length === 0 ? (
          <p className="text-gray-400">Videolar topilmadi.</p>
        ) : (
          videos?.map((video) => (
            <div key={video.id} className="relative group rounded-3xl border border-gray-800 bg-gray-900 overflow-hidden hover:border-[#8B1E2D] transition">
              {isTeacherOrAdmin && (
                <button
                  onClick={(e) => handleDeleteVideo(video.id, e)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100
                             bg-red-600 hover:bg-red-700 text-white rounded-full
                             w-9 h-9 flex items-center justify-center
                             transition-all duration-200 z-10 shadow-lg"
                  title="Videoni o'chirish"
                >
                  ✕
                </button>
              )}
              
              <div 
                className="aspect-video bg-gray-950 flex items-center justify-center cursor-pointer"
                onClick={() => router.push(`/videos/${video.id}`)}
              >
                <div className="rounded-full bg-[#8B1E2D]/10 p-4 transition group-hover:bg-[#8B1E2D]/20">
                  <PlayIcon />
                </div>
              </div>

              <div className="p-5 cursor-pointer" onClick={() => router.push(`/videos/${video.id}`)}>
                <h2 className="text-xl font-bold truncate">{video.title}</h2>
                <p className="mt-2 text-sm text-gray-400">{video.teacher_name || "O'qituvchi"}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(video.upload_date || video.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
