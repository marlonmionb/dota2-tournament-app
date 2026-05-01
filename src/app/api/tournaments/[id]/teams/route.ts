import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { registerTeam, getPublicTeams } from "@/services/team-service";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teams = await getPublicTeams(id);
    return NextResponse.json(teams);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const team = await registerTeam(id, body, session.user.id);
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
