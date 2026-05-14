import type { Metadata } from "next";
import { siteConfig } from "@/lib/content";
import { ContactForm } from "./ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Ponte en contacto con Consultoría en Marketing. Estamos en Sevilla para ayudarte.",
};

export default function ContactoPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-4">
            Contacto
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Hablemos de tu proyecto
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Cuéntanos sobre tu negocio y te propondremos la mejor estrategia digital.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="space-y-8">
            <ContactInfo />
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function ContactInfo() {
  const items = [
    { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: Phone, label: "Teléfono", value: siteConfig.phone, href: `tel:${siteConfig.phone}` },
    { icon: MapPin, label: "Ubicación", value: siteConfig.address },
    { icon: Clock, label: "Horario", value: "Lun - Vie: 9:00 - 18:00" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Información de contacto</h2>
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <item.icon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium">{item.label}</div>
            {item.href ? (
              <a
                href={item.href}
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                {item.value}
              </a>
            ) : (
              <div className="text-sm text-muted-foreground">{item.value}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
