import { NextResponse } from "next/server";
import {
  approveProposal,
  generateProposal,
  getProposal,
} from "@/lib/proposal-service";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST /api/proposals/[id]/approve
// Body: { actor: "nombre_o_email" }
// Aprueba una propuesta en estado pending_review/draft/rejected y dispara
// el envío (Twenty + n8n).
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
    // body opcional
  }
  const actor = String(body.actor || (isInternal ? "internal" : "admin"));

  const current = await getProposal(params.id);
  if (!current) {
    return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
  }

  const r = await approveProposal(params.id, actor);
  if (!r.ok || !r.proposal) {
    return NextResponse.json({ error: r.motivo || "Error" }, { status: 400 });
  }

  // Tras aprobar, leer el lead y disparar el flujo completo de envío
  // (CRM + n8n) usando la misma función que /generate.
  const sb = supabaseAdmin;
  if (!sb || !current.lead_id) {
    return NextResponse.json({
      ok: true,
      proposal: r.proposal,
      detail: "Aprobada sin envío: no hay lead asociado o Supabase no configurado",
    });
  }
  const leadR = await sb
    .from("leads")
    .select("id, name, email, phone, metadata, stage")
    .eq("id", current.lead_id)
    .maybeSingle();
  if (!leadR.data) {
    return NextResponse.json({
      ok: true,
      proposal: r.proposal,
      detail: "Aprobada sin envío: lead borrado",
    });
  }
  const lead = leadR.data;
  const meta = (lead.metadata || {}) as Record<string, unknown>;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "admin-approve";

  const sent = await generateProposal(
    {
      lead_id: lead.id,
      nombre: lead.name || "cliente",
      email: lead.email || "sin-email@consultoriaenmarketing.com",
      telefono: lead.phone,
      sector: (meta.sector as string) || current.sector,
      servicio: (meta.servicio as string) || current.servicio,
      zona: (meta.zona as string) || current.zona,
      precioSetup: Number(current.precio_setup),
      precioMensual: Number(current.precio_mensual),
      precioPublicidad: current.precio_publicidad || undefined,
      motivo: (meta.motivo as string) || null,
    },
    { ip, actor }
  );

  return NextResponse.json({
    ok: true,
    proposal: sent.proposal,
    crm: sent.crm,
    n8n: sent.n8n,
    rate_limited: sent.rate_limited,
  });
}
