// Generación de feeds ICS (iCalendar) y utilidades de fechas para citas.
// CON-181: integración de calendario y flujo de citas del chatbot.

export type AppointmentForICS = {
  id: string;
  ics_uid?: string | null;
  lead_name: string;
  lead_email?: string | null;
  lead_phone?: string | null;
  start_at: string; // ISO
  end_at: string; // ISO
  timezone: string;
  reason?: string | null;
  status: string;
  source?: string | null;
  notes?: string | null;
};

export type ICSFeedOptions = {
  calendarName?: string;
  calendarDescription?: string;
  // Si true, eventos cancelled/rescheduled se emiten con STATUS:CANCELLED
  includeCancelled?: boolean;
};

const CRLF = "\r\n";

function escapeICS(value: string): string {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function foldICS(line: string): string {
  // RFC 5545: máximo 75 octetos por línea, continuación con espacio
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    chunks.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return chunks.join(CRLF);
}

function toICSDateTime(iso: string): string {
  // Devuelve UTC básico YYYYMMDDTHHMMSSZ
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function toICSStamp(iso: string = new Date().toISOString()): string {
  return toICSDateTime(iso);
}

export function stableUID(appointmentId: string): string {
  return `${appointmentId}@consultoriaenmarketing.com`;
}

export function renderICS(
  appt: AppointmentForICS,
  opts: ICSFeedOptions = {}
): string[] {
  const lines: string[] = [];
  const uid = appt.ics_uid || stableUID(appt.id);
  const dtstamp = toICSStamp();
  const dtstart = toICSDateTime(appt.start_at);
  const dtend = toICSDateTime(appt.end_at);
  const status =
    appt.status === "cancelled"
      ? "CANCELLED"
      : appt.status === "completed"
      ? "CONFIRMED"
      : appt.status === "no_show"
      ? "CANCELLED"
      : "CONFIRMED";

  if (appt.status === "cancelled" && !opts.includeCancelled) {
    return [];
  }

  const summary = `Consultoría gratuita — ${appt.lead_name}`;
  const descParts: string[] = [];
  if (appt.reason) descParts.push(`Motivo: ${appt.reason}`);
  if (appt.lead_email) descParts.push(`Email: ${appt.lead_email}`);
  if (appt.lead_phone) descParts.push(`Tel: ${appt.lead_phone}`);
  descParts.push(`Origen: ${appt.source || "chatbot"}`);
  descParts.push(`Estado: ${appt.status}`);
  if (appt.notes) descParts.push(`Notas: ${appt.notes}`);

  lines.push("BEGIN:VEVENT");
  lines.push(foldICS(`UID:${uid}`));
  lines.push(foldICS(`DTSTAMP:${dtstamp}`));
  lines.push(foldICS(`DTSTART:${dtstart}`));
  lines.push(foldICS(`DTEND:${dtend}`));
  lines.push(foldICS(`SUMMARY:${escapeICS(summary)}`));
  lines.push(foldICS(`DESCRIPTION:${escapeICS(descParts.join("\n"))}`));
  if (appt.lead_email) {
    lines.push(
      foldICS(`ORGANIZER;CN=${escapeICS(appt.lead_name)}:mailto:${escapeICS(appt.lead_email)}`)
    );
  }
  lines.push(foldICS(`STATUS:${status}`));
  lines.push(foldICS(`CATEGORIES:CONSULTORIA,LEAD,CHATBOT`));
  lines.push("END:VEVENT");
  return lines;
}

export function renderICSFeed(
  appts: AppointmentForICS[],
  opts: ICSFeedOptions = {}
): string {
  const now = toICSStamp();
  const name = opts.calendarName || "Consultoría en Marketing — Citas chatbot";
  const desc =
    opts.calendarDescription ||
    "Citas agendadas automáticamente por el chatbot de consultoriaenmarketing.com";

  const body: string[] = [];
  body.push("BEGIN:VCALENDAR");
  body.push("VERSION:2.0");
  body.push("PRODID:-//Consultoria en Marketing//Chatbot Citas//ES");
  body.push("CALSCALE:GREGORIAN");
  body.push("METHOD:PUBLISH");
  body.push(foldICS(`X-WR-CALNAME:${escapeICS(name)}`));
  body.push(foldICS(`X-WR-CALDESC:${escapeICS(desc)}`));
  body.push(foldICS(`X-PUBLISHED-TTL:PT5M`));
  body.push(`LAST-MODIFIED:${now}`);
  body.push(`DTSTAMP:${now}`);

  for (const a of appts) {
    body.push(...renderICS(a, opts));
  }

  body.push("END:VCALENDAR");
  return body.join(CRLF);
}

// Devuelve la zona horaria IANA configurada o Europe/Madrid por defecto
export function resolveTimezone(tz?: string | null): string {
  const t = (tz || process.env.CHATBOT_TIMEZONE || "Europe/Madrid").trim();
  try {
    // Validación básica: debe contener "/"
    if (!t.includes("/")) return "Europe/Madrid";
    return t;
  } catch {
    return "Europe/Madrid";
  }
}

// Formatea una fecha ISO como string legible en ES para mostrar al usuario
export function formatAppointmentHuman(iso: string, tz: string = "Europe/Madrid"): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
      hour12: false,
    }).format(d);
  } catch {
    return iso;
  }
}
