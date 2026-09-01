"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MessageCircle, ShieldCheck, Clock } from "lucide-react";

// Página /agendar
// Punto de llegada del enlace enviado en las propuestas CON-191.
// Pre-rellena el Chatbot con los datos del lead (?lead=<uuid>) y un
// motivo de "Llamada de seguimiento de propuesta". El Chatbot detecta
// el lead (vía /api/leads/[id]/public) y abre directamente la fase de chat
// para agendar la llamada con la dirección.
//
// Esta página es client-side porque:
//   1) lee query params del navegador
//   2) rehidrata el chatbot con datos del servidor
//   3) interactúa con localStorage del Chatbot

type LeadPublic = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  sector: string | null;
  servicio: string | null;
  zona: string | null;
  motivo_sugerido: string;
};

export default function AgendarPage() {
  const [lead, setLead] = useState<LeadPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const leadId = url.searchParams.get("lead");
    const utm = url.searchParams.get("utm_source");

    if (!leadId) {
      setError("Falta el parámetro ?lead=<id> en la URL.");
      setLoading(false);
      return;
    }

    // Persistir el lead en localStorage para que el Chatbot lo recoja
    // en su carga inicial (mismo STORAGE_KEY que usa el componente).
    fetch(`/api/leads/${encodeURIComponent(leadId)}/public`)
      .then((r) => {
        if (!r.ok) throw new Error(`Lead no encontrado (${r.status})`);
        return r.json();
      })
      .then((data: LeadPublic) => {
        setLead(data);
        try {
          localStorage.setItem(
            "consultoria_chatbot_lead",
            JSON.stringify({
              name: data.nombre || "",
              email: data.email || "",
              phone: data.telefono || "",
            })
          );
          if (data.motivo_sugerido) {
            sessionStorage.setItem(
              "consultoria_chatbot_motivo_sugerido",
              data.motivo_sugerido
            );
          }
          if (utm) {
            sessionStorage.setItem("consultoria_utm_source", utm);
          }
        } catch {
          // localStorage no disponible: el Chatbot seguirá funcionando,
          // simplemente pedirá los datos manualmente.
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Error desconocido");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#001414] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 text-[#17fbfb] text-xs tracking-[0.18em] uppercase font-bold mb-4">
            <Calendar className="w-4 h-4" />
            Reservar llamada · Propuesta CON-191
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Hablemos de tu propuesta
          </h1>
          <p className="text-lg text-[#ccc3da] max-w-2xl mx-auto">
            30 minutos con la dirección de Consultoría en Marketing para
            revisar la propuesta, resolver dudas y, si encaja, firmar el
            contrato y empezar esta semana.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#0a1f1f] border border-[#1a2a2a] rounded-xl p-5">
            <Clock className="w-5 h-5 text-[#17fbfb] mb-2" />
            <h3 className="font-semibold text-white mb-1">30 minutos</h3>
            <p className="text-sm text-[#ccc3da]">Llamada por Google Meet</p>
          </div>
          <div className="bg-[#0a1f1f] border border-[#1a2a2a] rounded-xl p-5">
            <ShieldCheck className="w-5 h-5 text-[#17fbfb] mb-2" />
            <h3 className="font-semibold text-white mb-1">Sin compromiso</h3>
            <p className="text-sm text-[#ccc3da]">
              Decides después de la llamada
            </p>
          </div>
          <div className="bg-[#0a1f1f] border border-[#1a2a2a] rounded-xl p-5">
            <MessageCircle className="w-5 h-5 text-[#17fbfb] mb-2" />
            <h3 className="font-semibold text-white mb-1">Con la dirección</h3>
            <p className="text-sm text-[#ccc3da]">
              Quien decide, quien firma
            </p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-[#ccc3da]">
            Cargando datos de tu propuesta…
          </div>
        )}

        {error && (
          <div className="bg-red-950/30 border border-red-800 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-red-300 mb-2">
              No podemos localizar tu propuesta
            </h2>
            <p className="text-red-200/80 text-sm mb-4">{error}</p>
            <Link
              href="/contacto"
              className="inline-block bg-[#17fbfb] text-[#001414] font-semibold px-6 py-2 rounded-lg hover:opacity-90"
            >
              Ir al formulario de contacto
            </Link>
          </div>
        )}

        {lead && !loading && !error && (
          <div className="bg-[#0a1f1f] border border-[#1a2a2a] rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-3">
              Datos de tu propuesta
            </h2>
            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[#888]">Nombre</dt>
                <dd className="text-white">{lead.nombre}</dd>
              </div>
              <div>
                <dt className="text-[#888]">Email</dt>
                <dd className="text-white">{lead.email}</dd>
              </div>
              {lead.servicio && (
                <div>
                  <dt className="text-[#888]">Servicio</dt>
                  <dd className="text-white">{lead.servicio}</dd>
                </div>
              )}
              {lead.zona && (
                <div>
                  <dt className="text-[#888]">Zona</dt>
                  <dd className="text-white">{lead.zona}</dd>
                </div>
              )}
            </dl>
            <p className="text-xs text-[#888] mt-4">
              Pulsa el botón de chat abajo a la derecha. Ya tienes los datos
              rellenos: solo te queda proponer el día y la hora que mejor te
              vengan.
            </p>
          </div>
        )}

        <footer className="text-center text-xs text-[#888] pt-8 border-t border-[#1a2a2a]">
          <a
            href="https://consultoriaenmarketing.com"
            className="text-[#17fbfb] hover:underline"
          >
            consultoriaenmarketing.com
          </a>
          {" · "}
          <Link href="/privacidad" className="hover:underline">
            Política de privacidad
          </Link>
        </footer>
      </div>
    </div>
  );
}
