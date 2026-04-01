import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTournamentById, openRegistration, closeRegistration } from "@/services/tournament-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { action } = await request.json();
    if (action === "open") {
      const tournament = await openRegistration(id, session.user.id);
      return NextResponse.json(tournament);
    }
    if (action === "close") {
      const tournament = await closeRegistration(id, session.user.id);
      return NextResponse.json(tournament);
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Tournament not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await getTournamentById(id);
    return NextResponse.json(tournament);
  } catch (error) {
    if (error instanceof Error && error.message === "Tournament not found") {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
