"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export function SubmitHomeworkButton({ homeworkId, submitted }: { homeworkId: number, submitted: boolean }) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (submitted) return;

        setLoading(true);
        const accessToken = (session as any)?.accessToken;
        try {
            await apiFetch("/api/homework/submit/", {
                method: "POST",
                accessToken,
                body: JSON.stringify({ homeworkId }),
            });

            toast.success("Homework submitted!");
            router.refresh();
        } catch (error) {
            toast.error("Failed to submit homework.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={submitted ? "secondary" : "default"}
            className="w-full"
            disabled={submitted || loading}
            onClick={handleSubmit}
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : submitted ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : null}
            {submitted ? "Completed" : "Mark as Submitted"}
        </Button>
    );
}
