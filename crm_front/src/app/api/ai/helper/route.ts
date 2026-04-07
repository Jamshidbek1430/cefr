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
        const { message, context } = body;

        const openai = getOpenAI();
        if (!openai) {
            return NextResponse.json({
                response: "Hello! I'm your AI assistant. AI features are currently in demo mode. Please configure your OpenAI API key for full assistance."
            });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant for Universe School, an educational center. Help students and teachers with their questions regarding the platform and English learning. Context: " + JSON.stringify(context || {})
                },
                { role: "user", content: message }
            ],
            max_tokens: 500,
        });

        const aiResponse = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
        return NextResponse.json({ response: aiResponse });

    } catch (error: any) {
        console.error("Error in AI helper:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
