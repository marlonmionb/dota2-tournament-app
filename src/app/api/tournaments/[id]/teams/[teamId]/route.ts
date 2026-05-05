import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { editTeam } from "@/services/team-service";
import { handleApiError } from "@/lib/api-error";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, teamId } = await params;
    const body = await request.json();
    const team = await editTeam(id, teamId, session.user.id, body);
    return NextResponse.json(team);
  } catch (error) {
    return handleApiError(error);
  }
}
