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
      // If returning user, go straight to chat
      if (!chatStarted) {
        startChatFromSaved();
      }
      setStage("chat");
    } else {
      setStage("pre-chat");
    }
    setIsOpen(true);
  };

  // Listen for custom event to open chatbot from external buttons
  useEffect(() => {
    const handler = () => handleOpen();
    window.addEventListener("open-chatbot", handler);
    return () => window.removeEventListener("open-chatbot", handler);
  });

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-sm block">Asistente Virtual</span>
                <span className="text-[10px] opacity-80">Consultoría en Marketing</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 rounded-full p-1 transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {stage === "pre-chat" ? (
            /* Pre-chat form */
            <div className="p-5 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base">¡Hola! Antes de empezar...</h3>
                <p className="text-sm text-muted-foreground">
                  Necesitamos tus datos para ofrecerte un mejor servicio, hacer
                  seguimiento de tu consulta y escalarla a un especialista si es
                  necesario.
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tu nombre completo"
                      value={lead.name}
                      onChange={(e) => {
                        setLead((l) => ({ ...l, name: e.target.value }));
                        if (formErrors.name) setFormErrors((e) => ({ ...e, name: undefined }));
                      }}
                      className="pl-9"
                      autoComplete="name"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-destructive mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={lead.email}
                      onChange={(e) => {
                        setLead((l) => ({ ...l, email: e.target.value }));
                        if (formErrors.email) setFormErrors((e) => ({ ...e, email: undefined }));
                      }}
                      className="pl-9"
                      autoComplete="email"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={lead.phone}
                      onChange={(e) => {
                        setLead((l) => ({ ...l, phone: e.target.value }));
                        if (formErrors.phone) setFormErrors((e) => ({ ...e, phone: undefined }));
                      }}
                      className="pl-9"
                      autoComplete="tel"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSavingLead}
                  size="lg"
                >
                  {isSavingLead ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    "Iniciar conversación"
                  )}
                </Button>
              </form>

              <p className="text-[10px] text-muted-foreground text-center">
                Tus datos están seguros. Solo los usaremos para atender tu consulta.
                Consulta nuestra{" "}
                <a href="/privacidad" className="underline hover:text-foreground">
                  política de privacidad
                </a>
                .
              </p>
            </div>
          ) : (
            /* Chat messages */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2 max-w-[85%]",
                      msg.role === "user" ? "ml-auto" : ""
                    )}
                  >
                    {msg.role === "bot" && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-3.5 w-3.5 text-accent" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-muted flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button with animations */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className={cn(
          "fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group",
          "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground",
          !isOpen && "animate-bounce-gentle hover:scale-110",
          "hover:shadow-xl hover:shadow-accent/25"
        )}
        aria-label="Abrir chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
              <Sparkles className="h-3 w-3" />
            </span>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />
          </>
        )}
      </button>

      {/* CSS for bounce animation */}
      <style jsx>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2.5s ease-in-out infinite;
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
