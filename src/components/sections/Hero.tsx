import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            Consultoría impulsada por Inteligencia Artificial
          </div>

          <h1 className="animate-fade-in-up-delay-1 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Transformamos tu{" "}
            <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
              presencia digital
            </span>{" "}
            en resultados reales
          </h1>

          <p className="animate-fade-in-up-delay-2 mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estrategia, tecnología y creatividad para hacer crecer tu negocio. 
            Te ayudamos a atraer, convertir y fidelizar clientes con marketing 
            basado en datos e inteligencia artificial.
          </p>

          <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/presupuesto">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 text-base">
                Solicitar Consultoría Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/servicios">
              <Button size="lg" variant="outline" className="px-8 text-base">
                Ver Servicios
              </Button>
            </Link>
          </div>

          <div className="animate-fade-in-up-delay-3 mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>¿Prefieres hablar ahora? </span>
            <button className="font-medium text-accent hover:underline">
              Abre nuestro chatbot
            </button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { number: "150+", label: "Proyectos exitosos" },
            { number: "98%", label: "Satisfacción" },
            { number: "3x", label: "ROI promedio" },
            { number: "24/7", label: "Soporte continuo" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl border bg-background/50 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold text-accent">{stat.number}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
