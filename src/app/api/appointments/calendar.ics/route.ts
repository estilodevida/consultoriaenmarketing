import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  renderICSFeed,
  type AppointmentForICS,
} from "@/lib/appointments";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Feed ICS subscriptable.
// URL: /api/appointments/calendar.ics?token=<APPOINTMENTS_ICS_TOKEN>
// El token evita enumeración. Configúralo con APPOINTMENTS_ICS_TOKEN en .env
// (fallback a ADMIN_TOKEN/JWT_SECRET para entornos sin token dedicado).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token =
    url.searchParams.get("token") ||
    req.headers.get("x-ics-token") ||
    "";
  const expected =
    process.env.APPOINTMENTS_ICS_TOKEN ||
    process.env.ADMIN_TOKEN ||
    process.env.JWT_SECRET ||
    "admin123";
  if (token !== expected) {
    return new Response("No autorizado", { status: 401 });
  }

  const sb = supabaseAdmin;
  if (!sb) {
    return new Response("BD no configurada", { status: 500 });
  }

  // Devuelve próximas 100 citas no canceladas + últimas 10 canceladas (para
  // que los clientes suscritos reciban la cancelación del evento).
  const [{ data: upcoming, error: e1 }, { data: cancelled, error: e2 }] =
    await Promise.all([
      sb
        .from("appointments")
        .select(
          "id, ics_uid, lead_name, lead_email, lead_phone, start_at, end_at, timezone, reason, status, source, notes"
        )
        .gte("start_at", new Date().toISOString())
        .neq("status", "cancelled")
        .order("start_at", { ascending: true })
        .limit(100),
      sb
        .from("appointments")
        .select(
          "id, ics_uid, lead_name, lead_email, lead_phone, start_at, end_at, timezone, reason, status, source, notes"
        )
        .eq("status", "cancelled")
        .gte("start_at", new Date(Date.now() - 30 * 86400_000).toISOString())
        .order("start_at", { ascending: false })
        .limit(10),
    ]);

  if (e1 || e2) {
    return new Response("Error leyendo citas", { status: 500 });
  }

  const items: AppointmentForICS[] = [...(upcoming || []), ...(cancelled || [])].map(
    (r) => ({
      id: r.id,
      ics_uid: r.ics_uid,
      lead_name: r.lead_name,
      lead_email: r.lead_email,
      lead_phone: r.lead_phone,
      start_at: r.start_at,
      end_at: r.end_at,
      timezone: r.timezone,
      reason: r.reason,
      status: r.status,
      source: r.source,
      notes: r.notes,
    })
  );

  const ics = renderICSFeed(items, {
    calendarName: "Consultoría en Marketing — Citas chatbot",
    calendarDescription:
      "Citas agendadas por el chatbot de consultoriaenmarketing.com",
    includeCancelled: true,
  });

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
