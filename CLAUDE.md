@AGENTS.md

# Notas de Claude (CTO y colaboradores)

## Pipeline de propuestas (CON-191)

Sistema que automatiza la propuesta comercial: lead BANT → propuesta HTML
parametrizada → email al cliente + nota en Twenty CRM + enlace de llamada.

- **Activación:** los workflows n8n `Propuesta automática — CON-191` y
  `Lead calificado → propuesta — CON-191` están en `active: false` mientras
  CON-190 siga abierto. Activar cuando el cert TLS y la API key de Twenty
  estén arreglados.
- **Endpoint principal:** `POST /api/proposals/generate` con header
  `X-Internal-Token` o `X-Admin-Token`. Body mínimo:
  `{ nombre, email, sector, servicio, zona }`.
- **Estados del lead** (campo `stage` en `leads`): `nuevo → contactado →
  calificado → propuesta → negociacion → ganado | perdido`. Solo `propuesta`
  se asigna automáticamente al enviar la propuesta; el resto se gestiona
  desde Twenty UI.
- **Revisión humana opcional:** si `PROPOSAL_REQUIRE_HUMAN_REVIEW=true` o
  el lead no está `calificado` aún, la propuesta queda en `pending_review`
  y se aprueba con `POST /api/proposals/{id}/approve`.
- **Dry-run:** si `PROPOSAL_DRY_RUN=true`, el workflow n8n NO envía email
  (solo crea la nota en Twenty). Útil para verificar sin mandar a un cliente
  real. Por defecto `false`.
- **Documentación detallada:** `docs/proposal-flow.md`.

## Reglas heredadas de la dirección

- Dominio oficial: **https://consultoriaenmarketing.com** (sin excepciones).
- Precios del catálogo v1.0 en `src/lib/proposal-template.ts` →
  `precioCaptacionDefault()` (setup 900 € + IVA, mensual 350 € + IVA, pub
  100-200 €/mes). Para cambios de tarifa, editar ahí, NO hardcodear.
- Si se cambia el formato de la propuesta, mantener la versión texto plano
  sincronizada con el HTML (clientes con email sin renderizado).
