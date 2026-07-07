// Generación de outputs de onboarding:
//  - presupuesto en HTML y texto plano (para email)
//  - payload JSON estructurado (para que un agente procese el proyecto)
//  - cliente Twenty CRM (registro de lead + nota)
import type { OnboardingAnswers, Quote } from "./tariff";
import { PRICES, SOCIAL_PROFILES, formatEUR } from "./tariff";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://consultoriaenmarketing.com";

export function construirPayloadEstructurado(
  a: OnboardingAnswers,
  q: Quote
): Record<string, unknown> {
  return {
    version: 1,
    origen: "formulario_onboarding",
    sitio: SITE_URL,
    enviado_en: new Date().toISOString(),
    cliente: {
      nombre: a.nombre,
      email: a.email,
      telefono: a.telefono,
      empresa: a.empresa,
    },
    respuestas: {
      tiene_dominio: a.tieneDominio,
      dominio_actual: a.dominioActual || null,
      tiene_servidor: a.tieneServidor,
      acceso_servidor: a.accesoServidor ? "[RECIBIDO]" : null, // no exponemos credenciales en el payload
      tiene_logo: a.tieneLogo,
      tipo_web: a.tipoWeb,
      tiene_catalogo: a.tieneCatalogo,
      num_articulos_crear: a.numArticulosCrear || 0,
      anade_seo: a.anadeSeo,
      redes_sociales: a.redesSociales.map((id) => ({
        id,
        label: SOCIAL_PROFILES.find((p) => p.id === id)?.label ?? id,
      })),
      notas: a.notas || null,
    },
    presupuesto: {
      lineas: q.lineas.map((l) => ({
        key: l.key,
        concepto: l.concepto,
        detalle: l.detalle ?? null,
        cantidad: l.cantidad ?? 1,
        precio_unitario: l.precioUnitario,
        subtotal: l.subtotal,
        recurrente: l.recurrente ?? null,
      })),
      total_unico: q.totalUnico,
      total_anual: q.totalAnual,
      total: q.total,
      moneda: "EUR",
    },
    inputs_pendientes: q.inputsPendientes,
  };
}

function filasLineas(q: Quote): string {
  return q.lineas
    .map((l) => {
      const cant = l.cantidad && l.cantidad > 1 ? `${l.cantidad} × ` : "";
      const det = l.detalle ? `<br/><small style="color:#888">${escapeHtml(l.detalle)}</small>` : "";
      const rec = l.recurrente === "anual" ? " <em>(anual)</em>" : "";
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #1a2a2a">${escapeHtml(l.concepto)}${det}${rec}</td>
        <td style="padding:8px;border-bottom:1px solid #1a2a2a;text-align:right;white-space:nowrap">${cant}${formatEUR(l.subtotal)}</td>
      </tr>`;
    })
    .join("");
}

export function presupuestoHTML(a: OnboardingAnswers, q: Quote): string {
  const inputs = q.inputsPendientes.length
    ? `<h3 style="margin-top:24px;color:#d1bcff">Datos que necesitamos de ti</h3>
       <ul>${q.inputsPendientes
         .map((i) => `<li>${escapeHtml(i)}</li>`)
         .join("")}</ul>`
    : "";

  const anual = q.totalAnual
    ? `<tr><td style="padding:8px">Total anual (recurrente)</td><td style="padding:8px;text-align:right">${formatEUR(
        q.totalAnual
      )}</td></tr>`
    : "";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#eae6f0;background:#001414;border:1px solid #1a2a2a;border-radius:16px;padding:24px">
    <h1 style="color:#17fbfb;margin-top:0">Tu presupuesto estimado</h1>
    <p>Hola <strong>${escapeHtml(a.nombre || "cliente")}</strong>,</p>
    <p>Gracias por rellenar el formulario de onboarding. Aquí tienes el desglose de tu proyecto:</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      <thead>
        <tr style="color:#ccc3da">
          <th style="padding:8px;text-align:left;border-bottom:2px solid #1a2a2a">Concepto</th>
          <th style="padding:8px;text-align:right;border-bottom:2px solid #1a2a2a">Importe</th>
        </tr>
      </thead>
      <tbody>
        ${filasLineas(q)}
      </tbody>
      <tfoot>
        <tr><td style="padding:8px">Total único (setup)</td><td style="padding:8px;text-align:right">${formatEUR(
          q.totalUnico
        )}</td></tr>
        ${anual}
        <tr><td style="padding:12px 8px;font-size:18px;color:#17fbfb"><strong>Total estimado</strong></td>
        <td style="padding:12px 8px;text-align:right;font-size:18px;color:#17fbfb"><strong>${formatEUR(
          q.total
        )}</strong></td></tr>
      </tfoot>
    </table>
    <p style="color:#ccc3da;font-size:13px;margin-top:16px">
      Importe orientativo. IVA no incluido. Te contactaremos en menos de 24h para confirmar detalles y cerrar el presupuesto definitivo.
    </p>
    ${inputs}
    <p style="margin-top:24px;color:#888;font-size:12px">
      Enviado desde <a href="${SITE_URL}" style="color:#17fbfb">${SITE_URL}</a>
    </p>
  </div>`;
}

export function presupuestoTexto(a: OnboardingAnswers, q: Quote): string {
  const lineas = q.lineas
    .map((l) => {
      const cant = l.cantidad && l.cantidad > 1 ? `${l.cantidad} x ` : "";
      const rec = l.recurrente === "anual" ? " (anual)" : "";
      const det = l.detalle ? ` — ${l.detalle}` : "";
      return `  - ${l.concepto}${det}${rec}: ${cant}${formatEUR(l.subtotal)}`;
    })
    .join("\n");
  const inputs = q.inputsPendientes.length
    ? `\n\nDatos que necesitamos de ti:\n${q.inputsPendientes
        .map((i) => `  - ${i}`)
        .join("\n")}`
    : "";
  const anual = q.totalAnual
    ? `\n  Total anual (recurrente): ${formatEUR(q.totalAnual)}`
    : "";
  return `PRESUPUESTO ESTIMADO — ${SITE_URL}

Hola ${a.nombre || "cliente"},

${lineas}

  Total único (setup): ${formatEUR(q.totalUnico)}${anual}
  TOTAL ESTIMADO: ${formatEUR(q.total)}
${inputs}

Importe orientativo. IVA no incluido. Te contactaremos en menos de 24h.`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------- Twenty CRM ----------
// Twenty CRM expone una API REST/GraphQL. Necesitamos un API key de workspace.
// Sin TWENTY_API_KEY configurado, la función es no-op y registra un aviso.

export interface TwentyResult {
  ok: boolean;
  skipped?: boolean;
  motivo?: string;
  companyId?: string;
  personId?: string;
}

function twentyConfig() {
  const url = (process.env.TWENTY_SERVER_URL || "").replace(/\/$/, "");
  const apiKey = process.env.TWENTY_API_KEY || "";
  return { url, apiKey, activo: Boolean(url && apiKey) };
}

export async function sincronizarTwenty(
  a: OnboardingAnswers,
  q: Quote,
  presupuestoJson: Record<string, unknown>,
  presupuestoTexto: string
): Promise<TwentyResult> {
  const cfg = twentyConfig();
  if (!cfg.activo) {
    return {
      ok: false,
      skipped: true,
      motivo:
        "TWENTY_API_KEY/TWENTY_SERVER_URL no configurados. Lead guardado en Supabase; pendiente de sincronizar cuando se aprovisione el API key.",
    };
  }

  try {
    // 1) Crear compañía (si hay empresa)
    let companyId: string | undefined;
    if (a.empresa?.trim()) {
      const companyRes = await fetch(`${cfg.url}/rest/companies`, {
        method: "POST",
        headers: twentyHeaders(cfg.apiKey),
        body: JSON.stringify({
          name: a.empresa.trim(),
          domainName: a.dominioActual?.trim() || undefined,
        }),
      });
      if (companyRes.ok) {
        const data = await companyRes.json().catch(() => null);
        companyId = data?.data?.company?.id ?? data?.id;
      } else if (companyRes.status !== 409) {
        // 409 = ya existe; no es fatal
        console.warn("Twenty company create status:", companyRes.status);
      }
    }

    // 2) Crear persona (lead)
    const personRes = await fetch(`${cfg.url}/rest/people`, {
      method: "POST",
      headers: twentyHeaders(cfg.apiKey),
      body: JSON.stringify({
        name: `${a.nombre}`.trim() || a.email,
        email: { primaryEmail: a.email.trim() },
        phone: a.telefono?.trim() || undefined,
        companyId: companyId || undefined,
        position: "Lead (formulario onboarding)",
      }),
    });
    const personData = await personRes.json().catch(() => null);
    const personId: string | undefined =
      personData?.data?.person?.id ?? personData?.id;

    // 3) Adjuntar nota con el presupuesto detallado + payload JSON
    if (personId) {
      await fetch(`${cfg.url}/rest/notes`, {
        method: "POST",
        headers: twentyHeaders(cfg.apiKey),
        body: JSON.stringify({
          title: `Presupuesto onboarding — ${formatEUR(q.total)}`,
          body:
            presupuestoTexto +
            "\n\n--- PAYLOAD ESTRUCTURADO (JSON) ---\n" +
            JSON.stringify(presupuestoJson, null, 2),
          personId,
          companyId: companyId || undefined,
        }),
      }).catch((e) => console.warn("Twenty note error:", e));
    }

    return { ok: personRes.ok, companyId, personId };
  } catch (e) {
    console.error("Twenty sync error:", e);
    return { ok: false, motivo: String(e) };
  }
}

function twentyHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

// Precios re-exportados para conveniencia de la API/UI.
export { PRICES, formatEUR };
