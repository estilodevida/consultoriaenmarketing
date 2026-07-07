import { NextResponse } from "next/server";
import { services, faqs, siteConfig } from "@/lib/content";
import { supabase } from "@/lib/supabase";
import {
  persistAppointment,
  notifyAppointmentWebhook,
  type ExtractedAppointment,
} from "@/lib/appointment-service";
import { formatAppointmentHuman, resolveTimezone } from "@/lib/appointments";

const DEFAULT_TIMEZONE = resolveTimezone(process.env.CHATBOT_TIMEZONE);

// Hora actual inyectada en el system prompt para que el modelo resuelva
// expresiones relativas ("mañana a las 6", "el viernes que viene") a ISO.
function currentTimeBlock(): string {
  const now = new Date();
  const isoUtc = now.toISOString();
  const humanEs = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DEFAULT_TIMEZONE,
    hour12: false,
  }).format(now);
  return `Hora actual (referencia): ${humanEs} (${DEFAULT_TIMEZONE}). ISO UTC: ${isoUtc}. Hoy es ${new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now)}.`;
}

const systemPrompt = `Eres un asistente virtual de la agencia "${siteConfig.name}".
Tu personalidad es profesional, cercana y servicial. Ayudas a los visitantes del sitio web con:

1. Información sobre nuestros servicios de consultoría en marketing
2. Generación de presupuestos personalizado
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

Responde SIEMPRE en español.

FLUJO DE CITAS (muy importante):
- Cuando llegues a un acuerdo de día y hora con el prospecto para una consultoría gratuita,
  DEBES llamar a la función book_appointment con start_at en ISO 8601 UTC y la duración en minutos.
- Horario laboral de la agencia: lunes a viernes, 9:00 a 19:00 (${DEFAULT_TIMEZONE}).
  Si el cliente propone fuera de ese rango, propón alternativas dentro del horario laboral.
- Las consultorías gratuitas duran por defecto 30 minutos.
- Confirma SIEMPRE verbalmente con el cliente el día y la hora en formato legible ANTES
  de llamar a book_appointment, y vuelve a confirmar la cita agendada en tu respuesta textual.
- Si el cliente pide reagendar o cancelar una cita previa, pídele confirmación y luego
  llama a la función book_appointment con el nuevo start_at y un campo reason que indique "reagendado".`;

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
        ? `\n\nInformación del prospecto:\n- Nombre: ${lead.name}\n- Email: ${lead.email}\n- Teléfono: ${lead.phone}\n\nUsa esta información para personalizar la conversación y para rellenar automáticamente los parámetros de book_appointment. Ya tienes sus datos de contacto, así que no se los pidas de nuevo. Céntrate en calificar sus necesidades.`
        : "";

      const context = [
        { role: "system", content: systemPrompt + leadContext + "\n\n" + currentTimeBlock() },
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

      const bookTool = {
        type: "function" as const,
        function: {
          name: "book_appointment",
          description:
            "Agenda una consultoría gratuita cuando el cliente haya aceptado día y hora. Devuelve start_at en ISO 8601 UTC.",
          parameters: {
            type: "object",
            properties: {
              start_at: {
                type: "string",
                description:
                  "Fecha y hora de inicio en ISO 8601 UTC, ej: 2026-07-10T16:00:00Z para las 18:00 de Madrid.",
              },
              duration_minutes: {
                type: "number",
                description: "Duración en minutos. Por defecto 30.",
              },
              reason: {
                type: "string",
                description: "Motivo o tema de la consultoría en una frase.",
              },
              lead_name: {
                type: "string",
                description: "Nombre del prospecto si no viene en el contexto.",
              },
              lead_email: {
                type: "string",
                description: "Email del prospecto si no viene en el contexto.",
              },
              lead_phone: {
                type: "string",
                description: "Teléfono del prospecto si no viene en el contexto.",
              },
            },
            required: ["start_at"],
          },
        },
      };

      let response: string;
      const appointmentCreated: {
        id: string;
        start_at: string;
        end_at: string;
        timezone: string;
        lead_name: string;
      } = { id: "", start_at: "", end_at: "", timezone: "", lead_name: "" };
      let hasAppointment = false;

      // Helper único para procesar un tool_call book_appointment
      const handleBookToolCall = async (
        args: Record<string, unknown>
      ): Promise<string> => {
        const tz = resolveTimezone(process.env.CHATBOT_TIMEZONE);
        const extracted: ExtractedAppointment = {
          lead_name: String(args.lead_name || lead?.name || "").trim(),
          lead_email: args.lead_email ? String(args.lead_email) : lead?.email || null,
          lead_phone: args.lead_phone ? String(args.lead_phone) : lead?.phone || null,
          start_at: String(args.start_at),
          duration_minutes: args.duration_minutes
            ? Number(args.duration_minutes)
            : undefined,
          timezone: tz,
          reason: args.reason ? String(args.reason) : null,
          raw_extraction: args as Record<string, unknown>,
        };
        const persisted = await persistAppointment(extracted, { source: "chatbot" });
        appointmentCreated.id = persisted.id;
        appointmentCreated.start_at = persisted.start_at;
        appointmentCreated.end_at = persisted.end_at;
        appointmentCreated.timezone = persisted.timezone;
        appointmentCreated.lead_name = persisted.lead_name;
        hasAppointment = true;
        // Fire-and-forget asincrónico pero esperamos para reportar status
        await notifyAppointmentWebhook(persisted);
        const cuando = formatAppointmentHuman(persisted.start_at, persisted.timezone);
        return `Cita confirmada para ${persisted.lead_name} el ${cuando}.`;
      };

      // Procesa tool_calls de OpenAI/DeepSeek, filtrando los que tienen .function
      // (el SDK tipa como unión ChatCompletionMessageCustomToolCall | FunctionToolCall).
      const processToolCalls = async (
        toolCalls: unknown[] | undefined | null
      ): Promise<void> => {
        if (!toolCalls || toolCalls.length === 0) return;
        for (const tc of toolCalls) {
          if (!tc || typeof tc !== "object") continue;
          const fn = (tc as { function?: { name?: string; arguments?: string } }).function;
          if (!fn || fn.name !== "book_appointment") continue;
          try {
            const args = JSON.parse(fn.arguments || "{}");
            await handleBookToolCall(args);
          } catch (err) {
            console.error("[chat] book_appointment error:", err);
            response +=
              "\n\n⚠️ No pude materializar la cita en el sistema. Un miembro del equipo te confirmará manualmente.";
          }
        }
      };

      try {
        if (process.env.OPENAI_API_KEY) {
          const { default: OpenAI } = await import("openai");
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          const completion = await openai.chat.completions.create({
            model: openAiModel,
            messages: context,
            max_tokens: maxTokens,
            temperature,
            tools: [bookTool],
            tool_choice: "auto",
          });

          const msg = completion.choices[0]?.message;
          response =
            msg?.content ||
            "Lo siento, no pude procesar tu solicitud. ¿Puedes intentarlo de nuevo?";

          await processToolCalls(msg?.tool_calls);
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
            tools: [bookTool],
            tool_choice: "auto",
          });

          const msg = completion.choices[0]?.message;
          response =
            msg?.content ||
            "Lo siento, no pude procesar tu solicitud. ¿Puedes intentarlo de nuevo?";

          await processToolCalls(msg?.tool_calls);
        } else {
          // Fallback without AI - includes qualification questions
          response = generateFallbackResponse(message, lead);
        }
      } catch (llmErr) {
        console.error("[chat] LLM error:", llmErr);
        response =
          "Lo siento, tuve un problema técnico procesando tu mensaje. ¿Puedes intentarlo de nuevo?";
      }

      return NextResponse.json({
        response,
        appointment: hasAppointment ? appointmentCreated : null,
      });
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
