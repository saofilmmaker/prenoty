-- ============================================================
-- PRENOTY — FASE 4 / PUNTO 3: recensioni sicure
-- Data: 2026-11-01
--
-- Problemi trovati:
--  1) La funzione "aggiungi_recensione(uuid, jsonb)" può essere chiamata da
--     chiunque e accetta qualsiasi contenuto: si possono riempire di recensioni
--     false (o testi enormi) tutti i saloni.
--  2) La pagina pubblica NON la usava: provava a scrivere direttamente nella
--     tabella "saloni", ma questa scrittura è bloccata per gli anonimi, quindi le
--     recensioni inviate dalla pagina pubblica non venivano salvate.
--
-- Soluzione: una nuova funzione che controlla tutto (voto 1-5, testo corto,
-- niente duplicati, non più di 5 recensioni all'ora e 15 al giorno per salone,
-- massimo 300 recensioni per salone) e salva solo i campi ammessi.
--
-- Si esegue in DUE PARTI.
-- ============================================================


-- ============================================================
-- PARTE A — sicura da eseguire subito (aggiunge una funzione nuova)
-- ============================================================

CREATE OR REPLACE FUNCTION public.aggiungi_recensione(
  p_salone_id uuid,
  p_nome      text,
  p_stelle    integer,
  p_testo     text,
  p_data      text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nome   text := left(btrim(regexp_replace(coalesce(p_nome, ''), '[[:cntrl:]]', ' ', 'g')), 60);
  v_testo  text := left(btrim(regexp_replace(coalesce(p_testo, ''), '[\x01-\x08\x0B\x0C\x0E-\x1F]', '', 'g')), 500);
  v_data   text := left(btrim(regexp_replace(coalesce(p_data, ''), '[[:cntrl:]]', ' ', 'g')), 40);
  v_nuova  jsonb;
  v_ora    integer;
  v_giorno integer;
  v_totale integer;
  v_dupl   boolean;
BEGIN
  IF v_nome = '' OR v_testo = '' THEN
    RAISE EXCEPTION 'dati_mancanti' USING ERRCODE = '22023';
  END IF;
  IF p_stelle IS NULL OR p_stelle < 1 OR p_stelle > 5 THEN
    RAISE EXCEPTION 'voto_non_valido' USING ERRCODE = '22023';
  END IF;

  -- Blocca la riga del salone per evitare invii simultanei che aggirano i limiti
  PERFORM 1 FROM public.saloni WHERE id = p_salone_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'salone_non_trovato' USING ERRCODE = '22023';
  END IF;

  SELECT
    count(*) FILTER (WHERE (r->>'creata_il')::timestamptz > now() - interval '1 hour'),
    count(*) FILTER (WHERE (r->>'creata_il')::timestamptz > now() - interval '1 day'),
    count(*),
    bool_or(r->>'nome' = v_nome AND r->>'testo' = v_testo)
  INTO v_ora, v_giorno, v_totale, v_dupl
  FROM public.saloni s,
       LATERAL jsonb_array_elements(COALESCE(s.recensioni, '[]'::jsonb)) AS r
  WHERE s.id = p_salone_id;

  IF COALESCE(v_dupl, false) THEN
    RAISE EXCEPTION 'recensione_duplicata' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(v_ora, 0) >= 5 OR COALESCE(v_giorno, 0) >= 15 OR COALESCE(v_totale, 0) >= 300 THEN
    RAISE EXCEPTION 'troppe_recensioni' USING ERRCODE = '22023';
  END IF;

  v_nuova := jsonb_build_object(
    'id',        (extract(epoch FROM clock_timestamp()) * 1000)::bigint,
    'nome',      v_nome,
    'stelle',    p_stelle,
    'testo',     v_testo,
    'data',      v_data,
    'creata_il', to_jsonb(now())
  );

  UPDATE public.saloni
     SET recensioni = jsonb_build_array(v_nuova) || COALESCE(recensioni, '[]'::jsonb)
   WHERE id = p_salone_id;

  RETURN v_nuova;
END;
$$;

GRANT EXECUTE ON FUNCTION public.aggiungi_recensione(uuid, text, integer, text, text) TO anon, authenticated;


-- ============================================================
-- TEST TRA LE DUE PARTI (non saltare)
--   1. Aspetta che il nuovo sito sia online (push già fatto).
--   2. Pagina pubblica di Sao Salone → "Scrivi una recensione" → pubblica.
--      Deve comparire subito in pagina, e anche dopo aver ricaricato.
--   3. In dashboard → Recensioni compare la nuova recensione.
--   4. Solo se tutto funziona, esegui la PARTE B.
-- ============================================================


-- ============================================================
-- PARTE B — chiude la vecchia funzione aperta a tutti
-- ============================================================

DROP FUNCTION IF EXISTS public.aggiungi_recensione(uuid, jsonb);
