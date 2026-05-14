"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { services } from "@/lib/content";
import { Send, Loader2, CheckCircle } from "lucide-react";

type BudgetStep = "project" | "details" | "done";

export function BudgetForm() {
  const [step, setStep] = useState<BudgetStep>("project");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    budget: "",
    timeline: "",
    description: "",
  });

  const updateField = (field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value ?? "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "presupuesto" }),
      });
      setStep("done");
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border bg-card">
        <CheckCircle className="h-12 w-12 text-accent mb-4" />
        <h3 className="text-xl font-semibold mb-2">¡Solicitud enviada!</h3>
        <p className="text-sm text-muted-foreground">
          Hemos recibido tu solicitud de presupuesto. Te contactaremos en menos de 24 horas
          con una propuesta personalizada.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-6 md:p-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre *
          </label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Tu nombre"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email *
          </label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Teléfono
          </label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium">
            Empresa
          </label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => updateField("company", e.target.value)}
            placeholder="Tu empresa"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="service" className="text-sm font-medium">
            Servicio *
          </label>
          <Select
            value={formData.service}
            onValueChange={(value) => updateField("service", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.title}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="budget" className="text-sm font-medium">
            Presupuesto estimado
          </label>
          <Select
            value={formData.budget}
            onValueChange={(value) => updateField("budget", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<1000">Menos de 1.000€</SelectItem>
              <SelectItem value="1000-3000">1.000€ - 3.000€</SelectItem>
              <SelectItem value="3000-5000">3.000€ - 5.000€</SelectItem>
              <SelectItem value="5000-10000">5.000€ - 10.000€</SelectItem>
              <SelectItem value=">10000">Más de 10.000€</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="timeline" className="text-sm font-medium">
          ¿Cuándo necesitas empezar?
        </label>
        <Select
          value={formData.timeline}
          onValueChange={(value) => updateField("timeline", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgente">Lo antes posible</SelectItem>
            <SelectItem value="1mes">En el próximo mes</SelectItem>
            <SelectItem value="3meses">En 1-3 meses</SelectItem>
            <SelectItem value="explorando">Solo estoy explorando</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Cuéntanos sobre tu proyecto *
        </label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe tu proyecto, objetivos, y cualquier detalle relevante..."
          rows={4}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Solicitar Presupuesto
          </>
        )}
      </Button>
    </form>
  );
}
