// Modelo de tarifa y motor de cálculo de presupuesto de onboarding.
// Precios en EUR (IVA no incluido). Precios fijados por el cliente (CON-180).
// Si necesitas cambiar un importe, edita la constante correspondiente aquí
// y el formulario + el desglose se actualizan automáticamente.

export type YesNo = "si" | "no" | null;
export type WebType = "basica" | "ecommerce" | null;

export type SocialProfileId =
  | "youtube"
  | "instagram"
  | "seo-local-google"
  | "facebook"
  | "otros";

export interface SocialProfileOption {
  id: SocialProfileId;
  label: string;
  description: string;
}

export const SOCIAL_PROFILES: SocialProfileOption[] = [
  {
    id: "youtube",
    label: "YouTube",
    description: "Canal de YouTube optimizado + imagen de marca",
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Perfil de empresa optimizado + plantilla de contenidos",
  },
  {
    id: "seo-local-google",
    label: "SEO local Google",
    description: "Ficha de Google Business Profile optimizada",
  },
  {
    id: "facebook",
    label: "Facebook",
    description: "Página de empresa + configuración de negocio",
  },
  {
    id: "otros",
    label: "Otros",
    description: "TikTok, LinkedIn, X, etc. (especifica en notas)",
  },
];

// Precios base (EUR). Centralizados para mantener una sola fuente de verdad.
export const PRICES = {
  dominioRegistroAnual: 15, // €/año (registro si NO tiene dominio)
  hostingVpsAnual: 150, // €/año (VPS si NO tiene servidor)
  logoDiseno: 60, // € (diseño si NO tiene logo)
  webBasica: 200, // €
  ecommerce: 1200, // €
  catalogoImportacion: 150, // € (adaptación)
  catalogoArticuloExtra: 10, // € por artículo creado
  // Plus SEO: el cliente marcó "definir importe" en CON-180.
  // Usamos 300 € como importe por defecto sensible (auditoría + setup SEO).
  // Pendiente de confirmación con el cliente vía CEO (ver CON-182).
  plusSeo: 300, // €
  socialPorPerfil: 25, // € por cada perfil
} as const;

export const PLUS_SEO_PENDIENTE_CONFIRMACION = true;

// Estado del formulario. Todos los campos condicionales son null hasta que
// el cliente responde la pregunta que los muestra.
export interface OnboardingAnswers {
  // Datos de contacto
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;

  // 1. Dominio
  tieneDominio: YesNo; // si "si" -> pedir el dominio
  dominioActual: string; // solo si tieneDominio === "si"
  // 2. Hosting
  tieneServidor: YesNo; // si "si" -> pedir usuario/SSH
  accesoServidor: string; // solo si tieneServidor === "si"
  // 3. Logo
  tieneLogo: YesNo; // si "si" -> pedir que lo suba
  notasLogo: string; // solo si tieneLogo === "si" (cómo lo subirá)

  // 4. Tipo de web
  tipoWeb: WebType;

  // 5. Catálogo (solo relevante para ecommerce, pero puede aplicarse a básica)
  tieneCatalogo: YesNo;
  numArticulosCrear: number; // nº de artículos a crear (× 10 €)

  // 6. SEO
  anadeSeo: YesNo;

  // 7. Redes sociales
  redesSociales: SocialProfileId[];

  // 8. Notas
  notas: string;
}

export const emptyAnswers: OnboardingAnswers = {
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  tieneDominio: null,
  dominioActual: "",
  tieneServidor: null,
  accesoServidor: "",
  tieneLogo: null,
  notasLogo: "",
  tipoWeb: null,
  tieneCatalogo: null,
  numArticulosCrear: 0,
  anadeSeo: null,
  redesSociales: [],
  notas: "",
};

export interface QuoteLine {
  key: string;
  concepto: string;
  detalle?: string;
  cantidad?: number;
  precioUnitario: number;
  subtotal: number;
  // 'anual' indica cuota recurrente (dominio, hosting) para separar one-time vs recurrente.
  recurrente: "anual" | null;
  // 'input' marca las líneas que son peticiones de datos al cliente, sin coste.
  tipo: "servicio" | "input";
}

export interface Quote {
  lineas: QuoteLine[];
  totalUnico: number; // suma de one-time
  totalAnual: number; // suma de cuotas anuales recurrentes
  total: number; // totalUnico + totalAnual (lo que ve el cliente como "total estimado")
  inputsPendientes: string[]; // datos que el cliente debe entregar
}

export function calcularPresupuesto(a: OnboardingAnswers): Quote {
  const lineas: QuoteLine[] = [];
  const inputsPendientes: string[] = [];

  // 1. Dominio
  if (a.tieneDominio === "no") {
    lineas.push({
      key: "dominio",
      concepto: "Registro de dominio",
      detalle: "Gestión de alta de dominio (.es / .com)",
      precioUnitario: PRICES.dominioRegistroAnual,
      subtotal: PRICES.dominioRegistroAnual,
      recurrente: "anual",
      tipo: "servicio",
    });
  } else if (a.tieneDominio === "si") {
    inputsPendientes.push(
      a.dominioActual?.trim()
        ? `Dominio del cliente: ${a.dominioActual.trim()}`
        : "Dominio del cliente (pendiente de indicar)"
    );
  }

  // 2. Hosting
  if (a.tieneServidor === "no") {
    lineas.push({
      key: "hosting",
      concepto: "Hosting VPS (anual)",
      detalle: "Servidor VPS gestionado, 1 año",
      precioUnitario: PRICES.hostingVpsAnual,
      subtotal: PRICES.hostingVpsAnual,
      recurrente: "anual",
      tipo: "servicio",
    });
  } else if (a.tieneServidor === "si") {
    inputsPendientes.push(
      a.accesoServidor?.trim()
        ? `Acceso al servidor del cliente: ${a.accesoServidor.trim()}`
        : "Usuario/SSH del servidor (pendiente de indicar)"
    );
  }

  // 3. Logo
  if (a.tieneLogo === "no") {
    lineas.push({
      key: "logo",
      concepto: "Diseño de logo",
      detalle: "Propuesta de identidad gráfica básica",
      precioUnitario: PRICES.logoDiseno,
      subtotal: PRICES.logoDiseno,
      recurrente: null,
      tipo: "servicio",
    });
  } else if (a.tieneLogo === "si") {
    inputsPendientes.push("Logo del cliente (pendiente de subir)");
  }

  // 4. Tipo de web
  if (a.tipoWeb === "basica") {
    lineas.push({
      key: "web-basica",
      concepto: "Web básica",
      detalle: "Sitio web corporativo/básico",
      precioUnitario: PRICES.webBasica,
      subtotal: PRICES.webBasica,
      recurrente: null,
      tipo: "servicio",
    });
  } else if (a.tipoWeb === "ecommerce") {
    lineas.push({
      key: "ecommerce",
      concepto: "Tienda ecommerce",
      detalle: "Tienda online completa con pasarela de pago",
      precioUnitario: PRICES.ecommerce,
      subtotal: PRICES.ecommerce,
      recurrente: null,
      tipo: "servicio",
    });
  }

  // 5. Catálogo
  if (a.tieneCatalogo === "si") {
    const articulos = Math.max(0, Number(a.numArticulosCrear) || 0);
    lineas.push({
      key: "catalogo-importacion",
      concepto: "Importación / adaptación de catálogo",
      detalle: "Adaptación del catálogo existente",
      precioUnitario: PRICES.catalogoImportacion,
      subtotal: PRICES.catalogoImportacion,
      recurrente: null,
      tipo: "servicio",
    });
    if (articulos > 0) {
      lineas.push({
        key: "catalogo-articulos",
        concepto: "Creación de artículos de catálogo",
        cantidad: articulos,
        detalle: `${articulos} artículo(s) × ${PRICES.catalogoArticuloExtra} €`,
        precioUnitario: PRICES.catalogoArticuloExtra,
        subtotal: articulos * PRICES.catalogoArticuloExtra,
        recurrente: null,
        tipo: "servicio",
      });
    }
  }

  // 6. SEO
  if (a.anadeSeo === "si") {
    lineas.push({
      key: "seo",
      concepto: "Plus SEO",
      detalle: PLUS_SEO_PENDIENTE_CONFIRMACION
        ? "Auditoría + setup SEO inicial (importe pendiente de confirmar)"
        : "Auditoría + setup SEO inicial",
      precioUnitario: PRICES.plusSeo,
      subtotal: PRICES.plusSeo,
      recurrente: null,
      tipo: "servicio",
    });
  }

  // 7. Redes sociales
  if (a.redesSociales.length > 0) {
    lineas.push({
      key: "redes-sociales",
      concepto: "Perfiles de redes sociales",
      cantidad: a.redesSociales.length,
      detalle: `${a.redesSociales
        .map(
          (id) =>
            SOCIAL_PROFILES.find((p) => p.id === id)?.label ?? id
        )
        .join(", ")} · ${a.redesSociales.length} × ${PRICES.socialPorPerfil} €`,
      precioUnitario: PRICES.socialPorPerfil,
      subtotal: a.redesSociales.length * PRICES.socialPorPerfil,
      recurrente: null,
      tipo: "servicio",
    });
  }

  const totalAnual = lineas
    .filter((l) => l.recurrente === "anual")
    .reduce((sum, l) => sum + l.subtotal, 0);
  const totalUnico = lineas
    .filter((l) => l.recurrente === null && l.tipo === "servicio")
    .reduce((sum, l) => sum + l.subtotal, 0);

  return {
    lineas,
    totalUnico,
    totalAnual,
    total: totalUnico + totalAnual,
    inputsPendientes,
  };
}

export function formatEUR(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}
