"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquarePlus, History, User } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StudentNotesDialogProps {
    student: { id: number; name: string };
}

export function StudentNotesDialog({ student }: StudentNotesDialogProps) {
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/student-notes?studentId=${student.id}`);
            if (res.ok) {
                setNotes(await res.json());
            }
        } catch (error) {
            toast.error("Failed to load notes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchNotes();
    }, [open]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/student-notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: student.id, content: newNote }),
            });
            if (res.ok) {
                toast.success("Note added!");
                setNewNote("");
                fetchNotes();
            } else {
                toast.error("Failed to save note.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    Notes
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Notes for {student.name}
                    </DialogTitle>
                    <DialogDescription>
                        Private feedback and performance tracking for this student.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Add a new private note about this student..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="min-h-[100px] resize-none"
                        />
                        <Button
                            onClick={handleAddNote}
                            disabled={submitting || !newNote.trim()}
                            className="w-full"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquarePlus className="h-4 w-4 mr-2" />}
                            Save Private Note
                        </Button>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold mb-3">Previous Notes</h4>
                        <ScrollArea className="h-[200px]">
                            {loading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : notes.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-8">No notes recorded yet.</p>
                            ) : (
                                <div className="space-y-3 pr-4">
                                    {notes.map((note) => (
                                        <div key={note.id} className="p-3 rounded-lg bg-muted/40 border text-sm space-y-1">
                                            <p className="whitespace-pre-wrap">{note.content}</p>
                                            <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                                                <span>By {note.teacher?.name || "System"}</span>
                                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
