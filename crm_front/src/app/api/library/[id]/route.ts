import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBackendUrl } from "@/lib/backend-url";

const BACKEND_URL = getBackendUrl();

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const accessToken = (session as any).accessToken;
    const res = await fetch(`${BACKEND_URL}/api/library/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 204 || res.status === 200) {
      return NextResponse.json({ success: true });
    }

    const errorText = await res.text();
    console.error("Backend delete error:", errorText);
    return new NextResponse(errorText, { status: res.status });
  } catch (error: any) {
    console.error("Error deleting library item:", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
