import type { Metadata } from "next";
import { OnboardingForm } from "./OnboardingForm";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calculator, Zap, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Onboarding y presupuesto",
  description:
    "Configura tu proyecto y recibe un presupuesto detallado al instante. Sin compromiso.",
};

export default function PresupuestoPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_minmax(0,640px)] gap-12 max-w-6xl mx-auto items-start">
          <div className="lg:sticky lg:top-24">
            <Badge variant="outline" className="mb-4">
              Onboarding + calculadora
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Configura tu proyecto y recibe tu presupuesto al instante
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Responde unas preguntas y verás el presupuesto actualizarse en
              tiempo real. Al enviar, recibes el desglose por email y dejamos
              todo listo para arrancar.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: Calculator,
                  title: "Cálculo en tiempo real",
                  desc: "El total se actualiza según tus respuestas.",
                },
                {
                  icon: Zap,
                  title: "Desglose detallado",
                  desc: "Cada línea con su precio. Sin sorpresas.",
                },
                {
                  icon: ShieldCheck,
                  title: "Sin compromiso",
                  desc: "Solo es una estimación. Lo confirmamos contigo.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <item.icon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-lg border border-border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">¿Cómo sigue esto?</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Al enviar, un agente de la agencia recibe tus datos estructurados
                y prepara el proyecto. Te contactamos en menos de 24h para cerrar
                detalles.
              </p>
            </div>
          </div>

          <OnboardingForm />
        </div>
      </div>
    </section>
  );
}
