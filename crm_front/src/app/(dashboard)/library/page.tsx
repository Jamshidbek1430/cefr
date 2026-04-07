"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

type LibraryItem = {
  id: string;
  title: string;
  file_type: "pdf" | "audio" | "image";
  uploaded_at: string;
  file_url: string;
};

type LibraryData = {
  pdfs: LibraryItem[];
  audio: LibraryItem[];
  images: LibraryItem[];
};

function FileIcon({ type }: { type: LibraryItem["file_type"] }) {
  if (type === "pdf") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 14h6M9 18h4" />
      </svg>
    );
  }
  if (type === "audio") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-purple-400" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 13v3a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2Z" />
        <path d="M20 13v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5.5-5.5a1 1 0 0 0-1.4 0L8 17" />
    </svg>
  );
}

import { useRouter } from "next/navigation";

function LibrarySection({ title, items }: { title: string; items: LibraryItem[] }) {
  const router = useRouter();
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-800 bg-gray-900 p-6 text-gray-400">No files found.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items?.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/library/${item.id}`)}
              className="text-left rounded-3xl border border-gray-800 bg-gray-900 p-5 transition hover:-translate-y-1 hover:opacity-80 hover:border-[#14b8a6] cursor-pointer"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-950">
                <FileIcon type={item.file_type} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{item.uploaded_at}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [libraryData, setLibraryData] = useState<LibraryData>({ pdfs: [], audio: [], images: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchLibrary();
  }, []);

  async function fetchLibrary() {
    const accessToken = (session as any)?.accessToken;
    if (!accessToken) return;

    try {
      const data = await apiFetch("/api/library/", { accessToken });
      setLibraryData(data);
    } catch (err) {
      console.error("Failed to fetch library:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || status === "loading") {
    return null;
  }

  const role = session?.user?.role;
  const filterByQuery = (list: LibraryItem[]) => list.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  const pdfs = filterByQuery(libraryData.pdfs);
  const audio = filterByQuery(libraryData.audio);
  const images = filterByQuery(libraryData.images);

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = (session as any)?.accessToken;
    const raw = new FormData(event.currentTarget);

    // Build multipart formData (real file upload)
    const formData = new FormData();
    formData.append("title", String(raw.get("title") || ""));
    formData.append("file_type", String(raw.get("file_type") || "pdf"));
    formData.append("type", String(raw.get("file_type") || "pdf"));
    const file = raw.get("file") as File | null;
    if (file && file.size > 0) {
      formData.append("file", file);
    } else {
      const urlField = String(raw.get("file_url") || "").trim();
      if (urlField) formData.append("file_url", urlField);
    }

    try {
      const res = await fetch("http://localhost:8000/api/library/", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      fetchLibrary();
      setUploadOpen(false);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check console.");
    }
  }

  if (loading) return <p className="p-10 text-gray-400">Loading library...</p>;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black">Library</h1>
          <p className="mt-2 text-gray-400">Search class PDFs, audio, and image materials.</p>
        </div>
        {(role === "TEACHER" || role === "ADMIN") && (
          <button onClick={() => setUploadOpen(true)} className="rounded-2xl bg-[#14b8a6] px-5 py-3 font-bold text-white hover:bg-teal-400">
            Upload File
          </button>
        )}
      </div>

      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title..." className="mb-8 w-full max-w-xl rounded-2xl border border-gray-800 bg-gray-900 px-4 py-3 text-white outline-none focus:border-[#14b8a6]" />

      <div className="space-y-8">
        <LibrarySection title="PDFs" items={pdfs} />
        <LibrarySection title="Audio" items={audio} />
        <LibrarySection title="Images" items={images} />
      </div>

      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setUploadOpen(false)}>
          <form onSubmit={submitUpload} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-2xl font-bold">Upload File</h2>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-gray-300">Title</span>
              <input name="title" required className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#14b8a6]" />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-gray-300">File type</span>
              <select name="file_type" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#14b8a6]">
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
                <option value="image">Image</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-gray-300">Upload File</span>
              <input type="file" name="file" accept=".pdf,audio/*,image/*" className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#14b8a6] text-gray-400" />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-gray-300">Or paste URL</span>
              <input name="file_url" placeholder="https://..." className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 outline-none focus:border-[#14b8a6]" />
            </label>
            <button type="submit" className="mt-6 rounded-2xl bg-[#14b8a6] px-6 py-3 font-bold text-white hover:bg-teal-400">Submit</button>
          </form>
        </div>
      )}
    </main>
  );
}
