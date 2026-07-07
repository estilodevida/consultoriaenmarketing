"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lock,
  MessageCircle,
  FileText,
  TrendingUp,
  Users,
  LogOut,
  Bot,
  Image,
  Calendar,
} from "lucide-react";

const ADMIN_PASSWORD = "admin123";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="py-16 md:py-24">
        <div className="container max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Acceso restringido</CardTitle>
              <CardDescription>
                Introduce la contraseña para acceder al panel de administración.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">
                  Acceder
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [bannerRefreshKey, setBannerRefreshKey] = useState(0);

  return (
    <section className="py-8 md:py-12">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tu sitio web, chatbot y clientes
            </p>
          </div>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b">
          <Link href="/admin/airbnb">
            <Button variant="accent" size="sm" className="gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Airbnb KPIs
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: MessageCircle, label: "Conversaciones", value: "12", change: "+3 hoy" },
            { icon: FileText, label: "Presupuestos", value: "5", change: "2 pendientes" },
            { icon: Users, label: "Leads nuevos", value: "18", change: "este mes" },
            { icon: TrendingUp, label: "Tasa de conversión", value: "4.2%", change: "+0.8%" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-accent">{stat.change}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList>
            <TabsTrigger value="chat">
              <Bot className="h-4 w-4 mr-2" />
              Chatbot
            </TabsTrigger>
            <TabsTrigger value="quotes">
              <FileText className="h-4 w-4 mr-2" />
              Presupuestos
            </TabsTrigger>
            <TabsTrigger value="banner">
              <Image className="h-4 w-4 mr-2" />
              Banner
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analítica
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Citas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Conversaciones del Chatbot</CardTitle>
                <CardDescription>
                  Historial de conversaciones con los visitantes del sitio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay conversaciones recientes.</p>
                  <p className="text-sm">
                    Las conversaciones aparecerán aquí cuando los visitantes interactúen con el chatbot.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes de Presupuesto</CardTitle>
                <CardDescription>
                  Gestiona las solicitudes de presupuesto de los clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay solicitudes de presupuesto pendientes.</p>
                  <p className="text-sm">
                    Las solicitudes aparecerán aquí cuando los clientes envíen el formulario.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analítica del Sitio</CardTitle>
                <CardDescription>
                  Estadísticas de tráfico y comportamiento de usuarios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Conecta Google Analytics para ver las estadísticas.</p>
                  <p className="text-sm">
                    Próximamente: integración con Google Analytics 4.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banner">
            <BannerManager
              key={bannerRefreshKey}
              onBannerChange={() => setBannerRefreshKey((k) => k + 1)}
            />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsManager />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

interface Banner {
  desktop_url: string;
  mobile_url: string;
  target: "affiliate" | "client";
  active: boolean;
  created_at: string;
}

function BannerManager({ onBannerChange }: { onBannerChange: () => void }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      setBanners(data.banners || []);
    } catch {
      setBanners([]);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (target: "affiliate" | "client") => {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Banner eliminado correctamente" });
        await fetchBanners();
        onBannerChange();
      }
    } catch {
      setMessage({ type: "error", text: "Error al eliminar el banner" });
    }
  };

  const [desktopPreview, setDesktopPreview] = useState<Record<string, { desktop: string | null; mobile: string | null }>>({});
  const [desktopFiles, setDesktopFiles] = useState<Record<string, { desktop: File | null; mobile: File | null }>>({});

  const handleDrop = (target: string, field: "desktop" | "mobile", file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setDesktopPreview((prev) => ({
        ...prev,
        [target]: { ...prev[target], [field]: e.target?.result as string },
      }));
    };
    reader.readAsDataURL(file);
    setDesktopFiles((prev) => ({
      ...prev,
      [target]: { ...prev[target], [field]: file },
    }));
  };

  const handleSubmitUpload = async (target: "affiliate" | "client") => {
    const files = desktopFiles[target];
    if (!files?.desktop || !files?.mobile) {
      setMessage({ type: "error", text: "Debes seleccionar ambas imágenes" });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.set("target", target);
    formData.set("desktop", files.desktop);
    formData.set("mobile", files.mobile);

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Banner actualizado correctamente" });
        setDesktopPreview((prev) => ({ ...prev, [target]: { desktop: null, mobile: null } }));
        setDesktopFiles((prev) => ({ ...prev, [target]: { desktop: null, mobile: null } }));
        await fetchBanners();
        onBannerChange();
      }
    } catch {
      setMessage({ type: "error", text: "Error al subir el banner" });
    } finally {
      setUploading(false);
    }
  };

  const renderBannerCard = (target: "affiliate" | "client") => {
    const label = target === "affiliate" ? "Afiliados" : "Clientes";
    const banner = banners.find((b) => b.target === target);
    const dp = desktopPreview[target];
    const df = desktopFiles[target];

    return (
      <Card key={target}>
        <CardHeader>
          <CardTitle>Banner para {label}</CardTitle>
          <CardDescription>
            Sube las imágenes para el dashboard de {label.toLowerCase()}.
            <br />
            <strong>Desktop:</strong> horizontal (1920×400px recomendado) &middot;
            <strong> Móvil:</strong> vertical (750×1334px recomendado).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {banner && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium">Banner actual:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Desktop</p>
                  <img
                    src={banner.desktop_url}
                    alt="Desktop preview"
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Móvil</p>
                  <img
                    src={banner.mobile_url}
                    alt="Mobile preview"
                    className="w-full h-32 object-contain rounded border"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(target)}
                className="border-red-500 text-red-500 hover:bg-red-500/10"
              >
                Eliminar banner
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <DropZone
              label="Imagen Desktop (horizontal, 1920×400px)"
              preview={dp?.desktop}
              onDrop={(file) => handleDrop(target, "desktop", file)}
            />
            <DropZone
              label="Imagen Móvil (vertical, 750×1334px)"
              preview={dp?.mobile}
              onDrop={(file) => handleDrop(target, "mobile", file)}
            />
            {df?.desktop && df?.mobile && (
              <Button onClick={() => handleSubmitUpload(target)} disabled={uploading}>
                {uploading ? "Subiendo..." : "Subir banner"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  function DropZone({ label, preview, onDrop }: { label: string; preview: string | null; onDrop: (file: File) => void }) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useState<HTMLInputElement | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
    };
    const handleDropEvent = (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) onDrop(file);
    };
    const handleClick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) onDrop(file);
      };
      input.click();
    };

    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropEvent}
          onClick={handleClick}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragging
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/50"
          }`}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-40 mx-auto object-contain rounded" />
          ) : (
            <div className="text-muted-foreground">
              <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm">Arrastra y suelta la imagen aquí</p>
              <p className="text-xs mt-1">o haz clic para seleccionar</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Banners</CardTitle>
          <CardDescription>
            Administra los banners que se muestran en los dashboards de afiliados y clientes.
            Cada banner tiene dos versiones: una para escritorio (horizontal) y otra para móvil (vertical).
            El sistema detecta automáticamente el dispositivo y muestra la imagen correspondiente.
          </CardDescription>
        </CardHeader>
      </Card>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {renderBannerCard("affiliate")}
        {renderBannerCard("client")}
      </div>
    </div>
  );
}

type Appointment = {
  id: string;
  lead_id: string | null;
  lead_name: string;
  lead_email: string | null;
  lead_phone: string | null;
  start_at: string;
  end_at: string;
  timezone: string;
  reason: string | null;
  status: string;
  source: string;
  crm_person_id: string | null;
  crm_activity_id: string | null;
  calendar_event_id: string | null;
  ics_uid: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function AppointmentsManager() {
  const [token, setToken] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchAll = async (tok: string) => {
    if (!tok) {
      setError("Introduce el Admin Token.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?token=${encodeURIComponent(tok)}&all=1&limit=200`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setAppointments(data.appointments || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAll(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://consultoriaenmarketing.com";
  const icsUrl = `${siteUrl}/api/appointments/calendar.ics?token=${encodeURIComponent(
    token || "TU_TOKEN"
  )}`;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const fmt = (iso: string, tz: string) => {
    try {
      return new Intl.DateTimeFormat("es-ES", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: tz || undefined,
        hour12: false,
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const statusColor: Record<string, string> = {
    confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    rescheduled: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    no_show: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Citas agendadas por el chatbot</CardTitle>
          <CardDescription>
            Todas las citas confirmadas/creadas desde el chatbot (CON-181). Cada cita dispara el
            workflow n8n que sincroniza Twenty CRM, envía email al cliente y notifica al equipo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Admin token (ADMIN_TOKEN)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
            <div className="font-semibold">Feed ICS para tu calendario (Google/Apple/Outlook):</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all text-[11px] bg-background p-1.5 rounded border">
                {icsUrl}
              </code>
              <Button size="sm" variant="outline" onClick={() => copy(icsUrl, "ics")}>
                {copied === "ics" ? "Copiado ✓" : "Copiar"}
              </Button>
            </div>
            <div className="text-muted-foreground">
              En Google Calendar: <em>Añadir por URL</em> → pega esta URL. Refresco ~5 min.
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-500/10 text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-muted-foreground">Cargando…</div>
          ) : appointments.length === 0 && token ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No hay citas todavía. Cuando el chatbot acuerde una cita, aparecerá aquí.
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">
              Introduce el Admin Token para ver las citas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-3">Inicio</th>
                    <th className="py-2 pr-3">Lead</th>
                    <th className="py-2 pr-3">Contacto</th>
                    <th className="py-2 pr-3">Motivo</th>
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">CRM</th>
                    <th className="py-2 pr-3">Cal.</th>
                    <th className="py-2 pr-3">Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {fmt(a.start_at, a.timezone)}
                        <div className="text-[11px] text-muted-foreground">{a.timezone}</div>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="font-medium">{a.lead_name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {a.lead_id ? a.lead_id.slice(0, 8) : "—"}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-xs">
                        {a.lead_email && <div>{a.lead_email}</div>}
                        {a.lead_phone && (
                          <div className="text-muted-foreground">{a.lead_phone}</div>
                        )}
                      </td>
                      <td className="py-2 pr-3 max-w-[220px]">
                        <div className="text-xs line-clamp-2">{a.reason || "—"}</div>
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] border ${
                            statusColor[a.status] || ""
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-[11px]">
                        {a.crm_person_id ? "✓" : "—"}
                        {a.crm_activity_id ? " ✓" : ""}
                      </td>
                      <td className="py-2 pr-3 text-[11px]">
                        {a.calendar_event_id ? "✓ gcal" : "—"}
                      </td>
                      <td className="py-2 pr-3 text-[11px] text-muted-foreground">{a.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

