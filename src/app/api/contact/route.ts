import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, service, message, type } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nombre, email y mensaje son requeridos" },
        { status: 400 }
      );
    }

    // Store in Supabase
    const { error } = await supabase.from("leads").insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      source: type === "presupuesto" ? "presupuesto" : "contacto",
      metadata: {
        service: service || null,
        message: message.trim(),
        submitted_at: new Date().toISOString(),
      },
    });

    if (error) {
      console.error("Contact Supabase error:", error);
      return NextResponse.json(
        { error: "Error al guardar tu solicitud. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        type === "presupuesto"
          ? "¡Gracias! Hemos recibido tu solicitud de presupuesto. Te contactaremos en menos de 24 horas."
          : "¡Gracias por contactarnos! Te responderemos a la mayor brevedad posible.",
    });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json(
      { error: "Error al procesar tu solicitud. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
