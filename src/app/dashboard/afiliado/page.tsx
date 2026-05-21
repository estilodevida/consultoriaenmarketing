"use client";

import { BannerDisplay } from "@/components/banner/BannerDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Users, TrendingUp, DollarSign, Link2 } from "lucide-react";

export default function AffiliateDashboard() {
  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <BannerDisplay target="affiliate" />

      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Panel de Afiliado</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus referidos y comisiones
            </p>
          </div>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Referidos", value: "0", change: "Sin actividad" },
            { icon: TrendingUp, label: "Comisiones", value: "€0", change: "este mes" },
            { icon: DollarSign, label: "Pagado", value: "€0", change: "total" },
            { icon: Link2, label: "Enlace único", value: "—", change: "Comparte y gana" },
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
            <CardTitle>Tu enlace de afiliado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Comparte este enlace para empezar a ganar comisiones. Próximamente podrás
              ver el detalle de tus referidos y comisiones aquí.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
