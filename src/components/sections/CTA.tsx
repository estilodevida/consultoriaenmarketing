import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-8 md:p-16 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight">
              ¿Listo para transformar tu negocio?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
                Solicita una consultoría gratuita y descubre cómo podemos ayudarte a alcanzar tus objetivos digitales.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/presupuesto">
                <Button size="lg" variant="secondary" className="px-8 text-base">
                  Consultoría Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contacto">
                <Button size="lg" variant="outline" className="px-8 text-base border-primary-foreground/20 text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Hablar con nosotros
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
