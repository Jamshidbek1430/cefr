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
        if (params?.id) {
            fetchItem(params.id);
        }
    }, [params?.id]);

    async function fetchItem(id: string) {
        const accessToken = (session as any)?.accessToken;
        if (!accessToken) return;

        try {
            // Assuming GET /api/library/{id}/ works or we fetch all and filter
            const data = await apiFetch(`/api/library/`, { accessToken });
            let found = null;
            if (data) {
                if (Array.isArray(data)) found = data.find((x: any) => x.id.toString() === id);
                else if (data.pdfs) {
                    found = data.pdfs.find((x: any) => x.id.toString() === id) ||
                        data.audio.find((x: any) => x.id.toString() === id) ||
                        data.images.find((x: any) => x.id.toString() === id);
                }
            }
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

    return (
        <main className="min-h-screen bg-gray-950 text-white flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Link href="/library" className="inline-flex rounded-2xl border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 hover:border-[#14b8a6] hover:text-white mb-4">
                        ← Back to Library
                    </Link>
                    <h1 className="text-3xl font-black">{item.title}</h1>
                    <p className="mt-2 text-gray-400">Type: {item.file_type.toUpperCase()} • Uploaded: {new Date(item.uploaded_at).toLocaleDateString()}</p>
                </div>
            </div>

            <section className="flex-1 w-full rounded-3xl border border-gray-800 bg-gray-900 p-2 md:p-6 overflow-hidden flex flex-col items-center justify-center">
                {item.file_type === "pdf" ? (
                    <iframe
                        src={`${item.file_url}#toolbar=0&navpanes=0`}
                        className="h-full w-full rounded-xl bg-white"
                        onContextMenu={(e) => e.preventDefault()}
                    />
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
