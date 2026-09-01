// Plantilla de propuesta para el «Sistema de Captación» (CON-191)
// Genera HTML autocontenido (CSS inline) y texto plano, listos para:
//   1. Email al cliente (inline en el cuerpo)
//   2. Adjuntar como note en Twenty CRM
//   3. Histórico en la tabla `proposals` (Supabase)
//
// Modelo "Juan" (CON-185): 900 € + IVA puesta en marcha, 350 € + IVA / mes
// gestión y captación, garantía de captación, bono cliente fundador, fase
// de validación 30 días, transporte y publicidad SIEMPRE aparte.
// El sector y la máquina cambian; el armazón es estable.
//
// NO embebemos imágenes (la propuesta premium con fotos es el PDF que se
// manda aparte si el cliente lo pide — esta es la versión email, ligera).

import { escapeHtml } from "./html";
import { formatEUR } from "./tariff";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://consultoriaenmarketing.com";
const SITE_NAME = "Consultoría en Marketing";

export interface ProposalInput {
  nombre: string;
  email?: string | null;
  empresa?: string | null;
  sector: string;            // ej: "plataformas_elevadoras"
  servicio: string;          // ej: "MATILSA PARMA 9"
  zona: string;              // ej: "Sevilla y provincia"
  precioSetup: number;       // 900 por defecto
  precioMensual: number;     // 350 por defecto
  precioPublicidad?: string; // ej: "100–200 €/mes"
  enlaceLlamada: string;     // URL absoluta al calendario
  motivo?: string | null;    // ej: "Cliente fundador del sector"
}

export interface ProposalOutput {
  html: string;
  texto: string;
}

const PRECIOS_DEFAULT = {
  setup: 900,
  mensual: 350,
  publicidad: "100–200 €/mes",
} as const;

/**
 * Devuelve los precios por defecto del Sistema de Captación para un sector.
 * Por ahora todos los sectores comparten la misma tarifa (catálogo v1.0).
 * Punto de extensión: aquí se pueden introducir sobreprecios por sector
 * (ej: dental o legal con mayor regulación) sin tocar el resto del motor.
 */
export function precioCaptacionDefault(_sector: string): {
  setup: number;
  mensual: number;
  publicidad: string;
} {
  return { ...PRECIOS_DEFAULT };
}

function labelSector(sector: string): string {
  return sector
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function fechaCorta(): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

// --- Generadores de bloque ---

function bloqueCabecera(): string {
  return `
  <tr><td style="padding:0 0 18px 0">
    <div style="font-family:Segoe UI,-apple-system,Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#6d747d;border-left:3px solid #d6453d;padding-left:10px">
      ${escapeHtml(SITE_NAME)} · Sistema de Captación
    </div>
  </td></tr>`;
}

function bloqueSaludo(nombre: string): string {
  return `
  <tr><td style="padding:0 0 14px 0;font-family:Segoe UI,-apple-system,Helvetica,Arial,sans-serif;font-size:22px;line-height:1.2;color:#1b1d21;font-weight:700">
    Hola ${escapeHtml(nombre || "cliente")},
  </td></tr>
  <tr><td style="padding:0 0 18px 0;font-family:Segoe UI,-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#3a3f45">
    Este no es un presupuesto de página web. Es la propuesta de un <strong>sistema digital de captación</strong>
    para que tu negocio aparezca, reciba solicitudes y cierre alquileres o servicios en piloto automático.
  </td></tr>`;
}

function bloqueSituacion(input: ProposalInput): string {
  const sectorL = escapeHtml(labelSector(input.sector));
  const servicio = escapeHtml(input.servicio);
  const zona = escapeHtml(input.zona);
  return `
  <tr><td style="padding:0 0 8px 0">
    <div style="font-family:Segoe UI,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d6453d;font-weight:700">
      1 · Tu situación
    </div>
  </td></tr>
  <tr><td style="padding:6px 0 18px 0;font-family:Segoe UI,sans-serif;font-size:14.5px;line-height:1.6;color:#3a3f45">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="padding:4px 0;color:#6d747d;width:120px">Sector</td>
          <td style="padding:4px 0;color:#1b1d21"><strong>${sectorL}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#6d747d">Servicio</td>
          <td style="padding:4px 0;color:#1b1d21"><strong>${servicio}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#6d747d">Zona</td>
          <td style="padding:4px 0;color:#1b1d21"><strong>${zona}</strong></td></tr>
    </table>
  </td></tr>`;
}

function bloquePropuesta(): string {
  return `
  <tr><td style="padding:0 0 8px 0">
    <div style="font-family:Segoe UI,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d6453d;font-weight:700">
      2 · Lo que construimos para ti
    </div>
  </td></tr>
  <tr><td style="padding:6px 0 18px 0;font-family:Segoe UI,sans-serif;font-size:14.5px;line-height:1.6;color:#3a3f45">
    <ul style="margin:0;padding-left:18px">
      <li><strong>Identidad de marca básica</strong> + perfiles digitales (Google Business, Instagram, Facebook, WhatsApp Business).</li>
      <li><strong>Landing orientada a conversión</strong> con tu servicio, zona, precio y prueba social.</li>
      <li><strong>Sistema de reservas</strong> con calendario, pagos y notificaciones automáticas.</li>
      <li><strong>Analítica</strong> para ver qué canal trae cada cliente y qué anuncios funcionan.</li>
      <li><strong>Estructura inicial de campañas</strong> en Google Ads lista para activar (keywords, anuncios, audiencias).</li>
    </ul>
  </td></tr>`;
}

function bloqueInversion(input: ProposalInput): string {
  const setup = formatEUR(input.precioSetup);
  const mensual = formatEUR(input.precioMensual);
  const pub = escapeHtml(input.precioPublicidad || PRECIOS_DEFAULT.publicidad);
  return `
  <tr><td style="padding:0 0 8px 0">
    <div style="font-family:Segoe UI,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d6453d;font-weight:700">
      3 · Inversión
    </div>
  </td></tr>
  <tr><td style="padding:6px 0 18px 0">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-family:Segoe UI,sans-serif;font-size:14.5px">
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e1e4e9;color:#3a3f45">Puesta en marcha (pago único)</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e1e4e9;text-align:right;font-variant-numeric:tabular-nums"><strong>${setup}</strong> + IVA</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e1e4e9;color:#3a3f45">Gestión y captación (mensual)</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e1e4e9;text-align:right;font-variant-numeric:tabular-nums"><strong>${mensual}</strong> + IVA / mes</td>
      </tr>
      <tr>
        <td style="padding:10px 12px;color:#6d747d">Inversión publicitaria inicial recomendada</td>
        <td style="padding:10px 12px;text-align:right;color:#6d747d">${pub} (a pagar directamente a Google, sin recargo)</td>
      </tr>
    </table>
    <div style="font-family:Segoe UI,sans-serif;font-size:12px;color:#6d747d;margin-top:6px">
      IVA no incluido. Publicidad, dominios y transportes se facturan siempre aparte.
    </div>
  </td></tr>`;
}

function bloqueGarantia(): string {
  return `
  <tr><td style="padding:0 0 8px 0">
    <div style="font-family:Segoe UI,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d6453d;font-weight:700">
      4 · Garantía de captación
    </div>
  </td></tr>
  <tr><td style="padding:6px 0 18px 0;font-family:Segoe UI,sans-serif;font-size:14.5px;line-height:1.6;color:#3a3f45">
    Si tras un mes completo de gestión no se alcanza el objetivo acordado, prolongamos la gestión
    sin honorarios hasta alcanzarlo, conforme a las condiciones del contrato (disponibilidad del
    cliente, inversión publicitaria mantenida, volumen evaluable).
    <br/><br/>
    <strong>Fase de validación de 30 días</strong>: medimos antes de prometer. Te enseñamos los
    datos reales del primer mes y decidimos juntos si escalamos.
  </td></tr>`;
}

function bloqueBonoFundador(input: ProposalInput): string {
  const motivo = input.motivo
    ? ` <em>${escapeHtml(input.motivo)}</em>.`
    : "";
  return `
  <tr><td style="padding:0 0 8px 0">
    <div style="font-family:Segoe UI,sans-serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d6453d;font-weight:700">
      5 · Bono cliente fundador
    </div>
  </td></tr>
  <tr><td style="padding:6px 0 18px 0;font-family:Segoe UI,sans-serif;font-size:14.5px;line-height:1.6;color:#3a3f45">
    Eres uno de los primeros clientes de tu sector.${motivo} Eso nos importa: preferimos construir
    contigo un caso de éxito desde el primer día, con una relación a largo plazo, en vez de
    regalar el trabajo.
    <br/><br/>
    Las condiciones de esta propuesta quedan <strong>garantizadas para las fases aquí descritas</strong>
    mientras mantengamos la colaboración.
  </td></tr>`;
}

function bloqueCta(input: ProposalInput): string {
  const enlace = escapeHtml(input.enlaceLlamada);
  return `
  <tr><td style="padding:8px 0 14px 0;text-align:center">
    <a href="${enlace}"
       style="display:inline-block;background:#d6453d;color:#ffffff;text-decoration:none;font-family:Segoe UI,sans-serif;font-size:15px;font-weight:700;letter-spacing:.04em;padding:14px 32px;border-radius:6px">
      Reservar llamada de cierre
    </a>
  </td></tr>
  <tr><td style="padding:0 0 24px 0;font-family:Segoe UI,sans-serif;font-size:13px;line-height:1.55;color:#6d747d;text-align:center">
    30 minutos con la dirección de ${escapeHtml(SITE_NAME)} para revisar la propuesta,
    resolver dudas y, si encaja, firmar el contrato.
  </td></tr>`;
}

function bloquePie(): string {
  return `
  <tr><td style="padding:18px 0 0 0;border-top:1px solid #e1e4e9">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:Segoe UI,sans-serif;font-size:12px;color:#6d747d">
      <tr>
        <td style="padding:0">
          <strong style="color:#1b1d21">${escapeHtml(SITE_NAME)}</strong><br/>
          <a href="${SITE_URL}" style="color:#d6453d;text-decoration:none">${SITE_URL}</a>
        </td>
        <td style="padding:0;text-align:right;color:#6d747d">
          Propuesta generada el ${escapeHtml(fechaCorta())}<br/>
          Validez: 14 días
        </td>
      </tr>
    </table>
  </td></tr>`;
}

export function renderPropuestaCaptacion(input: ProposalInput): ProposalOutput {
  // 1) HTML — tabla ancha con cellpadding para compatibilidad email
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Propuesta Sistema de Captación — ${escapeHtml(input.nombre || "cliente")}</title>
</head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:Segoe UI,-apple-system,Helvetica,Arial,sans-serif;color:#3a3f45">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f7f8fa;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e1e4e9;border-radius:10px;padding:32px 28px">
        ${bloqueCabecera()}
        ${bloqueSaludo(input.nombre)}
        ${bloqueSituacion(input)}
        ${bloquePropuesta()}
        ${bloqueInversion(input)}
        ${bloqueGarantia()}
        ${bloqueBonoFundador(input)}
        ${bloqueCta(input)}
        ${bloquePie()}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // 2) Texto plano (fallback para clientes de email sin HTML + adjuntos)
  const setup = formatEUR(input.precioSetup);
  const mensual = formatEUR(input.precioMensual);
  const pub = input.precioPublicidad || PRECIOS_DEFAULT.publicidad;
  const sectorL = labelSector(input.sector);
  const texto = `PROPUESTA COMERCIAL — SISTEMA DE CAPTACIÓN
${SITE_NAME} · ${SITE_URL}
${fechaCorta()}

Hola ${input.nombre || "cliente"},

Este no es un presupuesto de página web. Es la propuesta de un sistema digital de captación
para que tu negocio aparezca, reciba solicitudes y cierre alquileres o servicios en piloto
automático.

1 · TU SITUACIÓN
  - Sector:   ${sectorL}
  - Servicio: ${input.servicio}
  - Zona:     ${input.zona}

2 · LO QUE CONSTRUIMOS PARA TI
  - Identidad de marca básica + perfiles digitales (Google Business, Instagram, Facebook,
    WhatsApp Business).
  - Landing orientada a conversión con tu servicio, zona, precio y prueba social.
  - Sistema de reservas con calendario, pagos y notificaciones automáticas.
  - Analítica para ver qué canal trae cada cliente.
  - Estructura inicial de campañas en Google Ads lista para activar.

3 · INVERSIÓN
  - Puesta en marcha (pago único): ${setup} + IVA
  - Gestión y captación (mensual): ${mensual} + IVA / mes
  - Inversión publicitaria inicial recomendada: ${pub} (a pagar directamente a Google)

  IVA no incluido. Publicidad, dominios y transportes se facturan siempre aparte.

4 · GARANTÍA DE CAPTACIÓN
  Si tras un mes completo de gestión no se alcanza el objetivo acordado, prolongamos la
  gestión sin honorarios hasta alcanzarlo, conforme a las condiciones del contrato.
  Fase de validación de 30 días: medimos antes de prometer.

5 · BONO CLIENTE FUNDADOR
  Eres uno de los primeros clientes de tu sector.${input.motivo ? " " + input.motivo + "." : ""}
  Eso nos importa: preferimos construir contigo un caso de éxito desde el primer día, con
  una relación a largo plazo, en vez de regalar el trabajo.
  Las condiciones de esta propuesta quedan garantizadas para las fases aquí descritas.

SIGUIENTE PASO
  Reservar llamada con la dirección (30 min):
  ${input.enlaceLlamada}

  Si encaja, firmamos el contrato y arrancamos en 7 días.

—
${SITE_NAME}
${SITE_URL}
Propuesta generada el ${fechaCorta()}. Validez: 14 días.`;

  return { html, texto };
}
