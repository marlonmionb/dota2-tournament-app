import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = process.env.NEXT_PUBLIC_AXIOM_TOKEN;
  const dataset = process.env.NEXT_PUBLIC_AXIOM_DATASET;

  if (!token || !dataset) {
    return NextResponse.json({}, { status: 200 });
  }

  const body = await req.text();

  const res = await fetch(
    `https://api.axiom.co/v1/datasets/${dataset}/ingest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    }
  );

  return NextResponse.json({}, { status: res.ok ? 200 : res.status });
}
