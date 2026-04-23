import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const SECRET = process.env.NEXTAUTH_SECRET || "artur-turkce-fallback-secret-key-2024";

export async function GET(req: NextRequest) {
  try {
    let token = await getToken({ req, secret: SECRET, secureCookie: true });

    if (!token) {
      token = await getToken({ req, secret: SECRET, secureCookie: false });
    }

    if (!token) {
      console.error("[/api/users] No token found with either cookie");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return handleUsers(req, token);

  } catch (error: any) {
    console.error("[/api/users] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleUsers(req: NextRequest, token: any) {
  const accessToken = token.accessToken as string;
  if (!accessToken) {
    console.error("[/api/users] No accessToken in token, keys:", Object.keys(token));
    return new NextResponse("No access token", { status: 401 });
  }

  console.log("[/api/users] Token found! role:", token.role);

  const { searchParams } = new URL(req.url);
  const apiUrl = process.env.API_URL || "http://localhost:8000";
  const url = `${apiUrl}/api/users/?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[/api/users] Django error:", response.status, err);
    return NextResponse.json({ error: err }, { status: response.status });
  }

  const django = await response.json();
  const list = django.results || django || [];

  const users = list.map((u: any) => ({
    id: u.id,
    name: u.full_name || u.username || u.first_name || u.email?.split("@")[0] || "Unknown",
    email: u.email || u.phone_number || "-",
    image: u.photo || null,
    role: u.role === "admin" || u.role === "branch_admin" ? "ADMIN"
        : u.role === "teacher" ? "TEACHER" : "STUDENT",
  }));

  console.log(`[/api/users] Returning ${users.length} users`);
  return NextResponse.json(users);
}
