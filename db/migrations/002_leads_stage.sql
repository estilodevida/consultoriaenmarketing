-- Pipeline formal de leads (CON-191)
-- Issue: CON-191 Automatizar propuesta comercial
-- Añade al esquema de leads:
--   * stage: etapa del pipeline comercial (lead → cerrado)
--   * qualified_at: timestamp del paso a "calificado" (BANT)
--   * proposal_sent_at: timestamp de la propuesta enviada
--   * mantiene metadata jsonb existente para parámetros (sector, servicio, zona, precios)
-- Idempotente: se puede aplicar varias veces sin romper.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'stage'
  ) THEN
    ALTER TABLE public.leads
      ADD COLUMN stage text NOT NULL DEFAULT 'nuevo';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'qualified_at'
  ) THEN
    ALTER TABLE public.leads
      ADD COLUMN qualified_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'proposal_sent_at'
  ) THEN
    ALTER TABLE public.leads
      ADD COLUMN proposal_sent_at timestamptz;
  END IF;
END$$;

-- Constraint CHECK para el stage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leads_stage_check'
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_stage_check
      CHECK (stage IN (
        'nuevo','contactado','calificado','propuesta','negociacion','ganado','perdido'
      ));
  END IF;
END$$;

-- Índices para los nuevos lookups
CREATE INDEX IF NOT EXISTS leads_stage_idx            ON public.leads (stage);
CREATE INDEX IF NOT EXISTS leads_qualified_at_idx     ON public.leads (qualified_at);
CREATE INDEX IF NOT EXISTS leads_proposal_sent_at_idx ON public.leads (proposal_sent_at);

-- updated_at trigger si no existe (la tabla puede no traerlo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'leads_set_updated_at'
  ) THEN
    CREATE TRIGGER leads_set_updated_at
      BEFORE UPDATE ON public.leads
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

COMMENT ON COLUMN public.leads.stage
  IS 'Etapa del pipeline comercial: nuevo|contactado|calificado|propuesta|negociacion|ganado|perdido (CON-191)';
COMMENT ON COLUMN public.leads.qualified_at
  IS 'Timestamp en el que el lead pasó a "calificado" (BANT confirmado)';
COMMENT ON COLUMN public.leads.proposal_sent_at
  IS 'Timestamp en el que se envió la propuesta automática CON-191';
