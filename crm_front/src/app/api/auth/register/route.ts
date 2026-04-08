import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const djangoApiUrl = getBackendUrl();

        const res = await fetch(`${djangoApiUrl}/api/auth/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                full_name: body.full_name,
                telegram_username: body.telegram_username,
                verification_code: body.verification_code,
                password: body.password,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { detail: "Internal server error during registration." },
            { status: 500 }
        );
    }
}
