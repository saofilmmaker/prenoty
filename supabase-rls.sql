-- ============================================================
-- PRENOTY — Row Level Security (RLS)
-- Esegui tutto questo script nel Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Abilita RLS su tutte le tabelle
-- ============================================================
ALTER TABLE public.saloni      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servizi     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenotazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clienti     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: SALONI
-- Lettura pubblica (app cliente cerca il salone per slug)
-- Scrittura solo al titolare autenticato
-- ============================================================
CREATE POLICY "saloni_select_public"
  ON public.saloni FOR SELECT USING (true);

CREATE POLICY "saloni_insert_owner"
  ON public.saloni FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saloni_update_owner"
  ON public.saloni FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "saloni_delete_owner"
  ON public.saloni FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- STEP 3: SERVIZI
-- Lettura pubblica (app cliente mostra i servizi)
-- Scrittura solo al titolare del salone
-- ============================================================
CREATE POLICY "servizi_select_public"
  ON public.servizi FOR SELECT USING (true);

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
-- STEP 4: PRENOTAZIONI
-- Lettura pubblica limitata (app cliente controlla disponibilità)
-- Insert pubblico (cliente prenota senza account)
-- Update/Delete solo al titolare
-- ============================================================
CREATE POLICY "prenotazioni_select_public"
  ON public.prenotazioni FOR SELECT USING (true);

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
-- STEP 5: CLIENTI
-- Solo il titolare può leggere i propri clienti (privacy)
-- Insert pubblico (cliente si registra durante prenotazione)
-- Update pubblico limitato (app aggiorna visite/note cliente)
-- Delete solo al titolare
-- ============================================================
CREATE POLICY "clienti_select_owner"
  ON public.clienti FOR SELECT
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );

CREATE POLICY "clienti_insert_public"
  ON public.clienti FOR INSERT
  WITH CHECK (true);

CREATE POLICY "clienti_update_public"
  ON public.clienti FOR UPDATE
  USING (true);

CREATE POLICY "clienti_delete_owner"
  ON public.clienti FOR DELETE
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );

-- ============================================================
-- STEP 6: ADMINS
-- Solo gli admin possono vedere il proprio record
-- ============================================================
CREATE POLICY "admins_select_self"
  ON public.admins FOR SELECT
  USING (auth.uid() = id);
