import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { fileTypeFromBuffer } from "file-type";

const BUCKET = "team-logos";
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const session = await auth();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File must be smaller than 2 MB" },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  const detected = await fileTypeFromBuffer(buf);

  if (!detected || !ALLOWED_MIME_EXTENSIONS[detected.mime]) {
    return NextResponse.json(
      { error: "Invalid image file. Only JPEG, PNG, and WebP are allowed" },
      { status: 400 }
    );
  }

  const ext = ALLOWED_MIME_EXTENSIONS[detected.mime];
  const ownerSegment = session?.user?.id ?? "anonymous";
  // Use owner segment + timestamp + random suffix to avoid collisions.
  const path = `${ownerSegment}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buf, {
      contentType: detected.mime,
      upsert: false,
    });

  if (error) {
    console.error("Supabase storage upload error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
