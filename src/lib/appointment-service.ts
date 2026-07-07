// Lógica de detección de intenciones de cita y orquestación del flujo post-cita.
// CON-181: chatbot → appointments → n8n (CRM + email + Google Calendar).

import { supabaseAdmin } from "@/lib/supabase-admin";
import { stableUID } from "@/lib/appointments";

export type ExtractedAppointment = {
  lead_name: string;
  lead_email?: string | null;
  lead_phone?: string | null;
  start_at: string; // ISO 8601
  duration_minutes?: number;
  timezone: string;
  reason?: string | null;
  raw_extraction?: Record<string, unknown> | null;
};

export type PersistedAppointment = {
  id: string;
  lead_id: string | null;
  lead_name: string;
  lead_email: string | null;
  lead_phone: string | null;
  start_at: string;
  end_at: string;
  timezone: string;
  reason: string | null;
  status: string;
  source: string;
  ics_uid: string;
  raw_extraction: Record<string, unknown> | null;
  created_at: string;
};

const DEFAULT_DURATION_MINUTES = 30;

function computeEndAt(startAt: string, durationMin?: number): string {
  const dur = Math.max(5, Math.min(480, Number(durationMin) || DEFAULT_DURATION_MINUTES));
  const d = new Date(startAt);
  if (isNaN(d.getTime())) {
    throw new Error(`start_at inválido: ${startAt}`);
  }
  return new Date(d.getTime() + dur * 60_000).toISOString();
}

/**
 * Busca o crea un lead y devuelve su id.
 * Recibe el contexto del chat (lead informado en la UI del chatbot).
 */
async function resolveLeadId(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string;
}): Promise<string | null> {
  const sb = supabaseAdmin;
  if (!sb) return null;
  const name = (input.name || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const phone = (input.phone || "").trim();
  if (!name) return null;

  // 1) Lookup por email o teléfono
  let existing: { id: string } | null = null;
  if (email) {
    const r = await sb
      .from("leads")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (r.data) existing = r.data;
  }
  if (!existing && phone) {
    const r = await sb
      .from("leads")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (r.data) existing = r.data;
  }

  if (existing) {
    // Refresca datos si faltaban
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (email) patch.email = email;
    if (phone) patch.phone = phone;
    await sb.from("leads").update(patch).eq("id", existing.id);
    return existing.id;
  }

  // 2) Crea lead nuevo
  const insert = await sb
    .from("leads")
    .insert({
      name,
      email: email || null,
      phone: phone || null,
      source: input.source || "chatbot_appointment",
      metadata: {},
    })
    .select("id")
    .single();
  return insert.data?.id ?? null;
}

/**
 * Persiste la cita y devuelve el registro creado.
 * Lanza error si los datos no son válidos.
 */
export async function persistAppointment(
  appt: ExtractedAppointment,
  opts: { source?: string } = {}
): Promise<PersistedAppointment> {
  const sb = supabaseAdmin;
  if (!sb) throw new Error("Supabase admin no configurado");

  const startAt = new Date(appt.start_at).toISOString();
  if (isNaN(new Date(startAt).getTime())) {
    throw new Error(`start_at inválido: ${appt.start_at}`);
  }
  const endAt = computeEndAt(startAt, appt.duration_minutes);

  const leadId = await resolveLeadId({
    name: appt.lead_name,
    email: appt.lead_email,
    phone: appt.lead_phone,
    source: opts.source,
  });

  const insert = await sb
    .from("appointments")
    .insert({
      lead_id: leadId,
      lead_name: appt.lead_name.trim(),
      lead_email: appt.lead_email?.trim() || null,
      lead_phone: appt.lead_phone?.trim() || null,
      start_at: startAt,
      end_at: endAt,
      timezone: appt.timezone || "Europe/Madrid",
      reason: appt.reason?.trim() || null,
      status: "confirmed",
      source: opts.source || "chatbot",
      raw_extraction: appt.raw_extraction || null,
      ics_uid: null, // se fija abajo
    })
    .select("*")
    .single();

  if (insert.error || !insert.data) {
    throw new Error(`No se pudo persistir la cita: ${insert.error?.message || "unknown"}`);
  }

  const row = insert.data as PersistedAppointment;
  // Fija el ics_uid estable derivado del id
  const ics_uid = stableUID(row.id);
  await sb.from("appointments").update({ ics_uid }).eq("id", row.id);
  row.ics_uid = ics_uid;
  return row;
}

/**
 * Dispara el webhook a n8n para orquestar CRM/email/calendar.
 * No lanza: si falla, la cita ya quedó persistida y se reintentará vía BD.
 */
export async function notifyAppointmentWebhook(
  appt: PersistedAppointment
): Promise<{ ok: boolean; status?: number; detail?: string }> {
  const url = process.env.N8N_APPOINTMENT_WEBHOOK_URL;
  const token = process.env.N8N_APPOINTMENT_WEBHOOK_TOKEN;
  if (!url) {
    return { ok: false, detail: "N8N_APPOINTMENT_WEBHOOK_URL no configurado" };
  }

  const payload = {
    event: "appointment.created",
    fired_at: new Date().toISOString(),
    appointment: {
      id: appt.id,
      ics_uid: appt.ics_uid,
      lead_id: appt.lead_id,
      lead_name: appt.lead_name,
      lead_email: appt.lead_email,
      lead_phone: appt.lead_phone,
      start_at: appt.start_at,
      end_at: appt.end_at,
      timezone: appt.timezone,
      reason: appt.reason,
      status: appt.status,
      source: appt.source,
      raw_extraction: appt.raw_extraction,
    },
    crm: {
      base_url: process.env.TWENTY_CRM_BASE_URL || "https://crm.cl1.nl",
    },
    site: {
      name: "Consultoría en Marketing",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://consultoriaenmarketing.com",
      admin_email:
        process.env.ADMIN_EMAIL || "admin@consultoriaenmarketing.com",
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["X-Webhook-Token"] = token;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const detail = `n8n webhook ${res.status}: ${await res.text().catch(() => "")}`.slice(0, 500);
      console.warn("[appointments] webhook no ok:", detail);
      return { ok: false, status: res.status, detail };
    }
    return { ok: true, status: res.status };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[appointments] webhook error:", msg);
    return { ok: false, detail: msg };
  }
}
