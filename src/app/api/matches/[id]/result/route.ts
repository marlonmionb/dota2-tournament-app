import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordMatchResult } from "@/services/bracket-service";
import { handleApiError } from "@/lib/api-error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const match = await recordMatchResult(id, session.user.id, body);
    return NextResponse.json(match);
  } catch (error) {
    return handleApiError(error);
  }
}
