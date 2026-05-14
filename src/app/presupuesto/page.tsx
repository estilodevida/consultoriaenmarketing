import type { Metadata } from "next";
import { BudgetForm } from "./BudgetForm";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Solicitar Presupuesto",
  description: "Solicita un presupuesto personalizado para tu proyecto de marketing digital.",
};

export default function PresupuestoPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <Badge variant="outline" className="mb-4">
              Presupuesto
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Solicita tu presupuesto personalizado
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Cuéntanos sobre tu proyecto y te enviaremos una propuesta detallada
              sin compromiso en menos de 24 horas.
            </p>

            <div className="space-y-4">
              {[
                "Respuesta en menos de 24 horas",
                "Propuesta detallada y personalizada",
                "Sin compromiso",
                "Primera consultoría gratuita",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <BudgetForm />
        </div>
      </div>
    </section>
  );
}
