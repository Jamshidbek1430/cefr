"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Redo, Undo, Save, Globe } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ReportEditor() {
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write your professional report here...',
            }),
            Highlight,
            Typography,
        ],
        immediatelyRender: false,
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[400px] p-4 font-medium leading-relaxed max-w-none',
            },
        },
    });

    const handleSave = async () => {
        if (!editor || !title.trim()) {
            toast.error("Please provide a title and report content.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content: editor.getHTML(),
                }),
            });

            if (res.ok) {
                toast.success("Report saved successfully!");
                setTitle('');
                editor.commands.setContent('');
                router.refresh();
            } else {
                toast.error("Failed to save report.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!editor) return null;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                <input
                    type="text"
                    placeholder="Report Title (e.g., Q1 Performance Review)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-2xl font-black tracking-tight border-none focus:outline-none placeholder:text-muted-foreground/30 mb-6"
                />

                <div className="flex flex-wrap gap-1 p-2 bg-muted/40 rounded-2xl border border-white/5 mb-4 items-center">
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'bg-primary/20 text-primary' : ''}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'bg-primary/20 text-primary' : ''}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'bg-primary/20 text-primary' : ''}
                    >
                        <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : ''}
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : ''}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : ''}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                    <EditorContent editor={editor} />
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest gap-2 bg-primary shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        {isSaving ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Archiving Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
