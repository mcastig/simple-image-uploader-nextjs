import { getImage } from "@/backend/services/imageService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const result = await getImage(filename);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return new Response(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
    },
  });
}
