import { NextResponse } from "next/server";
import { fetchPlayerProfile } from "@/lib/steam";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  const id = parseInt(accountId, 10);

  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid account ID" }, { status: 400 });
  }

  try {
    const profile = await fetchPlayerProfile(id);
    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch player profile" },
      { status: 502 }
    );
  }
}
