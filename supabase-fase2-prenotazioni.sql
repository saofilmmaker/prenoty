-- ============================================================
-- PRENOTY — FASE 2 SICUREZZA: prenotazioni non più leggibili da tutti
-- Data: 2026-10-31
--
-- Problema: la policy "prenotazioni_select_public" (USING true) permette a
-- chiunque abbia la chiave pubblica di scaricare nome, telefono, email e note
-- di tutti i clienti. La pagina pubblica ha bisogno SOLO degli orari occupati.
--
-- Si esegue in DUE PARTI, con un test in mezzo (vedi sotto).
-- ============================================================


-- ============================================================
-- PARTE A — sicura da eseguire subito (non cambia nulla per nessuno)
-- Crea la funzione che restituisce solo gli orari occupati, senza dati
-- personali. Dopo la Parte A il sito continua a funzionare come prima.
-- ============================================================

CREATE OR REPLACE FUNCTION public.orari_occupati(p_salone_id uuid, p_data text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    json_agg(json_build_object(
      'ora', p.ora,
      'servizio_id', p.servizio_id,
      'durata_totale', p.durata_totale,
      'pausa_totale', p.pausa_totale,
      'staff_id', p.staff_id
    )),
    '[]'::json
  )
  FROM public.prenotazioni p
  WHERE p.salone_id = p_salone_id
    AND p.data::text = p_data
    AND p.stato IS DISTINCT FROM 'annullata';
$$;

GRANT EXECUTE ON FUNCTION public.orari_occupati(uuid, text) TO anon, authenticated;


-- ============================================================
-- TEST TRA LE DUE PARTI (non saltare)
--   1. Aspetta che il nuovo sito sia online (push già fatto).
--   2. Apri una pagina pubblica di un salone, scegli servizio e data:
--      gli orari devono caricarsi e gli orari già occupati devono sparire.
--   3. Solo se tutto funziona, esegui la PARTE B.
-- ============================================================


-- ============================================================
-- PARTE B — chiude la lettura pubblica delle prenotazioni
-- Dopo la Parte B: il titolare vede le prenotazioni del proprio salone,
-- l'admin vede tutto, il pubblico non vede più niente (può solo prenotare).
-- ============================================================

DROP POLICY IF EXISTS "prenotazioni_select_public" ON public.prenotazioni;

CREATE POLICY "prenotazioni_select_owner"
  ON public.prenotazioni FOR SELECT
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );

CREATE POLICY "prenotazioni_select_admin"
  ON public.prenotazioni FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));


-- ============================================================
-- DIAGNOSTICA (facoltativa): elenca le policy attive sulle prenotazioni.
-- Se dopo la Parte B il pubblico legge ancora le prenotazioni, c'è un'altra
-- policy con un altro nome: eliminala con DROP POLICY "nome" ON public.prenotazioni;
--
--   SELECT policyname, cmd, qual FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'prenotazioni';
--
-- ROLLBACK di emergenza della Parte B (ripristina la lettura pubblica):
--   CREATE POLICY "prenotazioni_select_public" ON public.prenotazioni
--     FOR SELECT USING (true);
-- ============================================================
