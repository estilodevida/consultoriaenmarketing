-- Tabla proposals para el sistema de propuestas automáticas (CON-191)
-- Issue: CON-191 Automatizar propuesta comercial
-- Almacena cada propuesta generada con:
--   * snapshot de los parámetros (la plantilla puede cambiar, la propuesta enviada no)
--   * HTML y texto generados (para reenvío / auditoría)
--   * status del workflow de aprobación y envío
--   * IDs del CRM para trazabilidad
-- Idempotente.

CREATE TABLE IF NOT EXISTS public.proposals (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id               uuid REFERENCES public.leads(id) ON DELETE SET NULL,

  -- Snapshot de parámetros de la propuesta
  sector                text NOT NULL,
  servicio              text NOT NULL,
  zona                  text NOT NULL,
  precio_setup          numeric NOT NULL,
  precio_mensual        numeric NOT NULL,
  precio_publicidad     text,

  -- Documentos generados
  html                  text NOT NULL,
  texto                 text NOT NULL,

  -- Estado del workflow
  status                text NOT NULL DEFAULT 'pending_review',
  -- status posibles:
  --   draft          -- generada, aún no lista
  --   pending_review -- a la espera de aprobación humana (PROPOSAL_REQUIRE_HUMAN_REVIEW)
  --   approved       -- aprobada, pendiente de enviar
  --   sent           -- enviada por email al cliente
  --   rejected       -- rechazada por humano
  --   failed         -- error en el envío
  --   expired        -- propuesta caducada (7 días sin interacción)

  sent_at               timestamptz,
  approved_at           timestamptz,
  approved_by           text,
  rejected_at           timestamptz,
  rejected_by           text,
  rejected_motivo       text,

  -- Trazabilidad con Twenty CRM
  crm_person_id         text,
  crm_opportunity_id    text,
  crm_note_id           text,
  email_message_id      text,

  -- Metadatos libres (origen, n8n run id, etc.)
  metadata              jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT proposals_status_check CHECK (
    status IN (
      'draft','pending_review','approved','sent','rejected','failed','expired'
    )
  )
);

CREATE INDEX IF NOT EXISTS proposals_lead_id_idx        ON public.proposals (lead_id);
CREATE INDEX IF NOT EXISTS proposals_status_idx         ON public.proposals (status);
CREATE INDEX IF NOT EXISTS proposals_created_at_idx     ON public.proposals (created_at DESC);
CREATE INDEX IF NOT EXISTS proposals_crm_person_idx     ON public.proposals (crm_person_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS proposals_set_updated_at ON public.proposals;
CREATE TRIGGER proposals_set_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Grants alineados con leads/appointments
GRANT ALL ON public.proposals TO anon, authenticated, service_role;

COMMENT ON TABLE  public.proposals IS
  'Propuestas comerciales automáticas generadas por el workflow CON-191';
COMMENT ON COLUMN public.proposals.html IS
  'HTML completo (autocontenido, CSS inline) listo para email';
COMMENT ON COLUMN public.proposals.texto IS
  'Versión en texto plano (fallback + adjuntos)';
COMMENT ON COLUMN public.proposals.sector IS
  'Sector del cliente (ej: plataformas_elevadoras, reformas, dentistas...)';
COMMENT ON COLUMN public.proposals.servicio IS
  'Servicio o máquina específica (ej: MATILSA PARMA 9)';
COMMENT ON COLUMN public.proposals.zona IS
  'Zona geográfica de servicio (ej: Sevilla y provincia)';
COMMENT ON COLUMN public.proposals.crm_person_id IS
  'ID del Person en Twenty CRM';
COMMENT ON COLUMN public.proposals.crm_opportunity_id IS
  'ID de la Opportunity en Twenty CRM (puede ser null si Twenty no soporta opportunities)';
COMMENT ON COLUMN public.proposals.crm_note_id IS
  'ID de la Note adjuntada en Twenty CRM';
