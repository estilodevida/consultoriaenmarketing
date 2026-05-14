import { NextResponse } from "next/server";
import { services, faqs, siteConfig } from "@/lib/content";

const systemPrompt = `Eres un asistente virtual de la agencia "${siteConfig.name}". 
Tu personalidad es profesional, cercana y servicial. Ayudas a los visitantes del sitio web con:

1. Información sobre nuestros servicios de consultoría en marketing
2. Generación de presupuestos personalizados
3. Responder preguntas frecuentes
4. Calificar leads (entender qué necesita el cliente)
5. Agendar consultorías gratuitas

Servicios disponibles:
${services.map((s) => `- ${s.title}: ${s.description}`).join("\n")}

Preguntas frecuentes:
${faqs.map((f) => `- Q: ${f.question}\n  A: ${f.answer}`).join("\n")}

Sé conciso pero completo. Si el usuario muestra interés en contratar un servicio, 
anímalo a solicitar un presupuesto formal. Si pregunta por precios, indica que cada 
proyecto es personalizado y que podemos darle un presupuesto exacto tras una breve consulta.

NUNCA inventes información que no esté en el contexto. Si no sabes algo, 
indica que te pondrás en contacto con el equipo para responderle.

Responde SIEMPRE en español.`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { response: "Por favor, escribe un mensaje válido." },
        { status: 400 }
      );
    }

    const context = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Check for API key
    let response: string;

    if (process.env.OPENAI_API_KEY) {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: context,
        max_tokens: 500,
        temperature: 0.7,
      });

      response =
        completion.choices[0]?.message?.content ||
        "Lo siento, no pude procesar tu solicitud. ¿Puedes intentarlo de nuevo?";
    } else {
      // Fallback response without AI API
      response = generateFallbackResponse(message);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        response:
          "Lo siento, tuve un problema técnico. Por favor, intenta de nuevo o escríbenos a " +
          siteConfig.email,
      },
      { status: 500 }
    );
  }
}

function generateFallbackResponse(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("servicio") || msg.includes("hacen") || msg.includes("ofrecen")) {
    return (
      `Ofrecemos los siguientes servicios de consultoría en marketing:\n\n` +
      services
        .map((s) => `🔹 *${s.title}*: ${s.description}`)
        .join("\n\n") +
      `\n\n¿Te gustaría saber más sobre alguno de ellos? Puedo darte más detalles o ayudarte a solicitar un presupuesto personalizado.`
    );
  }

  if (msg.includes("precio") || msg.includes("cuest") || msg.includes("presupuesto") || msg.includes("tarifa") || msg.includes("cost")) {
    return (
      `Cada proyecto es único y lo adaptamos a las necesidades específicas de cada cliente. ` +
      `Para darte un presupuesto preciso, necesito entender mejor tu proyecto.\n\n` +
      `¿Te gustaría solicitar una consultoría gratuita? Así podemos conocer tu negocio y darte ` +
      `un presupuesto personalizado sin compromiso. Puedes hacerlo directamente desde nuestro ` +
      `[formulario de presupuesto](/presupuesto) o contarme más sobre tu proyecto aquí mismo.`
    );
  }

  if (msg.includes("contacto") || msg.includes("hablar") || msg.includes("persona")) {
    return (
      `Puedes contactarnos a través de:\n\n` +
      `📧 Email: ${siteConfig.email}\n` +
      `📞 Teléfono: ${siteConfig.phone}\n` +
      `📍 Dirección: ${siteConfig.address}\n\n` +
      `También puedes dejar tus datos en nuestro [formulario de contacto](/contacto) y te llamaremos lo antes posible.`
    );
  }

  if (msg.includes("hola") || msg.includes("buen") || msg.includes("saludos")) {
    return (
      `¡Hola! 👋 Encantado de saludarte. Soy el asistente virtual de ${siteConfig.name}. ` +
      `¿En qué puedo ayudarte hoy? Puedo informarte sobre nuestros servicios, ayudarte con un ` +
      `presupuesto o resolver cualquier duda que tengas.`
    );
  }

  if (msg.includes("gracias") || msg.includes("vale") || msg.includes("ok")) {
    return (
      `¡De nada! 😊 Si tienes cualquier otra pregunta, no dudes en escribirme. ` +
      `También puedes solicitar una consultoría gratuita en cualquier momento.`
    );
  }

  return (
    `Gracias por tu mensaje. Para poder ayudarte mejor, ¿podrías contarme un poco más sobre ` +
    `lo que necesitas?\n\n` +
    `Por ejemplo, puedes preguntarme sobre:\n` +
    `🔹 Nuestros servicios de marketing digital\n` +
    `🔹 Presupuestos y tarifas\n` +
    `🔹 Cómo contactarnos\n` +
    `🔹 Cómo funciona nuestra metodología de trabajo\n\n` +
    `¡Estoy aquí para ayudarte!`
  );
}
