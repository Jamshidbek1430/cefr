"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

type LibraryItem = {
    id: string;
    title: string;
    file_type: "pdf" | "audio" | "image";
    uploaded_at: string;
    file_url: string;
};

export default function LibraryDetailPage() {
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    const params = useParams<{ id: string }>();
    const [item, setItem] = useState<LibraryItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        if (params?.id && session) {
            fetchItem(params.id);
        }
    }, [params?.id, session]);

    async function fetchItem(id: string) {
        const accessToken = (session as any)?.accessToken;
        if (!accessToken) {
            console.log("No access token available");
            setLoading(false);
            return;
        }

        try {
            const data = await apiFetch(`/api/library/`, { accessToken });
            console.log("Library data:", data);
            let found = null;
            const numId = parseInt(id);
            if (data) {
                if (Array.isArray(data)) {
                    found = data.find((x: any) => x.id === numId || x.id?.toString() === id);
                } else if (data.pdfs) {
                    found = data.pdfs.find((x: any) => x.id === numId || x.id?.toString() === id) ||
                        data.audio.find((x: any) => x.id === numId || x.id?.toString() === id) ||
                        data.images.find((x: any) => x.id === numId || x.id?.toString() === id);
                }
            }
            console.log("Found item:", found);
            console.log("file_url:", found?.file_url);
            setItem(found);
        } catch (err) {
            console.error("Failed to fetch library item:", err);
        } finally {
            setLoading(false);
        }
    }

    if (!mounted || status === "loading") {
        return null;
    }

    if (loading) return <p className="p-10 text-gray-400">Loading document...</p>;
    if (!item) return <p className="p-10 text-gray-400">Document not found.</p>;

    const isTeacherOrAdmin = session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN';

    // For students: use Google Docs viewer (no download button)
    // For teachers/admins: use direct iframe (with download)
    const pdfViewerUrl = item.file_type === "pdf" && item.file_url
        ? (isTeacherOrAdmin 
            ? item.file_url 
            : `https://docs.google.com/viewer?url=${encodeURIComponent(item.file_url)}&embedded=true`)
        : item.file_url;

    return (
        <main className="min-h-screen bg-gray-950 text-white flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Link href="/library" className="inline-flex rounded-2xl border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 hover:border-[#8B1E2D] hover:text-white mb-4">
                        ← Back to Library
                    </Link>
                    <h1 className="text-3xl font-black">{item.title}</h1>
                    <p className="mt-2 text-gray-400">Type: {item.file_type.toUpperCase()} • Uploaded: {new Date(item.uploaded_at).toLocaleDateString()}</p>
                </div>
            </div>

            <section 
                className="min-h-[600px] h-[calc(100vh-200px)] w-full rounded-3xl border border-gray-800 bg-gray-900 p-1 overflow-hidden select-none"
                onContextMenu={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
            >
                {item.file_type === "pdf" ? (
                    item.file_url ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <iframe
                                src={pdfViewerUrl}
                                className="w-full h-full rounded-xl bg-white border-0"
                                title="PDF Viewer"
                            />
                            {/* Block right-click overlay for students */}
                            {!isTeacherOrAdmin && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        zIndex: 1,
                                        pointerEvents: 'none'
                                    }}
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                            )}
                        </div>
                    ) : (
                        <p className="text-red-400 p-4">PDF file URL not available</p>
                    )
                ) : item.file_type === "audio" ? (
                    <div className="w-full h-full flex justify-center items-center bg-black rounded-xl">
                        <audio
                            src={item.file_url}
                            controls
                            controlsList="nodownload"
                            autoPlay
                            className="w-full max-w-md"
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex justify-center items-center bg-black rounded-xl">
                        <img
                            src={item.file_url}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain pointer-events-none select-none"
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                        />
                    </div>
                )}
            </section>
        </main>
    );
}
