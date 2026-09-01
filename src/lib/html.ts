// Helpers de HTML compartidos entre módulos que generan documentos
// (onboarding, proposal-template, emails). Centralizado para evitar
// inyecciones accidentales y para que el comportamiento sea idéntico.

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Variante más conservadora: solo escapa &, <, >. Útil para texto
// dentro de atributos href/src donde las comillas se manejan aparte.
export function escapeHtmlLoose(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
