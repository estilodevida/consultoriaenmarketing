# Pipeline de propuestas (CON-191)

Documento vivo del flujo automático que lleva un **lead BANT calificado** a una
**propuesta comercial enviada por email** con **enlace de llamada** a la dirección.

## Diagrama

```
┌──────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│  Captación   │    │  Calificado  │    │  Propuesta HTML │    │   Cita con   │
│  (form/chat) │ →  │  (stage BANT)│ →  │  + email + CTA  │ →  │   dirección  │
└──────────────┘    └──────────────┘    └─────────────────┘    └──────────────┘
       │                    │                     │                      │
       │                    │                     │                      │
   Supabase            Twenty CRM            n8n proposal-auto      Google Calendar
   leads.stage         pipeline_stage        (+ Gmail + Telegram)    (vía cita del chatbot)
   (migración 002)     (custom field)        (workflow CON-191)
```

## Componentes

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Plantilla | `src/lib/proposal-template.ts` | Renderiza HTML y texto a partir de parámetros |
| Orquestación | `src/lib/proposal-service.ts` | Upsert lead, genera propuesta, sincroniza CRM, dispara n8n |
| API | `src/app/api/proposals/{generate,[id],[id]/approve,[id]/reject}/route.ts` | Endpoints REST con auth por token |
| Landing | `src/app/agendar/page.tsx` | Pre-rellena el Chatbot con los datos del lead |
| DB | `db/migrations/002_leads_stage.sql` | Añade `stage`, `qualified_at`, `proposal_sent_at` |
| DB | `db/migrations/003_proposals.sql` | Crea tabla `proposals` con snapshot + status + IDs CRM |
| n8n | `db/n8n/proposal-auto.json` | Envía email, crea opportunity/note en Twenty, notifica Telegram |
| n8n | `db/n8n/lead-calificado.json` | Cron cada 5 min: busca leads `calificado` en Twenty, dispara `/api/proposals/generate` |
| Tests | `scripts/test-proposal-flow.sh` | Smoke test del flujo completo |

## Estados de una propuesta

```
draft → pending_review → approved → sent
                              ↓
                          rejected
                              ↓
                           failed (con reintento vía n8n)
```

- `draft`: creada pero no revisada.
- `pending_review`: requiere aprobación humana (cuando `PROPOSAL_REQUIRE_HUMAN_REVIEW=true`
  o el lead aún no está marcado como "calificado" en `leads.stage`).
- `approved`: aprobada, a la espera de n8n.
- `sent`: enviada al cliente (con `sent_at`).
- `rejected`: rechazada con `motivo` y `actor`.
- `failed`: error en el envío (revisar logs de n8n).

## Estados del lead

```
nuevo → contactado → calificado → propuesta → negociacion → ganado | perdido
```

El `stage` se actualiza automáticamente al generar una propuesta
(`propuesta`, con `proposal_sent_at`). Las etapas `negociacion`, `ganado` y
`perdido` se gestionan manualmente desde la UI de Twenty CRM.

## Activación del workflow

CON-191 deja **todo el código listo** pero los workflows n8n en estado
`active: false` mientras CON-190 (reparación urgente del circuito chatbot→CRM)
siga abierto. Cuando CON-190 cierre (cert renovado + API key de Twenty
configurada), basta con:

1. Activar el workflow **«Propuesta automática — CON-191»** en n8n UI.
2. Activar el workflow **«Lead calificado → propuesta — CON-191»**.
3. Asegurarse de que `N8N_PROPOSAL_WEBHOOK_URL` apunta al webhook nuevo en
   la web (`https://consultoriaenmarketing.com/api/proposals/generate`).
4. Asegurarse de que `TWENTY_API_KEY` y `TWENTY_SERVER_URL` están en `.env`
   de la web (lo deja CON-190).

## Configuración del campo `pipeline_stage` en Twenty

Twenty CRM no trae un campo `pipeline_stage` por defecto en `person`. Para
crearlo:

1. Ve a Twenty UI → Settings → Data Model → People.
2. Add Field → `pipeline_stage` (texto, opciones: `lead`, `calificado`,
   `propuesta`, `negociacion`, `ganado`, `perdido`).
3. Crea también los custom fields `sector`, `servicio`, `zona` (texto).
4. Listo. El workflow `lead-calificado` consultará por `pipeline_stage=calificado`.

## Configuración SMTP (opcional)

Si prefieres enviar el email desde la propia web (sin pasar por n8n Gmail),
define `SMTP_*` en `.env` y se usará como fallback. La implementación actual
delega el envío al n8n workflow para mantener la auditoría centralizada.

## Verificación

```bash
# 1. Generar propuesta de prueba
pnpm test:proposal

# 2. Comprobar el HTML generado manualmente
curl -X GET https://consultoriaenmarketing.com/api/proposals/$ID \
  -H "X-Internal-Token: $TOKEN" | jq -r '.proposal.html'
```

## Próximos pasos (no en CON-191)

- Métricas: tasa de apertura del email (pixel tracking), tiempo hasta cita agendada.
- A/B testing de plantilla por sector.
- Versionado de la plantilla con rollback si la conversión cae.
- Multi-idioma (catalán, inglés para clientes extranjeros).
