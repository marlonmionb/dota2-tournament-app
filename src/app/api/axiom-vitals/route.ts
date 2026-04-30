import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = process.env.NEXT_PUBLIC_AXIOM_TOKEN;
  const dataset = process.env.NEXT_PUBLIC_AXIOM_DATASET;

  if (!token || !dataset) {
    console.warn("[axiom-vitals] Token ou dataset não configurado");
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

  if (!res.ok) {
    const err = await res.text();
    console.error(`[axiom-vitals] Axiom retornou ${res.status}: ${err}`);
  } else {
    console.log(`[axiom-vitals] Enviado com sucesso (${res.status})`);
  }

  return NextResponse.json({}, { status: 200 });
}
