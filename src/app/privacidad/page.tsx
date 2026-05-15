import type { Metadata } from "next";
import { siteConfig } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Cookie, Mail, Database, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: `Política de privacidad de ${siteConfig.name}. Cumplimiento del RGPD y LOPDGDD. Información sobre tratamiento de datos, cookies y derechos del usuario.`,
};

interface Section {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string[];
}

function renderParagraph(text: string, i: number) {
  const boldPrefixes = [
    "Datos de", "Gestionar", "Consentimiento", "Ejecución",
    "Interés", "Cumplimiento", "Acceso", "Rectificación",
    "Supresión", "Limitación", "Portabilidad", "Oposición",
    "Retirada", "No cedemos", "Todas", "No realizamos",
    "Para ejercer", "También", "Si tienes",
  ];
  const needsBold = boldPrefixes.some((p) => text.startsWith(p));
  const splitAt = text.indexOf(":");

  if (needsBold && splitAt > 0) {
    return (
      <p key={i} className="text-muted-foreground">
        <span className="font-medium text-foreground">{text.slice(0, splitAt)}:</span>
        {text.slice(splitAt + 1)}
      </p>
    );
  }
  return <p key={i} className="text-muted-foreground">{text}</p>;
}

const sections: Section[] = [
  {
    icon: Shield,
    title: "Responsable del Tratamiento",
    content: [
      `El responsable del tratamiento de los datos personales recogidos a través de este sitio web es ${siteConfig.name}, con domicilio en ${siteConfig.address} y correo electrónico de contacto ${siteConfig.email}.`,
    ],
  },
  {
    icon: Database,
    title: "Datos que Recopilamos",
    content: [
      "En Consultoría en Marketing recopilamos únicamente los datos estrictamente necesarios para prestarte nuestros servicios:",
      "Datos de identificación: nombre, apellidos, empresa y cargo.",
      "Datos de contacto: dirección de correo electrónico, teléfono y dirección postal.",
      "Datos de navegación: dirección IP, tipo de navegador, páginas visitadas y tiempo de sesión (a través de cookies).",
      "Datos de comunicación: información que nos proporcionas a través del formulario de contacto, chatbot o correo electrónico.",
    ],
  },
  {
    icon: FileText,
    title: "Finalidad del Tratamiento",
    content: [
      "Tus datos serán tratados con las siguientes finalidades:",
      "Gestionar y responder a tus solicitudes de información o consultas realizadas a través del formulario de contacto o chatbot.",
      "Enviarte comunicaciones comerciales sobre nuestros servicios, siempre que hayas prestado tu consentimiento expreso.",
      "Gestionar la relación contractual si decides contratar nuestros servicios.",
      "Realizar análisis estadísticos anonimizados para mejorar nuestros servicios y la experiencia de usuario.",
      "Cumplir con las obligaciones legales que nos sean aplicables.",
    ],
  },
  {
    icon: UserCheck,
    title: "Base Legal del Tratamiento",
    content: [
      "El tratamiento de tus datos se realiza bajo las siguientes bases legales:",
      "Consentimiento expreso del usuario para el tratamiento de sus datos con fines de contacto y comunicaciones comerciales (art. 6.1.a RGPD).",
      "Ejecución de un contrato o medidas precontractuales cuando solicites información sobre nuestros servicios (art. 6.1.b RGPD).",
      "Interés legítimo del responsable para mejorar nuestros servicios y realizar análisis estadísticos (art. 6.1.f RGPD).",
      "Cumplimiento de obligaciones legales aplicables (art. 6.1.c RGPD).",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies",
    content: [
      "Este sitio web utiliza cookies propias y de terceros para garantizar el correcto funcionamiento del sitio, analizar el tráfico y mejorar tu experiencia de navegación.",
      "Puedes configurar, bloquear o eliminar las cookies en cualquier momento a través de la configuración de tu navegador. Consulta nuestra Política de Cookies para más información.",
      "Las cookies que utilizamos incluyen cookies técnicas necesarias para el funcionamiento del sitio, cookies analíticas para entender cómo utilizas el sitio, y cookies de personalización para recordar tus preferencias.",
    ],
  },
  {
    icon: Mail,
    title: "Derechos del Usuario",
    content: [
      "De acuerdo con el RGPD (Reglamento UE 2016/679) y la LOPDGDD (Ley Orgánica 3/2018), tienes derecho a:",
      "Acceso: solicitar confirmación sobre si estamos tratando tus datos personales y acceder a ellos.",
      "Rectificación: solicitar la corrección de datos inexactos o incompletos.",
      "Supresión: solicitar la eliminación de tus datos cuando ya no sean necesarios para los fines para los que fueron recogidos.",
      "Limitación: solicitar la limitación del tratamiento de tus datos en determinadas circunstancias.",
      "Portabilidad: recibir tus datos en un formato estructurado y de uso común, o solicitar que los transmitamos a otro responsable.",
      "Oposición: oponerte al tratamiento de tus datos para fines de marketing directo o basados en interés legítimo.",
      "Retirada del consentimiento: retirar tu consentimiento en cualquier momento sin que ello afecte a la licitud del tratamiento basado en el consentimiento previo.",
    ],
  },
  {
    icon: Shield,
    title: "Plazo de Conservación",
    content: [
      "Conservaremos tus datos personales durante el tiempo necesario para cumplir con la finalidad para la que fueron recogidos, y durante los plazos legales establecidos. Una vez finalizada la relación, los datos serán bloqueados y conservados únicamente para atender responsabilidades legales durante el período de prescripción aplicable.",
    ],
  },
  {
    icon: Database,
    title: "Destinatarios y Transferencias",
    content: [
      "No cedemos tus datos personales a terceros, salvo obligación legal o cuando sea necesario para la prestación del servicio (por ejemplo, plataformas de hosting, herramientas de email marketing o pasarelas de pago).",
      "Todas las entidades con las que trabajamos cumplen con la normativa de protección de datos y han sido seleccionadas conforme a los estándares de seguridad exigidos por el RGPD.",
      "No realizamos transferencias internacionales de datos fuera del Espacio Económico Europeo sin garantías adecuadas.",
    ],
  },
  {
    icon: Mail,
    title: "Ejercicio de Derechos y Contacto",
    content: [
      `Para ejercer cualquiera de tus derechos, puedes enviar un correo electrónico a ${siteConfig.email} indicando el derecho que deseas ejercer y adjuntando una copia de tu DNI o documento equivalente.`,
      "También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si consideras que no hemos tratado tus datos de acuerdo con la normativa.",
      "Si tienes cualquier duda sobre esta política de privacidad, no dudes en contactarnos a través de los medios indicados en nuestra página de contacto.",
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="outline" className="mb-4">
            Privacidad
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Política de Privacidad
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Transparencia y compromiso con la protección de tus datos personales.
            Cumplimos con el RGPD y la LOPDGDD.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Última actualización: mayo de 2026
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-3 pl-[3.25rem]">
                {section.content.map((text, i) => renderParagraph(text, i))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
