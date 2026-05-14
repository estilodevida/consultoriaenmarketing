import Link from "next/link";
import { services } from "@/lib/content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Brain, Layout, TrendingUp, MessageCircle, ArrowRight } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="h-6 w-6" />,
  Brain: <Brain className="h-6 w-6" />,
  Layout: <Layout className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  MessageCircle: <MessageCircle className="h-6 w-6" />,
};

export function Servicios() {
  return (
    <section id="servicios" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-4">
            Nuestros Servicios
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Soluciones completas para tu negocio
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cada servicio está diseñado para generar resultados medibles. 
            Combinamos estrategia, tecnología y creatividad para impulsar tu crecimiento.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="group border bg-card hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  {iconMap[service.icon]}
                </div>
                <CardTitle className="mt-4 text-xl">{service.title}</CardTitle>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">&#x2022;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/servicios"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            Ver todos los servicios <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
