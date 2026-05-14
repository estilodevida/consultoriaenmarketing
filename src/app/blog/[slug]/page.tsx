import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { CTA } from "@/components/sections/CTA";

const posts = {
  "marketing-con-ia-guia-2026": {
    title: "Marketing con IA: Guía completa para 2026",
    date: "2026-05-10",
    category: "Marketing IA",
    readTime: "8 min",
    content: `
      La inteligencia artificial ha dejado de ser una promesa del futuro para convertirse en una herramienta esencial del marketing digital. En 2026, las empresas que no integren IA en sus estrategias de marketing simplemente no podrán competir.

      ## ¿Por qué la IA es clave en el marketing actual?

      La IA permite procesar grandes volúmenes de datos en tiempo real, identificar patrones que serían imposibles de detectar manualmente y automatizar decisiones complejas. Esto se traduce en campañas más efectivas, mayor personalización y un ROI significativamente mejor.

      ### Personalización a escala

      Una de las mayores ventajas de la IA es la capacidad de personalizar la experiencia de cada usuario de manera individual. Desde recomendaciones de productos hasta contenido dinámico en tu web, la IA permite que cada visitante tenga una experiencia única adaptada a sus intereses y comportamiento.

      ### Automatización inteligente

      Los chatbots con IA, como el que ofrecemos en nuestros servicios, pueden atender a tus clientes 24/7, resolver dudas comunes, calificar leads e incluso generar presupuestos automáticamente. Esto libera a tu equipo para que se concentre en tareas de mayor valor.

      ## Cómo implementar IA en tu estrategia de marketing

      1. **Audita tus datos**: Antes de implementar IA, necesitas tener datos de calidad. Revisa qué datos estás recopilando y cómo los estás almacenando.
      2. **Define objetivos claros**: La IA no es un fin en sí misma. Define qué problemas quieres resolver: ¿mejorar atención al cliente? ¿aumentar conversiones? ¿personalizar campañas?
      3. **Empieza con un piloto**: No intentes implementar todo a la vez. Comienza con un caso de uso concreto, como un chatbot o un sistema de recomendaciones.
      4. **Mide y optimiza**: La IA aprende de los datos. Cuanto más la uses, mejores resultados obtendrá.

      ## El futuro del marketing con IA

      En los próximos años, veremos una integración aún más profunda de la IA en todas las facetas del marketing. Desde la generación de contenido automatizada hasta la predicción de comportamientos de compra, las posibilidades son prácticamente ilimitadas.

      En Consultoría en Marketing, te ayudamos a navegar esta transformación. Te acompañamos en cada paso del proceso para que puedas aprovechar todo el potencial de la IA en tu negocio.
    `,
  },
  "seo-2026-tendencias": {
    title: "SEO 2026: Las tendencias que definirán el posicionamiento web",
    date: "2026-05-05",
    category: "SEO",
    readTime: "6 min",
    content: `
      El SEO sigue siendo uno de los canales más rentables para atraer tráfico cualificado, pero está en constante evolución. Te contamos las tendencias que marcarán el SEO en 2026.

      ## Búsqueda por voz e IA generativa

      Con el crecimiento de asistentes como ChatGPT, Google Gemini y la búsqueda por voz, optimizar para consultas conversacionales es más importante que nunca. Las keywords de cola larga y el contenido que responde preguntas específicas ganarán protagonismo.

      ## Experiencia de usuario (UX) como factor SEO

      Google sigue priorizando la experiencia de usuario. Core Web Vitals, velocidad de carga, diseño responsive y navegación intuitiva son factores determinantes para el posicionamiento.

      ## Contenido de calidad y E-E-A-T

      La experiencia, expertise, autoridad y confiabilidad (E-E-A-T) son más importantes que nunca. Google premia el contenido original, bien investigado y escrito por expertos reales.

      ## SEO local

      Para negocios con presencia física, el SEO local es imprescindible. Optimizar tu perfil de Google Business, conseguir reseñas positivas y tener presencia en directorios locales marcará la diferencia.

      ## Cómo prepararte para el SEO de 2026

      - Invierte en contenido de calidad y original
      - Optimiza la velocidad y experiencia de usuario
      - Implementa datos estructurados (schema markup)
      - Construye autoridad mediante backlinks de calidad
      - No descuides el SEO técnico
    `,
  },
  "chatbots-para-negocios": {
    title: "Por qué tu negocio necesita un chatbot con IA",
    date: "2026-04-28",
    category: "IA",
    readTime: "5 min",
    content: `
      Los chatbots con inteligencia artificial se han convertido en una herramienta imprescindible para cualquier negocio que quiera ofrecer una experiencia de cliente excepcional.

      ## Beneficios de tener un chatbot con IA

      ### Atención 24/7
      Un chatbot nunca duerme, nunca se toma vacaciones y nunca tiene un mal día. Tus clientes pueden obtener respuestas inmediatas a cualquier hora del día o de la noche.

      ### Reducción de costes
      Los chatbots pueden manejar hasta el 80% de las consultas rutinarias, liberando a tu equipo de soporte para que se concentre en issues más complejos.

      ### Generación de leads cualificados
      Un chatbot bien configurado no solo responde preguntas, sino que puede calificar leads, recopilar información de contacto e incluso generar presupuestos automáticos.

      ### Mejora continua
      Los chatbots con IA aprenden de cada interacción. Con el tiempo, se vuelven más precisos, más útiles y capaces de manejar consultas más complejas.

      ## ¿Qué puede hacer un chatbot por tu negocio?

      - Responder preguntas frecuentes automáticamente
      - Calificar y capturar leads
      - Generar presupuestos personalizados
      - Programar citas y reuniones
      - Integrarse con WhatsApp y otras plataformas
      - Proporcionar análisis de conversaciones

      En Consultoría en Marketing, desarrollamos chatbots inteligentes personalizados para cada negocio. Integramos IA de última generación para que puedas ofrecer una experiencia de cliente excepcional sin incrementar tus costes operativos.
    `,
  },
  "diseno-web-conversiones": {
    title: "Diseño web orientado a conversiones: Guía práctica",
    date: "2026-04-20",
    category: "Diseño Web",
    readTime: "7 min",
    content: `
      Tu web es la puerta de entrada a tu negocio. Cada elemento debe estar diseñado con un propósito: convertir visitantes en clientes.

      ## Principios del diseño web convertible

      ### 1. Claridad sobre creatividad
      Un diseño bonito pero confuso no convierte. La jerarquía visual debe guiar al usuario de forma natural hacia la acción que deseas que realice.

      ### 2. Velocidad de carga
      Cada segundo de retraso reduce las conversiones en un 7%. Optimizar imágenes, usar lazy loading y elegir un buen hosting son inversiones que se pagan solas.

      ### 3. Llamadas a la acción (CTAs) efectivas
      Tus CTAs deben ser visibles, claras y convincentes. Usa verbos de acción, crea urgencia y asegúrate de que contrasten con el resto del diseño.

      ### 4. Prueba social
      Testimonios, casos de éxito, logotipos de clientes y estadísticas generan confianza y reducen la fricción en la decisión de compra.

      ### 5. Diseño responsive
      Más del 60% del tráfico web proviene de dispositivos móviles. Tu web debe funcionar perfectamente en cualquier dispositivo.

      ## Elementos clave de una landing page que convierte

      1. **Headline potente**: Capta la atención en segundos
      2. **Subheadline informativo**: Explica el beneficio principal
      3. **Hero visual**: Imagen o vídeo que muestre el producto/servicio
      4. **Beneficios claros**: Qué gana el usuario
      5. **Prueba social**: Testimonios y estadísticas
      6. **CTA principal**: Visible y atractiva
      7. **Formulario simple**: Solo pide la información esencial

      En Consultoría en Marketing, diseñamos y desarrollamos sitios web profesionales optimizados para conversión. Cada proyecto es único y está respaldado por datos y mejores prácticas.
    `,
  },
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const post = posts[slug as keyof typeof posts];
  if (!post) return { title: "Post no encontrado" };
  return {
    title: post.title,
    description: post.content.slice(0, 160).replace(/[#\n]/g, " ").trim(),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const post = posts[slug as keyof typeof posts];

  if (!post) {
    notFound();
  }

  return (
    <>
      <article className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="text-sm text-muted-foreground">
                {post.readTime} de lectura
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {post.title}
            </h1>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {post.content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-2xl font-bold mt-10 mb-4">
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("### ")) {
                return (
                  <h3 key={i} className="text-xl font-semibold mt-8 mb-3">
                    {line.replace("### ", "")}
                  </h3>
                );
              }
              if (line.trim() === "") return <br key={i} />;
              if (line.startsWith("- ")) {
                return (
                  <li key={i} className="text-muted-foreground ml-4">
                    {line.replace("- ", "")}
                  </li>
                );
              }
              if (/^\d+\./.test(line)) {
                return (
                  <li key={i} className="text-muted-foreground ml-4 list-decimal">
                    {line.replace(/^\d+\.\s*/, "")}
                  </li>
                );
              }
              return (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                  {line}
                </p>
              );
            })}
          </div>

          <div className="mt-12 p-6 rounded-xl border bg-card">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">¿Quieres aplicar estas ideas en tu negocio?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              En Consultoría en Marketing te ayudamos a implementar estrategias digitales
              que generan resultados reales. Solicita una consultoría gratuita.
            </p>
            <Link href="/presupuesto">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                Solicitar Consultoría Gratis
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
