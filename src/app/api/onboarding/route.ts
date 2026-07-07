import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  calcularPresupuesto,
  emptyAnswers,
  OnboardingAnswers,
} from "@/lib/tariff";
import {
  construirPayloadEstructurado,
  presupuestoHTML,
  presupuestoTexto,
  sincronizarTwenty,
} from "@/lib/onboarding";
import nodemailer from "nodemailer";

function createTransport() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Fallback a sendmail local (configurado en el VPS).
  return nodemailer.createTransport({
    sendmail: true,
    newline: "unix",
    path: "/usr/sbin/sendmail",
  });
}

// Normaliza/valida las respuestas entrantes contra el esquema para evitar
// inyecciones o campos inesperados en Supabase/Twenty.
function sanitizeAnswers(raw: Partial<OnboardingAnswers>): OnboardingAnswers {
  const a: OnboardingAnswers = { ...emptyAnswers };
  if (typeof raw.nombre === "string") a.nombre = raw.nombre.slice(0, 200);
  if (typeof raw.email === "string") a.email = raw.email.slice(0, 200);
  if (typeof raw.telefono === "string") a.telefono = raw.telefono.slice(0, 60);
  if (typeof raw.empresa === "string") a.empresa = raw.empresa.slice(0, 200);
  if (raw.tieneDominio === "si" || raw.tieneDominio === "no")
    a.tieneDominio = raw.tieneDominio;
  if (typeof raw.dominioActual === "string")
    a.dominioActual = raw.dominioActual.slice(0, 300);
  if (raw.tieneServidor === "si" || raw.tieneServidor === "no")
    a.tieneServidor = raw.tieneServidor;
  if (typeof raw.accesoServidor === "string")
    a.accesoServidor = raw.accesoServidor.slice(0, 500);
  if (raw.tieneLogo === "si" || raw.tieneLogo === "no")
    a.tieneLogo = raw.tieneLogo;
  if (typeof raw.notasLogo === "string") a.notasLogo = raw.notasLogo.slice(0, 500);
  if (raw.tipoWeb === "basica" || raw.tipoWeb === "ecommerce")
    a.tipoWeb = raw.tipoWeb;
  if (raw.tieneCatalogo === "si" || raw.tieneCatalogo === "no")
    a.tieneCatalogo = raw.tieneCatalogo;
  if (typeof raw.numArticulosCrear === "number" && raw.numArticulosCrear >= 0)
    a.numArticulosCrear = Math.min(100000, Math.floor(raw.numArticulosCrear));
  if (raw.anadeSeo === "si" || raw.anadeSeo === "no") a.anadeSeo = raw.anadeSeo;
  if (Array.isArray(raw.redesSociales)) {
    const allowed = ["youtube", "instagram", "seo-local-google", "facebook", "otros"];
    a.redesSociales = raw.redesSociales.filter(
      (r): r is OnboardingAnswers["redesSociales"][number] =>
        typeof r === "string" && allowed.includes(r)
    );
  }
  if (typeof raw.notas === "string") a.notas = raw.notas.slice(0, 2000);
  return a;
}

export async function POST(req: Request) {
  let raw: Partial<OnboardingAnswers>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido." },
      { status: 400 }
    );
  }

  const answers = sanitizeAnswers(raw);

  // Validación mínima.
  if (!answers.nombre.trim() || !/\S+@\S+\.\S+/.test(answers.email)) {
    return NextResponse.json(
      { error: "Nombre y email válidos son obligatorios." },
      { status: 400 }
    );
  }
  if (!answers.tipoWeb) {
    return NextResponse.json(
      { error: "Selecciona el tipo de web." },
      { status: 400 }
    );
  }

  const quote = calcularPresupuesto(answers);
  const payload = construirPayloadEstructurado(answers, quote);
  const texto = presupuestoTexto(answers, quote);
  const html = presupuestoHTML(answers, quote);

  // 1) Persistencia en Supabase (store primario).
  let supabaseError: string | null = null;
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error } = await supabaseAdmin.from("leads").insert({
        name: answers.nombre.trim(),
        email: answers.email.trim(),
        phone: answers.telefono?.trim() || null,
        source: "onboarding",
        metadata: {
          empresa: answers.empresa?.trim() || null,
          // Snapshot completo y reproducible del lead + presupuesto.
          payload,
          total: quote.total,
          total_unico: quote.totalUnico,
          total_anual: quote.totalAnual,
          inputs_pendientes: quote.inputsPendientes,
          submitted_at: new Date().toISOString(),
        },
      });
      if (error) {
        console.error("Supabase insert error:", error);
        supabaseError = error.message;
      }
    } else {
      supabaseError = "SUPABASE_SERVICE_ROLE_KEY no configurado";
    }
  } catch (e) {
    console.error("Supabase exception:", e);
    supabaseError = String(e);
  }

  // 2) Twenty CRM (best-effort; no bloquea el envío si falla).
  let twenty: Awaited<ReturnType<typeof sincronizarTwenty>>;
  try {
    twenty = await sincronizarTwenty(answers, quote, payload, texto);
  } catch (e) {
    console.error("Twenty exception:", e);
    twenty = { ok: false, motivo: String(e) };
  }

  // 3) Email al cliente + admin (best-effort).
  const adminEmail =
    process.env.ADMIN_EMAIL || "hola@consultoriaenmarketing.com";
  const fromAddress =
    process.env.SMTP_FROM || "noreply@consultoriaenmarketing.com";

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: `"Consultoría en Marketing" <${fromAddress}>`,
      to: answers.email.trim(),
      bcc: adminEmail,
      subject: `Tu presupuesto estimado — ${new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(quote.total)}`,
      html,
      text: texto,
    });
  } catch (e) {
    // El email puede fallar (SMTP no configurado en dev); no fallamos el envío.
    console.error("Email send error:", e);
  }

  return NextResponse.json({
    success: true,
    total: quote.total,
    supabase: supabaseError ? { ok: false, error: supabaseError } : { ok: true },
    twenty,
  });
}
