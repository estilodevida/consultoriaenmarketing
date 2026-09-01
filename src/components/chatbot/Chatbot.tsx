"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Phone,
  Mail,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
};

type LeadData = {
  name: string;
  email: string;
  phone: string;
};

type Stage = "pre-chat" | "chat";

const STORAGE_KEY = "consultoria_chatbot_lead";

function loadSavedLead(): LeadData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveLead(data: LeadData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage not available
  }
}

const getInitialMessages = (name: string): Message[] => [
  {
    id: "0",
    role: "bot",
    content: `¡Hola ${name}! Gracias por tus datos. Soy el asistente virtual de Consultoría en Marketing. Cuéntame, ¿qué te trae por aquí hoy? Puedo ayudarte con:\n\n🔹 Información sobre nuestros servicios\n🔹 Un presupuesto personalizado\n🔹 Resolver dudas sobre marketing digital\n🔹 Agendar una consultoría gratuita`,
  },
];

// Estilos críticos en línea: blindan el modal frente a cualquier purgado de
// clases utility de Tailwind (CON-201). Las clases de Tailwind se mantienen
// como mejora estética, pero el render del modal no depende de ellas.
const styles = {
  backdrop: {
    position: "fixed" as const,
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex: 9998,
    animation: "cbp-fade-in 0.2s ease-out",
  },
  modal: {
    position: "fixed" as const,
    bottom: 80,
    right: 16,
    zIndex: 9999,
    width: 380,
    maxWidth: "calc(100vw - 2rem)",
    height: "min(560px, calc(100dvh - 120px))",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden" as const,
    backgroundColor: "#0a1e1e",
    color: "#e6fffe",
    border: "1px solid rgba(23, 251, 251, 0.18)",
    borderRadius: 16,
    boxShadow:
      "0 24px 48px rgba(0, 0, 0, 0.55), 0 8px 16px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(23, 251, 251, 0.06)",
    fontFamily: "inherit",
    animation: "cbp-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    background: "linear-gradient(135deg, #7000ff 0%, #3c0090 100%)",
    color: "#ffffff",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    flexShrink: 0,
  },
  headerBrandWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.2,
    display: "block",
  },
  headerSubtitle: {
    fontSize: 11,
    opacity: 0.8,
    display: "block",
    marginTop: 2,
  },
  closeBtn: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "none",
    color: "#ffffff",
    width: 32,
    height: 32,
    borderRadius: 999,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  body: {
    flex: 1,
    overflowY: "auto" as const,
    padding: 20,
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  prechatHeader: {
    textAlign: "center" as const,
    marginBottom: 8,
  },
  prechatIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(142, 253, 0, 0.12)",
    color: "#8efd00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  prechatTitle: {
    fontSize: 16,
    fontWeight: 600,
    margin: "0 0 6px",
  },
  prechatText: {
    fontSize: 13,
    color: "#ccc3da",
    lineHeight: 1.5,
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  formField: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  inputWrap: {
    position: "relative" as const,
  },
  inputIcon: {
    position: "absolute" as const,
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#8a93a8",
    pointerEvents: "none" as const,
  },
  fieldError: {
    fontSize: 12,
    color: "#ffb1c3",
    marginTop: 4,
  },
  submitBtn: {
    width: "100%",
    marginTop: 4,
  },
  privacyText: {
    fontSize: 11,
    color: "#8a93a8",
    textAlign: "center" as const,
    marginTop: 4,
    lineHeight: 1.4,
  },
  privacyLink: {
    color: "#17fbfb",
    textDecoration: "underline",
  },
  messagesWrap: {
    flex: 1,
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
    padding: 4,
  },
  inputArea: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    padding: 12,
    display: "flex",
    gap: 8,
    backgroundColor: "#001414",
    flexShrink: 0,
  },
  fab: {
    position: "fixed" as const,
    bottom: 16,
    right: 16,
    zIndex: 9999,
    width: 56,
    height: 56,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #8efd00 0%, #4c9e00 100%)",
    color: "#001414",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 32px rgba(142, 253, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.35)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  fabNotif: {
    position: "absolute" as const,
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#ffb1c3",
    color: "#000a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 700,
    animation: "cbp-pulse 1.6s ease-in-out infinite",
  },
  fabPulse: {
    position: "absolute" as const,
    inset: 0,
    borderRadius: 999,
    backgroundColor: "#8efd00",
    opacity: 0.25,
    animation: "cbp-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
    pointerEvents: "none" as const,
  },
  typingBubble: {
    display: "flex",
    gap: 4,
    alignItems: "center",
    padding: "10px 12px",
  },
};

const messageRowStyle = (isUser: boolean): React.CSSProperties => ({
  display: "flex",
  gap: 8,
  maxWidth: "85%",
  marginLeft: isUser ? "auto" : 0,
  flexDirection: isUser ? "row-reverse" : "row",
});

const messageAvatarStyle = (kind: "user" | "bot"): React.CSSProperties => ({
  width: 24,
  height: 24,
  borderRadius: 999,
  backgroundColor: kind === "bot" ? "rgba(209, 188, 255, 0.12)" : "rgba(23, 251, 251, 0.12)",
  color: kind === "bot" ? "#d1bcff" : "#17fbfb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  marginTop: 2,
});

const messageBubbleStyle = (isUser: boolean): React.CSSProperties => ({
  borderRadius: 12,
  padding: "8px 12px",
  fontSize: 14,
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  backgroundColor: isUser ? "#17fbfb" : "#001e1e",
  color: isUser ? "#001414" : "#e6fffe",
  border: isUser ? "none" : "1px solid rgba(255, 255, 255, 0.06)",
});

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("pre-chat");
  const [lead, setLead] = useState<LeadData>(() => loadSavedLead() || { name: "", email: "", phone: "" });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<LeadData>>({});
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const validateForm = (): boolean => {
    const errors: Partial<LeadData> = {};
    if (!lead.name.trim()) errors.name = "El nombre es obligatorio";
    if (!lead.email.trim()) {
      errors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      errors.email = "Introduce un email válido";
    }
    if (!lead.phone.trim()) {
      errors.phone = "El teléfono es obligatorio";
    } else if (!/^\+?[\d\s]{7,15}$/.test(lead.phone)) {
      errors.phone = "Introduce un teléfono válido";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSavingLead(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_lead",
          lead: {
            name: lead.name.trim(),
            email: lead.email.trim(),
            phone: lead.phone.trim(),
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar");

      saveLead(lead);
      setStage("chat");
      setChatStarted(true);
      setMessages(getInitialMessages(lead.name.trim()));
    } catch {
      setFormErrors({ email: "Error al guardar. Intenta de nuevo." });
    } finally {
      setIsSavingLead(false);
    }
  };

  const startChatFromSaved = () => {
    setStage("chat");
    setChatStarted(true);
    setMessages(getInitialMessages(lead.name.trim()));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          message: input,
          history: messages.slice(1),
          lead,
        }),
      });

      if (!res.ok) throw new Error("Error");

      const data = await res.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.response,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content:
            "Lo siento, tuve un problema al procesar tu mensaje. ¿Puedes intentarlo de nuevo?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    const savedLead = loadSavedLead();
    if (savedLead?.name && savedLead?.email && savedLead?.phone) {
      setLead(savedLead);
      if (!chatStarted) {
        startChatFromSaved();
      }
      setStage("chat");
    } else {
      setStage("pre-chat");
    }
    setIsOpen(true);
  };

  useEffect(() => {
    const handler = () => handleOpen();
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  });

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop oscuro semitransparente */}
          <div
            style={styles.backdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            data-testid="chatbot-backdrop"
          />
          {/* Modal flotante con estilos en línea */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chat con asistente virtual"
            style={styles.modal}
            data-testid="chatbot-modal"
            className="chatbot-modal-fallback"
          >
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerBrandWrap}>
                <div style={styles.headerIcon}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <span style={styles.headerTitle}>Asistente Virtual</span>
                  <span style={styles.headerSubtitle}>Consultoría en Marketing</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={styles.closeBtn}
                aria-label="Cerrar chat"
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            {stage === "pre-chat" ? (
              <div style={styles.body}>
                <div style={styles.prechatHeader}>
                  <div style={styles.prechatIcon}>
                    <MessageCircle size={22} />
                  </div>
                  <h3 style={styles.prechatTitle}>¡Hola! Antes de empezar...</h3>
                  <p style={styles.prechatText}>
                    Necesitamos tus datos para ofrecerte un mejor servicio, hacer
                    seguimiento de tu consulta y escalarla a un especialista si es
                    necesario.
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} style={styles.form}>
                  <div style={styles.formField}>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>
                        <UserCircle size={16} />
                      </span>
                      <Input
                        placeholder="Tu nombre completo"
                        value={lead.name}
                        onChange={(e) => {
                          setLead((l) => ({ ...l, name: e.target.value }));
                          if (formErrors.name) setFormErrors((e) => ({ ...e, name: undefined }));
                        }}
                        autoComplete="name"
                        style={{ paddingLeft: 36 }}
                      />
                    </div>
                    {formErrors.name && (
                      <span style={styles.fieldError}>{formErrors.name}</span>
                    )}
                  </div>

                  <div style={styles.formField}>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>
                        <Mail size={16} />
                      </span>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={lead.email}
                        onChange={(e) => {
                          setLead((l) => ({ ...l, email: e.target.value }));
                          if (formErrors.email) setFormErrors((e) => ({ ...e, email: undefined }));
                        }}
                        autoComplete="email"
                        style={{ paddingLeft: 36 }}
                      />
                    </div>
                    {formErrors.email && (
                      <span style={styles.fieldError}>{formErrors.email}</span>
                    )}
                  </div>

                  <div style={styles.formField}>
                    <div style={styles.inputWrap}>
                      <span style={styles.inputIcon}>
                        <Phone size={16} />
                      </span>
                      <Input
                        type="tel"
                        placeholder="+34 600 000 000"
                        value={lead.phone}
                        onChange={(e) => {
                          setLead((l) => ({ ...l, phone: e.target.value }));
                          if (formErrors.phone) setFormErrors((e) => ({ ...e, phone: undefined }));
                        }}
                        autoComplete="tel"
                        style={{ paddingLeft: 36 }}
                      />
                    </div>
                    {formErrors.phone && (
                      <span style={styles.fieldError}>{formErrors.phone}</span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSavingLead}
                    size="lg"
                    style={styles.submitBtn}
                  >
                    {isSavingLead ? (
                      <>
                        <Loader2 size={16} className="cbp-spin" style={{ marginRight: 8 }} />
                        Guardando...
                      </>
                    ) : (
                      "Iniciar conversación"
                    )}
                  </Button>
                </form>

                <p style={styles.privacyText}>
                  Tus datos están seguros. Solo los usaremos para atender tu consulta.
                  Consulta nuestra{" "}
                  <a href="/privacidad" style={styles.privacyLink}>
                    política de privacidad
                  </a>
                  .
                </p>
              </div>
            ) : (
              <>
                <div style={styles.messagesWrap}>
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={msg.id}
                        style={{
                          ...messageRowStyle(isUser),
                        }}
                      >
                        <div style={messageAvatarStyle(msg.role)}>
                          {isUser ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div style={messageBubbleStyle(isUser)}>{msg.content}</div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div style={messageRowStyle(false)}>
                      <div style={messageAvatarStyle("bot")}>
                        <Bot size={14} />
                      </div>
                      <div style={{ ...messageBubbleStyle(false), ...styles.typingBubble }}>
                        <span
                          className="cbp-bounce"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            backgroundColor: "#17fbfb",
                            display: "inline-block",
                            animationDelay: "0ms",
                          }}
                        />
                        <span
                          className="cbp-bounce"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            backgroundColor: "#17fbfb",
                            display: "inline-block",
                            animationDelay: "150ms",
                          }}
                        />
                        <span
                          className="cbp-bounce"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            backgroundColor: "#17fbfb",
                            display: "inline-block",
                            animationDelay: "300ms",
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  style={styles.inputArea}
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    disabled={isLoading}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !input.trim()}
                    aria-label="Enviar mensaje"
                  >
                    <Send size={16} />
                  </Button>
                </form>
              </>
            )}
          </div>
        </>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        style={styles.fab}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
        type="button"
        data-testid="chatbot-fab"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            <span style={styles.fabNotif}>
              <Sparkles size={12} />
            </span>
            <span style={styles.fabPulse} />
          </>
        )}
      </button>

      {/* Animaciones inline (no dependen de Tailwind) */}
      <style jsx>{`
        @keyframes cbp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cbp-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cbp-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes cbp-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes cbp-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes cbp-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        :global(.cbp-bounce) {
          animation: cbp-bounce 1.2s ease-in-out infinite;
        }
        :global(.cbp-spin) {
          animation: cbp-spin 1s linear infinite;
        }
        :global(.chatbot-modal-fallback input) {
          background-color: #001414 !important;
          color: #e6fffe !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          width: 100% !important;
          height: 44px !important;
          padding: 0 16px 0 36px !important;
          font-size: 14px !important;
          border-radius: 10px !important;
          font-family: inherit !important;
          box-sizing: border-box !important;
        }
        :global(.chatbot-modal-fallback input::placeholder) {
          color: #6b7591 !important;
        }
        :global(.chatbot-modal-fallback input:focus) {
          border-color: #17fbfb !important;
          box-shadow: 0 0 0 3px rgba(23, 251, 251, 0.15) !important;
          outline: none !important;
        }
        :global(.chatbot-modal-fallback button[type="submit"]) {
          background: linear-gradient(135deg, #8efd00 0%, #4c9e00 100%) !important;
          color: #001414 !important;
          border: none !important;
          border-radius: 10px !important;
          padding: 12px 20px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          cursor: pointer !important;
          width: 100% !important;
          height: 44px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          font-family: inherit !important;
          transition: transform 0.15s, box-shadow 0.15s !important;
        }
        :global(.chatbot-modal-fallback button[type="submit"]:hover:not(:disabled)) {
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 24px rgba(142, 253, 0, 0.3) !important;
        }
        :global(.chatbot-modal-fallback button[type="submit"]:disabled) {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
        :global(.chatbot-modal-fallback button[aria-label="Enviar mensaje"]) {
          background: linear-gradient(135deg, #17fbfb 0%, #00a8bb 100%) !important;
          color: #001414 !important;
          border: none !important;
          border-radius: 10px !important;
          width: 44px !important;
          height: 44px !important;
          min-width: 44px !important;
          padding: 0 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
        }
        @media (max-width: 640px) {
          :global(.chatbot-modal-fallback) {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </>
  );
}
