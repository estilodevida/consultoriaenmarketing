import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre marketing digital, IA, SEO y estrategia de negocio.",
};

const posts = [
  {
    slug: "marketing-con-ia-guia-2026",
    title: "Marketing con IA: Guía completa para 2026",
    excerpt:
      "Descubre cómo la inteligencia artificial está transformando el marketing digital y cómo puedes aplicarla en tu negocio para obtener resultados extraordinarios.",
    date: "2026-05-10",
    category: "Marketing IA",
    readTime: "8 min",
  },
  {
    slug: "seo-2026-tendencias",
    title: "SEO 2026: Las tendencias que definirán el posicionamiento web",
    excerpt:
      "El SEO sigue evolucionando. Te contamos las tendencias más importantes para 2026 y cómo preparar tu web para los nuevos algoritmos.",
    date: "2026-05-05",
    category: "SEO",
    readTime: "6 min",
  },
  {
    slug: "chatbots-para-negocios",
    title: "Por qué tu negocio necesita un chatbot con IA",
    excerpt:
      "Los chatbots con inteligencia artificial están revolucionando la atención al cliente. Aprende cómo pueden ayudarte a vender más 24/7.",
    date: "2026-04-28",
    category: "IA",
    readTime: "5 min",
  },
  {
    slug: "diseno-web-conversiones",
    title: "Diseño web orientado a conversiones: Guía práctica",
    excerpt:
      "Cada elemento de tu web debe estar diseñado para convertir. Te mostramos las mejores prácticas de diseño web para maximizar tus resultados.",
    date: "2026-04-20",
    category: "Diseño Web",
    readTime: "7 min",
  },
];

export default function BlogPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-4">
            Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Marketing, IA y Estrategia Digital
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Artículos, guías y análisis para mantenerte al día en marketing digital.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full border bg-card hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {post.readTime} de lectura
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-accent">
                      Leer más <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
