import { NextResponse } from "next/server";
import { services, faqs, siteConfig } from "@/lib/content";
import { supabase } from "@/lib/supabase";

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

IMPORTANTE - FLUJO DE CALIFICACIÓN DE LEADS:
Tu objetivo principal es calificar al prospecto. Después de saludar, haz preguntas para entender:
1. ¿Qué tipo de negocio o proyecto tiene?
2. ¿Qué objetivos de marketing busca alcanzar? (más clientes, branding, ventas online, etc.)
3. ¿Qué presupuesto aproximado maneja?
4. ¿En qué plazo necesita resultados?
5. ¿Qué servicios concretos le interesan más de los que ofrecemos?

Haz estas preguntas de forma natural y conversacional, una o dos a la vez. No las sueltes todas de golpe.
Cuando tengas suficiente información, sugiérele agendar una consultoría gratuita o solicitar un presupuesto personalizado.

Sé conciso pero completo. Si el usuario muestra interés en contratar un servicio,
anímalo a solicitar un presupuesto formal. Si pregunta por precios, indica que cada
proyecto es personalizado y que podemos darle un presupuesto exacto tras una breve consulta.

NUNCA inventes información que no esté en el contexto. Si no sabes algo,
indica que te pondrás en contacto con el equipo para responderle.

Responde SIEMPRE en español.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, lead, message, history } = body;

    // --- Save lead action ---
    if (action === "save_lead") {
      if (!lead?.name || !lead?.email || !lead?.phone) {
        return NextResponse.json(
          { error: "Nombre, email y teléfono son requeridos" },
          { status: 400 }
        );
      }

      const { error } = await supabase.from("leads").insert({
        name: lead.name.trim(),
        email: lead.email.trim(),
        phone: lead.phone.trim(),
        source: "chatbot",
        metadata: {},
      });

      if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json(
          { error: "Error al guardar los datos" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // --- Chat action ---
    if (action === "chat") {
      if (!message || typeof message !== "string") {
        return NextResponse.json(
          { response: "Por favor, escribe un mensaje válido." },
          { status: 400 }
        );
      }

      // Build context with lead info for qualification
      const leadContext = lead
        ? `\n\nInformación del prospecto:\n- Nombre: ${lead.name}\n- Email: ${lead.email}\n- Teléfono: ${lead.phone}\n\nUsa esta información para personalizar la conversación. Ya tienes sus datos de contacto, así que no se los pidas de nuevo. Céntrate en calificar sus necesidades.`
        : "";

      const context = [
        { role: "system", content: systemPrompt + leadContext },
        ...(history || []).slice(-10).map(
          (m: { role: string; content: string }) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })
        ),
        { role: "user", content: message },
      ];

      const openAiModel = process.env.LLM_MODEL || "gpt-4o-mini";
      const deepSeekModel = process.env.LLM_MODEL || "deepseek-chat";
      const deepSeekBaseUrl =
        process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com/v1";
      const maxTokens = 500;
      const temperature = 0.7;
      let response: string;

      if (process.env.OPENAI_API_KEY) {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: openAiModel,
          messages: context,
          max_tokens: maxTokens,
          temperature,
        });

        response =
          completion.choices[0]?.message?.content ||
          "Lo siento, no pude procesar tu solicitud. ¿Puedes intentarlo de nuevo?";
      } else if (process.env.DEEPSEEK_API_KEY) {
        const { default: OpenAI } = await import("openai");
        const deepseek = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: deepSeekBaseUrl,
        });

        const completion = await deepseek.chat.completions.create({
          model: deepSeekModel,
          messages: context,
          max_tokens: maxTokens,
          temperature,
        });

        response =
          completion.choices[0]?.message?.content ||
          "Lo siento, no pude procesar tu solicitud. ¿Puedes intentarlo de nuevo?";
      } else {
        // Fallback without AI - includes qualification questions
        response = generateFallbackResponse(message, lead);
      }

      return NextResponse.json({ response });
    }

    return NextResponse.json(
      { error: "Acción no válida" },
      { status: 400 }
    );
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

function generateFallbackResponse(
  message: string,
  lead?: { name: string; email: string; phone: string }
): string {
  const msg = message.toLowerCase();
  const name = lead?.name || "";

  if (
    msg.includes("servicio") ||
    msg.includes("hacen") ||
    msg.includes("ofrecen")
  ) {
    return (
      `Claro${name ? ` ${name.split(" ")[0]}` : ""}, estos son nuestros servicios:\n\n` +
      services
        .map((s) => `🔹 *${s.title}*: ${s.description}`)
        .join("\n\n") +
      `\n\n¿Cuál de ellos te interesa más? Así puedo darte información más detallada.`
    );
  }

  if (
    msg.includes("precio") ||
    msg.includes("cuest") ||
    msg.includes("presupuesto") ||
    msg.includes("tarifa") ||
    msg.includes("cost")
  ) {
    return (
      `Cada proyecto es único y lo adaptamos a las necesidades específicas de cada cliente. ` +
      `Para darte un presupuesto preciso, necesito entender mejor tu proyecto.\n\n` +
      `Cuéntame un poco más: ¿qué tipo de negocio tienes y qué objetivos de marketing te gustaría alcanzar?`
    );
  }

  if (
    msg.includes("contacto") ||
    msg.includes("hablar") ||
    msg.includes("persona")
  ) {
    return (
      `Puedes contactarnos a través de:\n\n` +
      `📧 Email: ${siteConfig.email}\n` +
      `📞 Teléfono: ${siteConfig.phone}\n` +
      `📍 Dirección: ${siteConfig.address}\n\n` +
      `También puedes agendar una consultoría gratuita y te llamamos sin compromiso.`
    );
  }

  if (
    msg.includes("hola") ||
    msg.includes("buen") ||
    msg.includes("saludos")
  ) {
    return (
      `¡Hola${name ? ` ${name.split(" ")[0]}` : ""}! 👋 ` +
      `Para poder ayudarte mejor, cuéntame un poco sobre tu proyecto. ` +
      `¿Qué tipo de negocio tienes y qué te gustaría mejorar en tu marketing?`
    );
  }

  if (msg.includes("gracias") || msg.includes("vale") || msg.includes("ok")) {
    return (
      `¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?` +
      (lead
        ? ` Recuerda que tienes a tu disposición una consultoría gratuita sin compromiso.`
        : "")
    );
  }

  // Default with qualification
  return (
    `Gracias por tu mensaje${name ? ` ${name.split(" ")[0]}` : ""}. Para poder asesorarte mejor, me gustaría conocer:\n\n` +
    `🔹 ¿Qué tipo de negocio o proyecto tienes?\n` +
    `🔹 ¿Qué objetivos de marketing te gustaría alcanzar?\n\n` +
    `Así puedo orientarte hacia el servicio que mejor se adapte a ti. ¡Cuéntame!`
  );
}
