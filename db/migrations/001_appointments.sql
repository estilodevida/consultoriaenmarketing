-- Tabla appointments para citas agendadas por el chatbot
-- Issue: CON-181 Integrar calendario y completar el flujo de citas del chatbot

CREATE TABLE IF NOT EXISTS public.appointments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  lead_name       text NOT NULL,
  lead_email      text,
  lead_phone      text,
  start_at        timestamptz NOT NULL,
  end_at          timestamptz NOT NULL,
  timezone        text NOT NULL DEFAULT 'Europe/Madrid',
  reason          text,
  status          text NOT NULL DEFAULT 'confirmed',
  source          text NOT NULL DEFAULT 'chatbot',
  raw_extraction  jsonb,
  crm_person_id   text,
  crm_activity_id text,
  calendar_event_id text,
  ics_uid         text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointments_check_times CHECK (end_at > start_at),
  CONSTRAINT appointments_check_status CHECK (
    status IN ('confirmed','cancelled','completed','rescheduled','no_show')
  )
);

CREATE INDEX IF NOT EXISTS appointments_start_at_idx     ON public.appointments (start_at);
CREATE INDEX IF NOT EXISTS appointments_lead_id_idx      ON public.appointments (lead_id);
CREATE INDEX IF NOT EXISTS appointments_lead_email_idx   ON public.appointments (lead_email);
CREATE INDEX IF NOT EXISTS appointments_status_idx       ON public.appointments (status);

-- Restricción única suave: una cita confirmada por lead/email y start_at
CREATE UNIQUE INDEX IF NOT EXISTS appointments_unique_confirmed_idx
  ON public.appointments (lower(coalesce(lead_email,'')), start_at)
  WHERE status IN ('confirmed','rescheduled');

-- Grants alineados con la tabla leads (anon/authenticated/service_role)
GRANT ALL ON public.appointments TO anon, authenticated, service_role;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointments_set_updated_at ON public.appointments;
CREATE TRIGGER appointments_set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE  public.appointments IS 'Citas acordadas por el chatbot (CON-181)';
COMMENT ON COLUMN public.appointments.lead_id IS 'FK a leads (nullable si se borra el lead)';
COMMENT ON COLUMN public.appointments.status IS 'confirmed|cancelled|completed|rescheduled|no_show';
COMMENT ON COLUMN public.appointments.crm_person_id IS 'ID del Person creado/actualizado en Twenty CRM';
COMMENT ON COLUMN public.appointments.crm_activity_id IS 'ID de la Activity/Note en Twenty CRM';
COMMENT ON COLUMN public.appointments.calendar_event_id IS 'ID del evento en Google Calendar (cuando OAuth configurado)';
COMMENT ON COLUMN public.appointments.ics_uid IS 'UID estable del evento ICS para updates coherentes';
