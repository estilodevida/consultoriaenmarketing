import { NextResponse } from "next/server";
import { generateProposal } from "@/lib/proposal-service";

// POST /api/proposals/generate
// Body:
//   { lead_id }                                          -> usa lead existente
//   o { nombre, email, telefono?, empresa?, sector, servicio, zona,
//       precioSetup?, precioMensual?, precioPublicidad?, motivo? }
//
// Auth: X-Internal-Token con INTERNAL_API_TOKEN (mismo patrón que
// /api/appointments POST) o X-Admin-Token con ADMIN_TOKEN.
//
// Devuelve:
//   200 { ok, proposal, crm, n8n, review_required, rate_limited }
//   202 { ok, proposal, review_required: true }         -> pending_review
//   401 { error: "No autorizado" }
//   400 { error: "Faltan campos: ..." }
//   429 { error: "rate_limited" }
export async function POST(req: Request) {
  // 1) Auth
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

  // 2) Body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // 3) Validación mínima
  const errors: string[] = [];
  const nombre = String(body.nombre || body.name || "").trim();
  const email = String(body.email || "").trim();
  const sector = String(body.sector || "").trim();
  const servicio = String(body.servicio || body.service || "").trim();
  const zona = String(body.zona || body.zone || "").trim();

  if (!nombre) errors.push("nombre");
  if (!email || !email.includes("@")) errors.push("email");
  if (!sector) errors.push("sector");
  if (!servicio) errors.push("servicio");
  if (!zona) errors.push("zona");

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "Faltan campos o son inválidos: " + errors.join(", ") },
      { status: 400 }
    );
  }

  // 4) Sanitizar/parsear el resto
  const precioSetup = body.precioSetup != null ? Number(body.precioSetup) : undefined;
  const precioMensual =
    body.precioMensual != null ? Number(body.precioMensual) : undefined;
  if (precioSetup !== undefined && (Number.isNaN(precioSetup) || precioSetup < 0)) {
    return NextResponse.json(
      { error: "precioSetup inválido" },
      { status: 400 }
    );
  }
  if (precioMensual !== undefined && (Number.isNaN(precioMensual) || precioMensual < 0)) {
    return NextResponse.json(
      { error: "precioMensual inválido" },
      { status: 400 }
    );
  }

  // 5) IP para rate-limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // 6) Orquestar
  try {
    const result = await generateProposal(
      {
        lead_id: body.lead_id ? String(body.lead_id) : null,
        nombre,
        email,
        telefono: body.telefono ? String(body.telefono) : null,
        empresa: body.empresa ? String(body.empresa) : null,
        sector,
        servicio,
        zona,
        precioSetup,
        precioMensual,
        precioPublicidad: body.precioPublicidad
          ? String(body.precioPublicidad)
          : undefined,
        motivo: body.motivo ? String(body.motivo) : null,
      },
      { ip, actor: isInternal ? "internal" : "admin" }
    );

    if (result.rate_limited) {
      return NextResponse.json(
        { error: "rate_limited", detail: "Demasiadas solicitudes. Vuelve a probar en un minuto." },
        { status: 429 }
      );
    }

    // 202 = pendiente de revisión humana; 200 = enviado / aprobado
    const status = result.review_required ? 202 : 200;
    return NextResponse.json(
      {
        ok: result.ok,
        proposal_id: result.proposal.id,
        status: result.proposal.status,
        review_required: result.review_required,
        crm: result.crm,
        n8n: result.n8n,
        enlace_llamada: `${process.env.NEXT_PUBLIC_SITE_URL || "https://consultoriaenmarketing.com"}/agendar?lead=${result.proposal.lead_id || ""}&utm_source=propuesta`,
        html_preview: result.proposal.html,
        texto: result.proposal.texto,
      },
      { status }
    );
  } catch (e) {
    console.error("[proposals/generate] error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
