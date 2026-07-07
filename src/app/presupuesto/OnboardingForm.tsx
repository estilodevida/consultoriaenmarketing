"use client";

import { useMemo, useState } from "react";
import {
  Button,
} from "@/components/ui/button";
import {
  calcularPresupuesto,
  emptyAnswers,
  formatEUR,
  OnboardingAnswers,
  PRICES,
  Quote,
  SOCIAL_PROFILES,
  SocialProfileId,
  WebType,
  YesNo,
} from "@/lib/tariff";
import { CheckCircle, Loader2, Send, ShieldCheck } from "lucide-react";

type SubmitResult =
  | { ok: true; quote: Quote; answers: OnboardingAnswers }
  | { ok: false; error: string };

export function OnboardingForm() {
  const [answers, setAnswers] = useState<OnboardingAnswers>(emptyAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const quote = useMemo(() => calcularPresupuesto(answers), [answers]);

  const set = <K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K]
  ) => setAnswers((prev) => ({ ...prev, [key]: value }));

  const toggleRed = (id: SocialProfileId) =>
    setAnswers((prev) => ({
      ...prev,
      redesSociales: prev.redesSociales.includes(id)
        ? prev.redesSociales.filter((r) => r !== id)
        : [...prev.redesSociales, id],
    }));

  const contactoValido =
    answers.nombre.trim() && /\S+@\S+\.\S+/.test(answers.email);
  const tipoWebValido = answers.tipoWeb !== null;
  const puedeEnviar = Boolean(contactoValido && tipoWebValido);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEnviar || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, error: data?.error || "Error al enviar." });
      } else {
        setResult({ ok: true, quote, answers });
      }
    } catch {
      setResult({ ok: false, error: "No se pudo conectar. Inténtalo de nuevo." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <SuccessCard quote={result.quote} email={result.answers.email} />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sección: Contacto */}
      <Section
        n={1}
        title="Tus datos de contacto"
        subtitle="Para enviarte el presupuesto y coordinar el siguiente paso."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre y apellidos *" required>
            <input
              className={inputCls}
              value={answers.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </Field>
          <Field label="Email *" required>
            <input
              type="email"
              className={inputCls}
              value={answers.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Teléfono">
            <input
              type="tel"
              className={inputCls}
              value={answers.telefono}
              onChange={(e) => set("telefono", e.target.value)}
              placeholder="+34 600 000 000"
              autoComplete="tel"
            />
          </Field>
          <Field label="Empresa / negocio">
            <input
              className={inputCls}
              value={answers.empresa}
              onChange={(e) => set("empresa", e.target.value)}
              placeholder="Nombre de tu empresa (opcional)"
              autoComplete="organization"
            />
          </Field>
        </div>
      </Section>

      {/* Sección: Infraestructura */}
      <Section
        n={2}
        title="Dominio, hosting y logo"
        subtitle="Indica qué tienes ya y qué necesitamos gestionar."
      >
        <YesNoQuestion
          label="¿Tienes dominio?"
          help="Si no, lo registramos por ti."
          value={answers.tieneDominio}
          onChange={(v) => set("tieneDominio", v)}
          siExtra={
            <Field label="Indica tu dominio">
              <input
                className={inputCls}
                value={answers.dominioActual}
                onChange={(e) => set("dominioActual", e.target.value)}
                placeholder="midominio.com"
              />
            </Field>
          }
          noPrice={`Registro +${formatEUR(PRICES.dominioRegistroAnual)}/año`}
        />

        <YesNoQuestion
          label="¿Tienes servidor / hosting?"
          help="Si no, configuramos un VPS gestionado."
          value={answers.tieneServidor}
          onChange={(v) => set("tieneServidor", v)}
          siExtra={
            <Field label="Acceso (usuario / SSH / panel)">
              <input
                className={inputCls}
                value={answers.accesoServidor}
                onChange={(e) => set("accesoServidor", e.target.value)}
                placeholder="Indica cómo nos das acceso (te pediremos credenciales por canal seguro)"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                No escribas contraseñas aquí. Te indicaremos cómo enviarlas de forma segura.
              </p>
            </Field>
          }
          noPrice={`VPS +${formatEUR(PRICES.hostingVpsAnual)}/año`}
        />

        <YesNoQuestion
          label="¿Tienes logo?"
          help="Si no, lo diseñamos."
          value={answers.tieneLogo}
          onChange={(v) => set("tieneLogo", v)}
          siExtra={
            <Field label="¿Cómo nos lo harás llegar?">
              <input
                className={inputCls}
                value={answers.notasLogo}
                onChange={(e) => set("notasLogo", e.target.value)}
                placeholder="Lo subiré por email / drive / etc."
              />
            </Field>
          }
          noPrice={`Diseño +${formatEUR(PRICES.logoDiseno)}`}
        />
      </Section>

      {/* Sección: Tipo de web */}
      <Section n={3} title="Tipo de web" subtitle="Selecciona la opción que necesitas.">
        <div className="grid sm:grid-cols-2 gap-4">
          <ChoiceCard
            active={answers.tipoWeb === "basica"}
            onClick={() => set("tipoWeb", "basica" as WebType)}
            title="Web básica"
            price={formatEUR(PRICES.webBasica)}
            desc="Sitio corporativo o de presentación. Ideal para servicios y portfolios."
          />
          <ChoiceCard
            active={answers.tipoWeb === "ecommerce"}
            onClick={() => set("tipoWeb", "ecommerce" as WebType)}
            title="Tienda ecommerce"
            price={formatEUR(PRICES.ecommerce)}
            desc="Tienda online completa con catálogo y pasarela de pago."
          />
        </div>
      </Section>

      {/* Sección: Catálogo (condicional a ecommerce, pero permitido en básica) */}
      {answers.tipoWeb === "ecommerce" && (
        <Section
          n={4}
          title="Catálogo"
          subtitle="¿Tienes productos que importar o crear?"
        >
          <YesNoQuestion
            label="¿Hay catálogo a importar?"
            help="Adaptación de tu catálogo existente (+ creación de artículos si hace falta)."
            value={answers.tieneCatalogo}
            onChange={(v) => set("tieneCatalogo", v)}
            siExtra={
              <Field label="¿Cuántos artículos hay que crear?">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={answers.numArticulosCrear || ""}
                  onChange={(e) =>
                    set("numArticulosCrear", Math.max(0, Number(e.target.value) || 0))
                  }
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatEUR(PRICES.catalogoImportacion)} de adaptación +{" "}
                  {formatEUR(PRICES.catalogoArticuloExtra)}/artículo creado.
                </p>
              </Field>
            }
            noPrice="Sin catálogo"
          />
        </Section>
      )}

      {/* Sección: Extras */}
      <Section n={answers.tipoWeb === "ecommerce" ? 5 : 4} title="Extras" subtitle="SEO y presencia en redes.">
        <YesNoQuestion
          label="¿Añadimos SEO?"
          help="Auditoría y setup SEO inicial."
          value={answers.anadeSeo}
          onChange={(v) => set("anadeSeo", v)}
          noPrice="Sin SEO"
          siPrice={`Plus SEO +${formatEUR(PRICES.plusSeo)}`}
          siPriceNote="importe orientativo, sujeto a confirmación"
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">¿Qué perfiles de redes sociales creamos?</p>
          <p className="text-xs text-muted-foreground">
            {formatEUR(PRICES.socialPorPerfil)} por cada perfil. Selecciona los que quieras.
          </p>
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            {SOCIAL_PROFILES.map((p) => {
              const active = answers.redesSociales.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleRed(p.id)}
                  aria-pressed={active}
                  className={chipCls(active)}
                >
                  <span className="font-medium">{p.label}</span>
                  <span className="block text-xs opacity-70 mt-0.5 text-left">
                    {p.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Sección: Notas */}
      <Section n={answers.tipoWeb === "ecommerce" ? 6 : 5} title="Algo más que debamos saber" subtitle="Opcional.">
        <textarea
          className={`${inputCls} min-h-[100px]`}
          value={answers.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Objetivos, referencias, plazos, sector..."
        />
      </Section>

      {/* Resumen + envío */}
      <div className="rounded-xl border bg-card p-5 md:p-6 space-y-4">
        <LiveQuote quote={quote} />

        {result && !result.ok && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={!puedeEnviar || isSubmitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Solicitar presupuesto
              </>
            )}
          </Button>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Sin compromiso. Respuesta en menos de 24h.
          </span>
          {!puedeEnviar && (
            <span className="text-xs text-muted-foreground">
              Completa nombre, email y tipo de web para continuar.
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

// ---------- Subcomponentes ----------

const inputCls =
  "w-full rounded-lg border bg-input/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

function Section({
  n,
  title,
  subtitle,
  children,
}: {
  n: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 md:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-sm font-semibold border border-accent/30">
          {n}
        </span>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
    </label>
  );
}

function YesNoQuestion({
  label,
  help,
  value,
  onChange,
  siExtra,
  siPrice,
  noPrice,
  siPriceNote,
}: {
  label: string;
  help?: string;
  value: YesNo;
  onChange: (v: YesNo) => void;
  siExtra?: React.ReactNode;
  siPrice?: string;
  noPrice?: string;
  siPriceNote?: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {help && <p className="text-xs text-muted-foreground">{help}</p>}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("si")}
          aria-pressed={value === "si"}
          className={ynCls(value === "si")}
        >
          Sí
          {siPrice && (
            <span className="block text-[10px] opacity-70 mt-0.5">{siPrice}</span>
          )}
          {siPriceNote && value === "si" && (
            <span className="block text-[10px] text-accent/80 mt-0.5">
              {siPriceNote}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onChange("no")}
          aria-pressed={value === "no"}
          className={ynCls(value === "no")}
        >
          No
          {noPrice && (
            <span className="block text-[10px] opacity-70 mt-0.5">{noPrice}</span>
          )}
        </button>
      </div>
      {value === "si" && siExtra && <div className="pt-1">{siExtra}</div>}
    </div>
  );
}

function ynCls(active: boolean): string {
  const base =
    "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all text-left";
  return active
    ? `${base} border-accent bg-accent/10 text-accent`
    : `${base} bg-input/30 hover:border-accent/50`;
}

function chipCls(active: boolean): string {
  const base =
    "rounded-lg border px-3 py-2 text-sm transition-all text-left";
  return active
    ? `${base} border-accent bg-accent/10 text-accent`
    : `${base} bg-input/30 hover:border-accent/50`;
}

function ChoiceCard({
  active,
  onClick,
  title,
  price,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  price: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-xl border p-4 transition-all ${
        active
          ? "border-accent bg-accent/10 ring-1 ring-accent"
          : "bg-input/20 hover:border-accent/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{title}</span>
        <span className="text-accent font-semibold">{price}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </button>
  );
}

function LiveQuote({ quote }: { quote: Quote }) {
  if (quote.lineas.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Tu presupuesto aparecerá aquí a medida que respondas.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Resumen
        </h3>
        <span className="text-xs text-muted-foreground">
          {quote.lineas.length} concepto(s)
        </span>
      </div>
      <ul className="space-y-1 text-sm">
        {quote.lineas.map((l) => (
          <li key={l.key} className="flex justify-between gap-3">
            <span className="text-muted-foreground">
              {l.concepto}
              {l.cantidad && l.cantidad > 1 ? ` (×${l.cantidad})` : ""}
              {l.recurrente === "anual" ? " · anual" : ""}
            </span>
            <span className="font-medium whitespace-nowrap">
              {formatEUR(l.subtotal)}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-border pt-2 mt-2 space-y-1 text-sm">
        {quote.totalAnual > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Setup único</span>
            <span>{formatEUR(quote.totalUnico)}</span>
          </div>
        )}
        {quote.totalAnual > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Anual recurrente</span>
            <span>{formatEUR(quote.totalAnual)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline">
          <span className="font-semibold">Total estimado</span>
          <span className="text-2xl font-bold text-accent">
            {formatEUR(quote.total)}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Importe orientativo. IVA no incluido.
          {quote.inputsPendientes.length > 0 && (
            <> Te pediremos {quote.inputsPendientes.length} dato(s) adicional(es).</>
          )}
        </p>
      </div>
    </div>
  );
}

function SuccessCard({ quote, email }: { quote: Quote; email: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border bg-card">
      <CheckCircle className="h-12 w-12 text-accent mb-4" />
      <h3 className="text-xl font-semibold mb-2">¡Presupuesto enviado!</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Hemos enviado el desglose a <strong className="text-foreground">{email}</strong>.
        Te contactaremos en menos de 24 horas.
      </p>
      <div className="w-full max-w-sm rounded-lg border bg-input/20 p-4">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Total estimado</span>
          <span className="text-2xl font-bold text-accent">
            {formatEUR(quote.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
