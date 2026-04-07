import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { text, type } = body;

        if (!text) {
            return new NextResponse("Text is required", { status: 400 });
        }

        const systemPrompt = type === "speaking"
            ? "You are an AI English tutor. The user has spoken a sentence. Analyze their transcribed speech. Correct any grammar or vocabulary errors. Provide a clear, encouraging explanation. Output your response focusing on constructive feedback."
            : "You are an AI writing assistant. Review the student's text for grammar, style, and clarity. Point out errors and suggest improvements in a friendly educational tone. Provide the corrected version if necessary.";

        const openai = getOpenAI();
        if (!openai) {
            // Graceful fallback message if OpenAI is not configured
            return NextResponse.json({
                feedback: "AI features are currently in demo mode. Please configure OPENAI_API_KEY to see real analysis. Your text was: " + text.substring(0, 50) + "..."
            });
        }

        let response;
        try {
            response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                max_tokens: 300,
            });
        } catch (apiError: any) {
            console.error('OpenAI API error:', apiError);
            return new NextResponse("AI service error – please try again later.", { status: 502 });
        }

        const aiFeedback = response.choices[0]?.message?.content || "No feedback generated.";

        // Note: AIUsageLog logging moved to backend scope; skipped here to prevent Prisma errors.
        return NextResponse.json({ feedback: aiFeedback });

    } catch (error: any) {
        console.error(`Error in analyze-text:`, error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
