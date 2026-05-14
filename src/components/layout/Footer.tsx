import Link from "next/link";
import { siteConfig } from "@/lib/content";
import { Mail, MapPin, Phone, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="text-lg font-bold tracking-tight">{siteConfig.name}</span>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Navegación</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Inicio
              </Link>
              <Link href="/servicios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Servicios
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/contacto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </Link>
              <Link href="/presupuesto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Presupuesto
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Contacto</h4>
            <div className="flex flex-col gap-3">
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" />
                {siteConfig.email}
              </a>
              <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" />
                {siteConfig.phone}
              </a>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {siteConfig.address}
              </span>
              <div className="flex gap-3 mt-2">
                <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
                <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/privacidad" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/cookies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
