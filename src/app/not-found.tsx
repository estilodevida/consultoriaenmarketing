import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página no encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground px-6 py-2 text-sm font-medium hover:bg-accent/90 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
