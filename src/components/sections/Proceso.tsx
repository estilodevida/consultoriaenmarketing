import { procesoSteps } from "@/lib/content";
import { Badge } from "@/components/ui/badge";

export function Proceso() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="outline" className="mb-4">
            Cómo Trabajamos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            De la estrategia a la ejecución
          </h2>
          <p className="mt-4 text-muted-foreground">
            Un proceso probado que garantiza resultados desde el primer día.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {procesoSteps.map((step, i) => (
            <div key={step.step} className="relative">
              {i < procesoSteps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px border-t-2 border-dashed border-accent/30" />
              )}
              <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-accent">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
