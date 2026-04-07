"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RatingFormProps {
    teacherId: number;
    lastRating?: any;
}

export function RatingForm({ teacherId, lastRating }: RatingFormProps) {
    const [rating, setRating] = useState(lastRating?.stars || 0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState(lastRating?.comment || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/ratings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherId, stars: rating, comment }),
            });

            if (res.ok) {
                toast.success("Thank you for your feedback!");
            } else {
                toast.error("Failed to submit rating.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 pt-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            className={cn(
                                "h-8 w-8 transition-colors",
                                star <= (hover || rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                            )}
                        />
                    </button>
                ))}
            </div>
            <Textarea
                placeholder="Optional comments about your teacher..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
            />
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? "Submitting..." : lastRating ? "Update Rating" : "Submit Rating"}
            </Button>
        </div>
    );
}
