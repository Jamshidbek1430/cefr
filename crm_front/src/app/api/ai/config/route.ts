import { NextResponse } from "next/server";
import { isAIEnabled } from "@/lib/openai";

export async function GET() {
    return NextResponse.json({
        enabled: isAIEnabled(),
    });
}
