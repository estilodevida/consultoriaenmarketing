import type { Metadata } from "next";
import { services } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, Brain, Layout, TrendingUp, MessageCircle, ArrowRight } from "lucide-react";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Servicios de consultoría en marketing digital, SEO, diseño web, IA y redes sociales.",
};

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="h-8 w-8" />,
  Brain: <Brain className="h-8 w-8" />,
  Layout: <Layout className="h-8 w-8" />,
  TrendingUp: <TrendingUp className="h-8 w-8" />,
  MessageCircle: <MessageCircle className="h-8 w-8" />,
};

export default function ServiciosPage() {
  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-4">
              Servicios
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Todo lo que necesitas para crecer
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Soluciones integrales de marketing digital diseñadas para impulsar tu negocio.
            </p>
          </div>

          <div className="space-y-16">
            {services.map((service, i) => (
              <Card
                key={service.id}
                className={`border bg-card overflow-hidden ${
                  i % 2 === 1 ? "md:border-accent/20" : ""
                }`}
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className={`p-8 md:p-12 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                      {iconMap[service.icon]}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl mb-3">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                    <ul className="mt-6 space-y-3">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm text-muted-foreground"
                        >
                          <span className="text-accent mt-0.5">&#x2713;</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/presupuesto">
                      <Button className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
                        Solicitar Presupuesto
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div
                    className={`bg-muted/30 p-8 md:p-12 flex items-center justify-center ${
                      i % 2 === 1 ? "md:order-1" : ""
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-4">
                        {service.icon === "Target" && "🎯"}
                        {service.icon === "Brain" && "🧠"}
                        {service.icon === "Layout" && "🖥️"}
                        {service.icon === "TrendingUp" && "📈"}
                        {service.icon === "MessageCircle" && "💬"}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {service.features.length} servicios incluidos
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  );
}
