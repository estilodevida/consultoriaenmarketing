import { NextResponse } from "next/server";
import { rejectProposal } from "@/lib/proposal-service";

// POST /api/proposals/[id]/reject
// Body: { actor: "nombre", motivo: "razón" }
export async function POST(
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

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const actor = String(body.actor || (isInternal ? "internal" : "admin"));
  const motivo = String(body.motivo || "").trim();
  if (!motivo) {
    return NextResponse.json(
      { error: "motivo requerido" },
      { status: 400 }
    );
  }

  const r = await rejectProposal(params.id, actor, motivo);
  if (!r.ok) {
    return NextResponse.json({ error: r.motivo || "Error" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, proposal: r.propuesta });
}
