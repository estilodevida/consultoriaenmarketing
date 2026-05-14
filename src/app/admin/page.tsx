"use client";

import { useState } from "react";
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
  return (
    <section className="py-8 md:py-12">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
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
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analítica
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
        </Tabs>
      </div>
    </section>
  );
}
