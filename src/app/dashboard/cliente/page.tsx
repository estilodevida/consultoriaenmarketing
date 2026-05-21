"use client";

import { BannerDisplay } from "@/components/banner/BannerDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, FileText, MessageCircle, Clock, HelpCircle } from "lucide-react";

export default function ClientDashboard() {
  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <BannerDisplay target="client" />

      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Panel de Cliente</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus servicios y facturación
            </p>
          </div>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: "Facturas", value: "0", change: "Sin facturas" },
            { icon: MessageCircle, label: "Tickets", value: "0", change: "abiertos" },
            { icon: Clock, label: "Próximo pago", value: "—", change: "Sin datos" },
            { icon: HelpCircle, label: "Soporte", value: "24/7", change: "Contáctanos" },
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

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido a tu panel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Aquí podrás ver tus facturas, abrir tickets de soporte y gestionar
              tus servicios contratados. Próximamente más funcionalidades.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
