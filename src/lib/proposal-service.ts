// Orquestación del flujo de propuestas (CON-191).
// Responsabilidades:
//   1. Generar / upsert de lead en Supabase con stage y qualified_at
//   2. Renderizar la propuesta con la plantilla del Sistema de Captación
//   3. Persistir la propuesta (Supabase `proposals`) con snapshot de params
//   4. Sincronizar con Twenty CRM (person + opportunity + note)
//   5. Disparar n8n (workflow proposal-auto) para enviar el email
//   6. Rate-limit in-memory + revisión humana opcional
//
// Diseñado para que cuando CON-190 cierre (cert + API key + workflow
// chatbot-cita-v2 reactivado), CON-191 funcione sin más cambios: basta
// con activar el workflow n8n proposal-auto y tener TWENTY_API_KEY.

import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  precioCaptacionDefault,
  renderPropuestaCaptacion,
  type ProposalInput,
} from "@/lib/proposal-template";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://consultoriaenmarketing.com";

const LEAD_STAGES = [
  "nuevo",
  "contactado",
  "calificado",
  "propuesta",
  "negociacion",
  "ganado",
  "perdido",
] as const;
type LeadStage = (typeof LEAD_STAGES)[number];

export type ProposalStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "sent"
  | "rejected"
  | "failed"
  | "expired";

export interface GenerateProposalInput {
  // Bien lead_id (si ya existe) o datos de contacto + parámetros
  lead_id?: string | null;
  nombre: string;
  email: string;
  telefono?: string | null;
  empresa?: string | null;
  sector: string;
  servicio: string;
  zona: string;
  precioSetup?: number;
  precioMensual?: number;
  precioPublicidad?: string;
  motivo?: string | null;
  // Si se quiere forzar a un lead ya conocido como "calificado" pero el
  // caller no quiere pasar por el flujo del CRM
  forceStage?: LeadStage;
  metadata?: Record<string, unknown>;
}

export interface ProposalRow {
  id: string;
  lead_id: string | null;
  status: ProposalStatus;
  html: string;
  texto: string;
  sector: string;
  servicio: string;
  zona: string;
  precio_setup: number;
  precio_mensual: number;
  precio_publicidad: string | null;
  crm_person_id: string | null;
  crm_opportunity_id: string | null;
  crm_note_id: string | null;
  email_message_id: string | null;
  sent_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
}

export interface GenerateProposalResult {
  ok: boolean;
  proposal: ProposalRow;
  crm: {
    attempted: boolean;
    person_id?: string | null;
    opportunity_id?: string | null;
    note_id?: string | null;
    motivo?: string;
  };
  n8n: {
    attempted: boolean;
    triggered: boolean;
    motivo?: string;
  };
  review_required: boolean;
  rate_limited: boolean;
}

// ---------------------------------------------------------------------------
// Rate-limit in-memory (5 req / minuto / IP). Suficiente para la fase actual;
// cuando se escale se sustituye por Redis. Reset al reiniciar el proceso.
// ---------------------------------------------------------------------------
const RATE_BUCKET_MS = 60_000;
const RATE_MAX = Number(process.env.PROPOSAL_RATE_LIMIT_PER_MIN || "5");
const rateBucket = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const slot = rateBucket.get(ip);
  if (!slot || now > slot.resetAt) {
    rateBucket.set(ip, { count: 1, resetAt: now + RATE_BUCKET_MS });
    return { allowed: true, remaining: RATE_MAX - 1 };
  }
  if (slot.count >= RATE_MAX) {
    return { allowed: false, remaining: 0 };
  }
  slot.count += 1;
  return { allowed: true, remaining: RATE_MAX - slot.count };
}

// ---------------------------------------------------------------------------
// Lead upsert + stage management
// ---------------------------------------------------------------------------
async function upsertLead(
  input: GenerateProposalInput
): Promise<{ id: string; created: boolean; stage: LeadStage }> {
  const sb = supabaseAdmin;
  if (!sb) throw new Error("Supabase admin no configurado");

  // 1) Si viene lead_id, lo usamos directamente (sin revalidar email).
  if (input.lead_id) {
    const r = await sb
      .from("leads")
      .select("id, stage")
      .eq("id", input.lead_id)
      .maybeSingle();
    if (!r.data) {
      throw new Error(`lead_id ${input.lead_id} no existe`);
    }
    return {
      id: r.data.id,
      created: false,
      stage: (r.data.stage as LeadStage) || "nuevo",
    };
  }

  // 2) Búsqueda por email (case-insensitive)
  const email = input.email.trim().toLowerCase();
  const existing = await sb
    .from("leads")
    .select("id, stage")
    .eq("email", email)
    .maybeSingle();

  if (existing.data) {
    return {
      id: existing.data.id,
      created: false,
      stage: (existing.data.stage as LeadStage) || "nuevo",
    };
  }

  // 3) Crear nuevo
  const ins = await sb
    .from("leads")
    .insert({
      name: input.nombre.trim().slice(0, 200),
      email,
      phone: input.telefono?.trim() || null,
      source: "propuesta_con_191",
      stage: "calificado",
      qualified_at: new Date().toISOString(),
      metadata: {
        sector: input.sector,
        servicio: input.servicio,
        zona: input.zona,
        ...(input.metadata || {}),
      },
    })
    .select("id, stage")
    .single();

  if (ins.error || !ins.data) {
    throw new Error(`No se pudo crear el lead: ${ins.error?.message || "unknown"}`);
  }
  return {
    id: ins.data.id,
    created: true,
    stage: (ins.data.stage as LeadStage) || "calificado",
  };
}

async function markLeadAsProposal(
  leadId: string,
  proposalId: string
): Promise<void> {
  const sb = supabaseAdmin;
  if (!sb) return;
  await sb
    .from("leads")
    .update({
      stage: "propuesta",
      proposal_sent_at: new Date().toISOString(),
    })
    .eq("id", leadId);
  // Trazabilidad cruzada: el id de la propuesta queda en metadata
  await sb
    .from("leads")
    .update({
      metadata: { last_proposal_id: proposalId },
    })
    .eq("id", leadId);
}

// ---------------------------------------------------------------------------
// Twenty CRM (oportunidad + nota). Ola 1 (CON-190) deja TWENTY_API_KEY listo.
// ---------------------------------------------------------------------------
interface TwentyConfig {
  url: string;
  apiKey: string;
  activo: boolean;
}

function twentyConfig(): TwentyConfig {
  const url = (process.env.TWENTY_SERVER_URL || "").replace(/\/$/, "");
  const apiKey = process.env.TWENTY_API_KEY || "";
  return { url, apiKey, activo: Boolean(url && apiKey) };
}

interface TwentySyncResult {
  attempted: boolean;
  person_id: string | null;
  opportunity_id: string | null;
  note_id: string | null;
  motivo?: string;
}

async function sincronizarTwentyPropuesta(
  input: GenerateProposalInput,
  proposalTexto: string,
  leadId: string
): Promise<TwentySyncResult> {
  const cfg = twentyConfig();
  if (!cfg.activo) {
    return {
      attempted: false,
      person_id: null,
      opportunity_id: null,
      note_id: null,
      motivo:
        "TWENTY_API_KEY/TWENTY_SERVER_URL no configurados (CON-190 pendiente). La propuesta queda registrada en Supabase; la sincronización con Twenty se completará cuando CON-190 cierre.",
    };
  }

  try {
    // 1) Person (upsert por email)
    let personId: string | null = null;
    const email = input.email.trim().toLowerCase();
    const lookup = await fetch(
      `${cfg.url}/rest/people?filter[email]=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${cfg.apiKey}` } }
    ).catch(() => null);

    if (lookup && lookup.ok) {
      const ld = await lookup.json().catch(() => null);
      personId = ld?.data?.[0]?.id ?? ld?.data?.[0]?.person?.id ?? null;
    }

    if (!personId) {
      const create = await fetch(`${cfg.url}/rest/people`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          name: { firstName: input.nombre.trim().split(/\s+/)[0] || "Prospecto" },
          email: { primaryEmail: email },
          phone: input.telefono?.trim() || undefined,
          position: "Lead (calificado → propuesta CON-191)",
        }),
      });
      if (create.ok) {
        const cd = await create.json().catch(() => null);
        personId = cd?.data?.createPerson?.id ?? cd?.id ?? null;
      }
    }

    // 2) Opportunity (puede que Twenty no tenga el módulo: 404 → fallback)
    let opportunityId: string | null = null;
    try {
      const opp = await fetch(`${cfg.url}/rest/opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          name: `Sistema de Captación — ${input.nombre}`,
          stage: "propuesta",
          pointOfContactId: personId,
          amount: input.precioSetup || 900,
          closeDate: new Date(Date.now() + 14 * 86_400_000).toISOString(),
        }),
      });
      if (opp.ok) {
        const od = await opp.json().catch(() => null);
        opportunityId = od?.data?.createOpportunity?.id ?? od?.id ?? null;
      } else if (opp.status === 404) {
        // Twenty no soporta opportunities: el note cubre el rol de pipeline marker
        opportunityId = null;
      }
    } catch {
      opportunityId = null;
    }

    // 3) Note con la propuesta en texto plano + metadata
    let noteId: string | null = null;
    if (personId) {
      const note = await fetch(`${cfg.url}/rest/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfg.apiKey}`,
        },
        body: JSON.stringify({
          title: `Propuesta Sistema de Captación — ${new Date().toLocaleDateString("es-ES")}`,
          body:
            proposalTexto +
            "\n\n--- METADATA ---\n" +
            JSON.stringify(
              {
                lead_id: leadId,
                sector: input.sector,
                servicio: input.servicio,
                zona: input.zona,
                precio_setup: input.precioSetup,
                precio_mensual: input.precioMensual,
                motivo: input.motivo,
                source: "CON-191",
              },
              null,
              2
            ),
          personId,
        }),
      });
      if (note.ok) {
        const nd = await note.json().catch(() => null);
        noteId = nd?.data?.createNote?.id ?? nd?.id ?? null;
      }
    }

    return {
      attempted: true,
      person_id: personId,
      opportunity_id: opportunityId,
      note_id: noteId,
    };
  } catch (e) {
    return {
      attempted: true,
      person_id: null,
      opportunity_id: null,
      note_id: null,
      motivo: `Twenty sync error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ---------------------------------------------------------------------------
// n8n trigger (workflow proposal-auto). Ola 1 lo deja activo en cuanto
// CON-190 cierre el cert + API key. Mientras tanto, el workflow existe pero
// respeta PROPOSAL_DRY_RUN para que no envíe emails reales.
// ---------------------------------------------------------------------------
async function triggerN8nProposal(
  proposalId: string,
  input: GenerateProposalInput,
  enlaceLlamada: string,
  html: string
): Promise<{ attempted: boolean; triggered: boolean; motivo?: string }> {
  const url = process.env.N8N_PROPOSAL_WEBHOOK_URL;
  if (!url) {
    return {
      attempted: false,
      triggered: false,
      motivo:
        "N8N_PROPOSAL_WEBHOOK_URL no configurado. La propuesta queda en Supabase; el workflow n8n se activará en el siguiente paso del deploy.",
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "proposal.send",
        proposal_id: proposalId,
        fired_at: new Date().toISOString(),
        lead: {
          id: input.lead_id,
          nombre: input.nombre,
          email: input.email,
          empresa: input.empresa,
          telefono: input.telefono,
        },
        params: {
          sector: input.sector,
          servicio: input.servicio,
          zona: input.zona,
          precio_setup: input.precioSetup,
          precio_mensual: input.precioMensual,
          precio_publicidad: input.precioPublicidad,
          motivo: input.motivo,
        },
        html,
        enlace_llamada: enlaceLlamada,
        site: {
          name: "Consultoría en Marketing",
          url: SITE_URL,
          admin_email:
            process.env.ADMIN_EMAIL || "admin@consultoriaenmarketing.com",
        },
        dry_run: process.env.PROPOSAL_DRY_RUN === "true",
      }),
    });
    if (!res.ok) {
      return {
        attempted: true,
        triggered: false,
        motivo: `n8n webhook ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`,
      };
    }
    return { attempted: true, triggered: true };
  } catch (e) {
    return {
      attempted: true,
      triggered: false,
      motivo: `n8n webhook error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

// ---------------------------------------------------------------------------
// API principal: generar propuesta (el orquestador)
// ---------------------------------------------------------------------------
export async function generateProposal(
  input: GenerateProposalInput,
  opts: { ip: string; actor?: string | null } = { ip: "unknown" }
): Promise<GenerateProposalResult> {
  // 1) Rate-limit
  const rl = checkRateLimit(opts.ip);
  if (!rl.allowed) {
    const stub: ProposalRow = {
      id: "",
      lead_id: null,
      status: "draft",
      html: "",
      texto: "",
      sector: input.sector,
      servicio: input.servicio,
      zona: input.zona,
      precio_setup: input.precioSetup ?? 900,
      precio_mensual: input.precioMensual ?? 350,
      precio_publicidad: input.precioPublicidad ?? null,
      crm_person_id: null,
      crm_opportunity_id: null,
      crm_note_id: null,
      email_message_id: null,
      sent_at: null,
      approved_at: null,
      approved_by: null,
      created_at: new Date().toISOString(),
    };
    return {
      ok: false,
      proposal: stub,
      crm: { attempted: false, motivo: "rate_limited" },
      n8n: { attempted: false, triggered: false, motivo: "rate_limited" },
      review_required: false,
      rate_limited: true,
    };
  }

  // 2) Upsert del lead
  const lead = await upsertLead(input);

  // 3) Defaults de precio (catálogo v1.0)
  const defaults = precioCaptacionDefault(input.sector);
  const precioSetup = input.precioSetup ?? defaults.setup;
  const precioMensual = input.precioMensual ?? defaults.mensual;
  const precioPublicidad = input.precioPublicidad ?? defaults.publicidad;

  // 4) Renderizar propuesta
  const enlaceLlamada = `${SITE_URL}/agendar?lead=${encodeURIComponent(lead.id)}&utm_source=propuesta&utm_medium=email`;
  const propuestaInput: ProposalInput = {
    nombre: input.nombre,
    email: input.email,
    empresa: input.empresa,
    sector: input.sector,
    servicio: input.servicio,
    zona: input.zona,
    precioSetup,
    precioMensual,
    precioPublicidad,
    enlaceLlamada,
    motivo: input.motivo,
  };
  const { html, texto } = renderPropuestaCaptacion(propuestaInput);

  // 5) Determinar si requiere revisión humana
  const reviewRequired =
    process.env.PROPOSAL_REQUIRE_HUMAN_REVIEW === "true" ||
    lead.stage === "nuevo" || // un lead que aún no está "calificado" requiere visto bueno
    !input.motivo;            // sin motivo no hay bono fundador claro

  // 6) Persistir la propuesta en Supabase
  const sb = supabaseAdmin;
  if (!sb) throw new Error("Supabase admin no configurado");

  const insert = await sb
    .from("proposals")
    .insert({
      lead_id: lead.id,
      sector: input.sector,
      servicio: input.servicio,
      zona: input.zona,
      precio_setup: precioSetup,
      precio_mensual: precioMensual,
      precio_publicidad: precioPublicidad,
      html,
      texto,
      status: reviewRequired ? "pending_review" : "approved",
      approved_at: reviewRequired ? null : new Date().toISOString(),
      approved_by: reviewRequired ? null : opts.actor || "auto",
      metadata: {
        lead_stage: lead.stage,
        lead_created: lead.created,
        ip: opts.ip,
        actor: opts.actor,
        reason: reviewRequired
          ? "lead_no_calificado_o_sin_motivo"
          : "auto_aprobado",
      },
    })
    .select("*")
    .single();

  if (insert.error || !insert.data) {
    throw new Error(
      `No se pudo persistir la propuesta: ${insert.error?.message || "unknown"}`
    );
  }
  const row = insert.data as ProposalRow;

  // 7) Si requiere revisión, paramos aquí (sin n8n, sin CRM, sin email)
  if (reviewRequired) {
    return {
      ok: true,
      proposal: row,
      crm: { attempted: false, motivo: "pending_review" },
      n8n: { attempted: false, triggered: false, motivo: "pending_review" },
      review_required: true,
      rate_limited: false,
    };
  }

  // 8) Sincronizar con Twenty CRM
  const crm = await sincronizarTwentyPropuesta(input, texto, lead.id);

  // 9) Actualizar proposal con IDs del CRM
  if (crm.person_id || crm.note_id || crm.opportunity_id) {
    await sb
      .from("proposals")
      .update({
        crm_person_id: crm.person_id,
        crm_opportunity_id: crm.opportunity_id,
        crm_note_id: crm.note_id,
      })
      .eq("id", row.id);
    row.crm_person_id = crm.person_id;
    row.crm_opportunity_id = crm.opportunity_id;
    row.crm_note_id = crm.note_id;
  }

  // 10) Marcar el lead como "propuesta" y guardar el id
  await markLeadAsProposal(lead.id, row.id);

  // 11) Disparar n8n (envío del email)
  const n8n = await triggerN8nProposal(row.id, input, enlaceLlamada, html);

  // 12) Si n8n OK → status sent. Si n8n falla → approved (queda para reintento)
  const finalStatus: ProposalStatus = n8n.triggered ? "sent" : "approved";
  if (n8n.triggered) {
    const sentAt = new Date().toISOString();
    await sb
      .from("proposals")
      .update({ status: finalStatus, sent_at: sentAt })
      .eq("id", row.id);
    row.status = finalStatus;
    row.sent_at = sentAt;
  }

  return {
    ok: true,
    proposal: row,
    crm,
    n8n,
    review_required: false,
    rate_limited: false,
  };
}

export async function getProposal(id: string): Promise<ProposalRow | null> {
  const sb = supabaseAdmin;
  if (!sb) return null;
  const r = await sb
    .from("proposals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (r.data as ProposalRow | null) ?? null;
}

export async function approveProposal(
  id: string,
  actor: string
): Promise<{ ok: boolean; proposal?: ProposalRow; motivo?: string }> {
  const sb = supabaseAdmin;
  if (!sb) return { ok: false, motivo: "Supabase no configurado" };
  const current = await getProposal(id);
  if (!current) return { ok: false, motivo: "Propuesta no encontrada" };
  if (!["pending_review", "draft", "rejected"].includes(current.status)) {
    return {
      ok: false,
      motivo: `No se puede aprobar una propuesta en estado ${current.status}`,
    };
  }
  const upd = await sb
    .from("proposals")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: actor,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (upd.error || !upd.data) {
    return { ok: false, motivo: upd.error?.message || "error" };
  }
  // Disparar n8n tras aprobación
  // (se hace en el endpoint con el input completo, no aquí)
  return { ok: true, proposal: upd.data as ProposalRow };
}

export async function rejectProposal(
  id: string,
  actor: string,
  motivo: string
): Promise<{ ok: boolean; propuesta?: ProposalRow; motivo?: string }> {
  const sb = supabaseAdmin;
  if (!sb) return { ok: false, motivo: "Supabase no configurado" };
  const current = await getProposal(id);
  if (!current) return { ok: false, motivo: "Propuesta no encontrada" };
  if (!["pending_review", "draft", "approved"].includes(current.status)) {
    return {
      ok: false,
      motivo: `No se puede rechazar una propuesta en estado ${current.status}`,
    };
  }
  const upd = await sb
    .from("proposals")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      rejected_by: actor,
      rejected_motivo: motivo,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (upd.error || !upd.data) {
    return { ok: false, motivo: upd.error?.message || "error" };
  }
  return { ok: true, propuesta: upd.data as ProposalRow };
}
