import { NextResponse } from "next/server";
import { getProposal } from "@/lib/proposal-service";

// GET /api/proposals/[id]
// Auth: X-Admin-Token / X-Internal-Token (igual que generate)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const token =
    req.headers.get("x-internal-token") ||
    req.headers.get("x-admin-token") ||
    url.searchParams.get("token") ||
    "";
  const expectedAdmin = process.env.ADMIN_TOKEN || process.env.JWT_SECRET || "admin123";
  const expectedInternal = process.env.INTERNAL_API_TOKEN;
  const isInternal = expectedInternal && token === expectedInternal;
  if (!isInternal && token !== expectedAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const proposal = await getProposal(params.id);
  if (!proposal) {
    return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ proposal });
}
