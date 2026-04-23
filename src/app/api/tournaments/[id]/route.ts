import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTournamentByIdPublic, openRegistration, closeRegistration, editTournament, deleteTournament } from "@/services/tournament-service";
import { handleApiError } from "@/lib/api-error";

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
    return handleApiError(error);
  }
}

export async function PUT(
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
    const tournament = await editTournament(id, session.user.id, body);
    return NextResponse.json(tournament);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await getTournamentByIdPublic(id);
    return NextResponse.json(tournament);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await deleteTournament(id, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
