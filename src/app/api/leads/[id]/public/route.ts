import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/leads/[id]/public
// Devuelve los datos del lead para pre-rellenar el Chatbot en /agendar.
// No requiere auth porque la URL viene firmada con el id del lead (UUID v4
// = entropía suficiente para no ser enumerable). Si en el futuro se
// quiere reforzar, se mete token firmado con expiración.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sb = supabaseAdmin;
  if (!sb) {
    return NextResponse.json({ error: "BD no configurada" }, { status: 500 });
  }
  const r = await sb
    .from("leads")
    .select("id, name, email, phone, metadata, stage")
    .eq("id", params.id)
    .maybeSingle();
  if (!r.data) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }
  const lead = r.data;
  const meta = (lead.metadata || {}) as Record<string, unknown>;
  return NextResponse.json({
    id: lead.id,
    nombre: lead.name,
    email: lead.email,
    telefono: lead.phone,
    sector: meta.sector || null,
    servicio: meta.servicio || null,
    zona: meta.zona || null,
    motivo_sugerido: `Llamada de seguimiento de propuesta (${meta.servicio || "sistema de captación"})`,
  });
}
