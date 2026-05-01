import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openRegistration } from "@/services/tournament-service";
import { handleApiError } from "@/lib/api-error";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const tournament = await openRegistration(id, session.user.id);
    return NextResponse.json(tournament);
  } catch (error) {
    return handleApiError(error);
  }
}
