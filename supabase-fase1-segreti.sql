-- ============================================================
-- PRENOTY — FASE 1 SICUREZZA: segreti in una tabella protetta
-- Data: 2026-10-31
--
-- Problema: la chiave segreta Stripe (metodi_pagamento.stripe_sk) e la
-- password della sezione Report (report_password) stanno nella tabella
-- "saloni", che qualsiasi persona con la chiave pubblica può leggere.
--
-- Soluzione: tabella "saloni_segreti" leggibile SOLO dal titolare del salone
-- (e dalle funzioni server con la service key). Nessun accesso per "anon".
--
-- Si esegue in DUE PARTI, con un test in mezzo (vedi sotto).
-- ============================================================


-- ============================================================
-- PARTE A — sicura da eseguire subito (non toglie niente a nessuno)
-- Crea la tabella protetta e COPIA i segreti esistenti.
-- I vecchi campi restano dove sono finché la Parte B non li svuota.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.saloni_segreti (
  salone_id        uuid PRIMARY KEY REFERENCES public.saloni(id) ON DELETE CASCADE,
  stripe_sk        text,
  report_password  text,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saloni_segreti ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "segreti_select_owner" ON public.saloni_segreti;
DROP POLICY IF EXISTS "segreti_insert_owner" ON public.saloni_segreti;
DROP POLICY IF EXISTS "segreti_update_owner" ON public.saloni_segreti;
DROP POLICY IF EXISTS "segreti_delete_owner" ON public.saloni_segreti;

CREATE POLICY "segreti_select_owner" ON public.saloni_segreti FOR SELECT
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));
CREATE POLICY "segreti_insert_owner" ON public.saloni_segreti FOR INSERT
  WITH CHECK (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));
CREATE POLICY "segreti_update_owner" ON public.saloni_segreti FOR UPDATE
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));
CREATE POLICY "segreti_delete_owner" ON public.saloni_segreti FOR DELETE
  USING (salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid()));

-- Permessi: SOLO titolari (authenticated) e funzioni server (service_role). Niente "anon".
REVOKE ALL ON public.saloni_segreti FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saloni_segreti TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saloni_segreti TO service_role;

-- Copia dei segreti già presenti (idempotente)
INSERT INTO public.saloni_segreti (salone_id, stripe_sk, report_password)
SELECT id,
       NULLIF(metodi_pagamento->>'stripe_sk', ''),
       NULLIF(report_password, '')
FROM public.saloni
WHERE COALESCE(metodi_pagamento->>'stripe_sk', '') <> ''
   OR COALESCE(report_password, '') <> ''
ON CONFLICT (salone_id) DO UPDATE
  SET stripe_sk       = EXCLUDED.stripe_sk,
      report_password = EXCLUDED.report_password,
      updated_at      = now();


-- ============================================================
-- TEST TRA LE DUE PARTI (non saltare)
--   1. Aspetta che il nuovo sito sia online (push già fatto).
--   2. Dashboard del titolare: Impostazioni → Visualizzazione → la password
--      del Report (se impostata) deve funzionare come prima.
--   3. Prova a cambiare/aggiungere la password del Report e a salvare i
--      Metodi di pagamento: nessun errore.
--   4. Solo se tutto funziona, esegui la PARTE B.
-- ============================================================


-- ============================================================
-- PARTE B — svuota i vecchi campi pubblici
-- Dopo la Parte B i segreti esistono solo nella tabella protetta.
-- ============================================================

UPDATE public.saloni SET report_password = NULL WHERE report_password IS NOT NULL;
UPDATE public.saloni SET metodi_pagamento = (metodi_pagamento::jsonb - 'stripe_sk')
 WHERE (metodi_pagamento::jsonb) ? 'stripe_sk';

-- ============================================================
-- ROLLBACK di emergenza della Parte B (ricopia dalla tabella protetta):
--   UPDATE public.saloni s SET report_password = g.report_password
--     FROM public.saloni_segreti g WHERE g.salone_id = s.id AND g.report_password IS NOT NULL;
--   UPDATE public.saloni s SET metodi_pagamento = jsonb_set(COALESCE(s.metodi_pagamento,'{}'::jsonb),'{stripe_sk}', to_jsonb(g.stripe_sk))
--     FROM public.saloni_segreti g WHERE g.salone_id = s.id AND g.stripe_sk IS NOT NULL;
-- ============================================================
