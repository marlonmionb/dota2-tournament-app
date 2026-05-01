import { NextResponse } from "next/server";
import { ZodError } from "zod";

const KNOWN_MESSAGES = new Set([
  "Tournament not found",
  "Forbidden",
  "Registration is not open",
  "Registration is not open for this tournament",
  "Tournament is full",
  "A team with this name is already registered",
  "You have already registered a team for this tournament",
  "Duplicate Steam IDs within the team are not allowed",
  "Tournament is not in draft state",
  "Only draft tournaments can be edited",
  "Registration must be closed before generating the bracket",
  "Bracket has already been generated for this tournament",
  "At least 2 teams are required",
  "Team count must be a power of 2 to generate this bracket",
  "All matches must be completed before closing the tournament",
  "Completed tournaments cannot be deleted",
  "Invalid action",
  "Match not found",
  "Match is already completed",
  "Winner must be one of the match teams",
]);

function statusFor(message: string): number {
  if (message === "Tournament not found" || message === "Match not found") return 404;
  if (message === "Forbidden") return 403;
  return 400;
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.issues },
      { status: 422 }
    );
  }
  if (error instanceof Error) {
    // Steam ID conflict message has variable content but is safe to surface
    if (
      error.message.startsWith("Steam ID") &&
      error.message.includes("already registered in this tournament")
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    const message = KNOWN_MESSAGES.has(error.message)
      ? error.message
      : "Internal server error";
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
