import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/content";

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

    // Store in database or send email
    // For MVP, log to console
    console.log(`[${type || "contact"}] New submission from ${name} (${email}):`, {
      phone,
      service,
      message,
    });

    // TODO: Send email notification
    // TODO: Store in Supabase

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
