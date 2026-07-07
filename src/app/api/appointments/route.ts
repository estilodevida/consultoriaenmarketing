import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Lista citas. Requiere token admin (Header X-Admin-Token o query ?token=).
// Por defecto devuelve las próximas 50 citas no canceladas.
export async function GET(req: Request) {
  const token =
    req.headers.get("x-admin-token") ||
    new URL(req.url).searchParams.get("token") ||
    "";
  const expected = process.env.ADMIN_TOKEN || process.env.JWT_SECRET || "admin123";
  if (token !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sb = supabaseAdmin;
  if (!sb) {
    return NextResponse.json({ error: "BD no configurada" }, { status: 500 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from") || new Date().toISOString();
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 500);
  const includeCancelled =
    url.searchParams.get("all") === "1" ||
    url.searchParams.get("include_cancelled") === "1";

  let query = sb
    .from("appointments")
    .select(
      "id, lead_id, lead_name, lead_email, lead_phone, start_at, end_at, timezone, reason, status, source, crm_person_id, crm_activity_id, calendar_event_id, ics_uid, notes, created_at, updated_at"
    )
    .order("start_at", { ascending: true })
    .limit(limit);

  if (!includeCancelled) {
    query = query.neq("status", "cancelled").gte("start_at", from);
  } else {
    query = query.gte("start_at", from);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ appointments: data || [] });
}

// Crea manualmente una cita (admin o webhook interno). Útil para forzar
// el flujo n8n desde el panel o desde tests.
export async function POST(req: Request) {
  const token =
    req.headers.get("x-admin-token") ||
    new URL(req.url).searchParams.get("token") ||
    "";
  const expected = process.env.ADMIN_TOKEN || process.env.JWT_SECRET || "admin123";
  // Si viene del webhook interno del propio site, no requiere token admin
  const internalToken = process.env.INTERNAL_API_TOKEN;
  const isInternal = internalToken && req.headers.get("x-internal-token") === internalToken;
  if (!isInternal && token !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const sb = supabaseAdmin;
  if (!sb) {
    return NextResponse.json({ error: "BD no configurada" }, { status: 500 });
  }

  const startAt = body.start_at ? new Date(body.start_at as string).toISOString() : null;
  if (!startAt || isNaN(new Date(startAt).getTime())) {
    return NextResponse.json({ error: "start_at inválido" }, { status: 400 });
  }
  const dur = Math.max(5, Math.min(480, Number(body.duration_minutes || 30)));
  const endAt = new Date(new Date(startAt).getTime() + dur * 60_000).toISOString();

  const insert = await sb
    .from("appointments")
    .insert({
      lead_name: String(body.lead_name || "").trim(),
      lead_email: body.lead_email ? String(body.lead_email) : null,
      lead_phone: body.lead_phone ? String(body.lead_phone) : null,
      start_at: startAt,
      end_at: endAt,
      timezone: String(body.timezone || "Europe/Madrid"),
      reason: body.reason ? String(body.reason) : null,
      status: "confirmed",
      source: String(body.source || "admin"),
    })
    .select("*")
    .single();

  if (insert.error || !insert.data) {
    return NextResponse.json(
      { error: insert.error?.message || "No se pudo crear la cita" },
      { status: 500 }
    );
  }

  return NextResponse.json({ appointment: insert.data }, { status: 201 });
}
