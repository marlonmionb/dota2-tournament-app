import { NextResponse } from "next/server";
import { createUser } from "@/services/auth-service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}