-- ============================================================
-- PRENOTY — Row Level Security (RLS)
-- Versione: 2026-06-06
--
-- Attori:
--   Titolare  → autenticato, auth.uid() = saloni.user_id
--   Admin     → autenticato, auth.uid() in admins.id
--   Cliente   → anonimo (null), prenota senza account
--   Functions → usa SUPABASE_SERVICE_KEY, bypassa RLS
--
-- Come eseguire: Supabase Dashboard → SQL Editor → Esegui tutto
-- Lo script è idempotente: sicuro da rieseguire più volte
-- ============================================================


-- ============================================================
-- STEP 0: Rimuovi TUTTE le policy esistenti (idempotenza)
-- Approccio dinamico: elimina qualsiasi policy sulle 5 tabelle,
-- indipendentemente dal nome (italiano, inglese, legacy, ecc.)
-- ============================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('saloni', 'servizi', 'prenotazioni', 'clienti', 'admins')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END;
$$;


-- ============================================================
-- STEP 1: Abilita RLS su tutte le tabelle
-- ============================================================

ALTER TABLE public.saloni        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servizi       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenotazioni  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clienti       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins        ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 2: SALONI
--
-- SELECT: pubblico — app cliente cerca il salone per slug
-- INSERT: solo il titolare autenticato crea il proprio salone
-- UPDATE: titolare modifica il proprio salone
--         admin Prenoty aggiorna abbonamento e modera recensioni
-- DELETE: solo il titolare
-- ============================================================

CREATE POLICY "saloni_select_public"
  ON public.saloni FOR SELECT
  USING (true);

CREATE POLICY "saloni_insert_owner"
  ON public.saloni FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saloni_update_owner"
  ON public.saloni FOR UPDATE
  USING (auth.uid() = user_id);

-- Necessaria per: dashboard admin → concedi uso gratis, modera recensioni
CREATE POLICY "saloni_update_admin"
  ON public.saloni FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "saloni_delete_owner"
  ON public.saloni FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- STEP 3: SALONI — funzione RPC per le recensioni anonime
--
-- Il flusso app-cliente è anonimo: non può usare UPDATE diretto
-- su saloni (bloccato da saloni_update_owner).
-- Usiamo una funzione SECURITY DEFINER che aggiunge una singola
-- recensione in modo sicuro, senza esporre altri campi.
--
-- Nel codice app-cliente sostituire:
--   supabase.from("saloni").update({ recensioni: nuovaLista })
-- con:
--   supabase.rpc("aggiungi_recensione", { p_salone_id: salone.id, p_recensione: nuovaRecensione })
-- ============================================================

CREATE OR REPLACE FUNCTION public.aggiungi_recensione(
  p_salone_id uuid,
  p_recensione jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.saloni
  SET recensioni = COALESCE(recensioni, '[]'::jsonb) || p_recensione
  WHERE id = p_salone_id;
END;
$$;

-- Consenti l'esecuzione agli utenti anonimi (ruolo anon)
GRANT EXECUTE ON FUNCTION public.aggiungi_recensione(uuid, jsonb) TO anon;


-- ============================================================
-- STEP 4: SERVIZI
--
-- SELECT: pubblico — app cliente mostra i servizi del salone
-- INSERT/UPDATE/DELETE: solo il titolare del salone
-- ============================================================

CREATE POLICY "servizi_select_public"
  ON public.servizi FOR SELECT
  USING (true);

CREATE POLICY "servizi_insert_owner"
  ON public.servizi FOR INSERT
  WITH CHECK (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );

CREATE POLICY "servizi_update_owner"
  ON public.servizi FOR UPDATE
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );

CREATE POLICY "servizi_delete_owner"
  ON public.servizi FOR DELETE
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );


-- ============================================================
-- STEP 5: PRENOTAZIONI
--
-- SELECT: pubblico — app cliente controlla disponibilità orari;
--         admin legge tutte le prenotazioni (saloni_select_public
--         + prenotazioni_select_public coprono entrambi i casi).
--         NOTA: espone dati PII (nome/tel/email cliente).
--         Mitigazione: nelle query pubbliche selezionare solo
--         i campi strettamente necessari (data, ora, stato).
-- INSERT: pubblico — il cliente prenota senza account
-- UPDATE/DELETE: solo il titolare del salone
-- ============================================================

CREATE POLICY "prenotazioni_select_public"
  ON public.prenotazioni FOR SELECT
  USING (true);

CREATE POLICY "prenotazioni_insert_public"
  ON public.prenotazioni FOR INSERT
  WITH CHECK (true);

CREATE POLICY "prenotazioni_update_owner"
  ON public.prenotazioni FOR UPDATE
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );

CREATE POLICY "prenotazioni_delete_owner"
  ON public.prenotazioni FOR DELETE
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );


-- ============================================================
-- STEP 6: CLIENTI
--
-- SELECT: solo il titolare vede i propri clienti (privacy)
-- INSERT: pubblico — creato durante il flusso di prenotazione
-- UPDATE: titolare per modifiche manuali (note, data nascita…)
--         + utente anonimo per l'upsert del flusso prenotazione
--         (aggiorna ultima_visita e contatore visite).
--         La policy "clienti_update_booking" è intenzionalmente
--         permissiva: necessaria perché il cliente prenota senza
--         account. Mitigazione futura: spostare questo update
--         dentro una RPC con SECURITY DEFINER.
-- DELETE: solo il titolare
-- ============================================================

CREATE POLICY "clienti_select_owner"
  ON public.clienti FOR SELECT
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );

CREATE POLICY "clienti_insert_public"
  ON public.clienti FOR INSERT
  WITH CHECK (true);

CREATE POLICY "clienti_update_owner"
  ON public.clienti FOR UPDATE
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );

-- Permette l'upsert anonimo durante la prenotazione
CREATE POLICY "clienti_update_booking"
  ON public.clienti FOR UPDATE
  USING (true);

CREATE POLICY "clienti_delete_owner"
  ON public.clienti FOR DELETE
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );


-- ============================================================
-- STEP 7: ADMINS
--
-- SELECT: ogni admin vede solo il proprio record
-- INSERT/UPDATE/DELETE: nessuna policy — gli admin vengono
--   aggiunti e rimossi manualmente via SQL da Supabase Studio.
-- ============================================================

CREATE POLICY "admins_select_self"
  ON public.admins FOR SELECT
  USING (auth.uid() = id);
