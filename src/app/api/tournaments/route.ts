import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTournament } from "@/services/tournament-service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const tournament = await createTournament(session.user.id, body, session.user.role);
    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
