-- ============================================================
-- PRENOTY — FASE 3 SICUREZZA: colonne pubbliche della tabella "saloni"
-- Data: 2026-11-01
--
-- Oggi chiunque (ruolo "anon") può leggere TUTTE le colonne di "saloni":
-- identificativo utente, id Stripe, password Report (vecchio campo), ecc.
-- Dopo questo script chi non è collegato legge SOLO le colonne che la pagina
-- pubblica usa. I titolari collegati ("authenticated") non cambiano.
--
-- PRIMA di eseguire: il nuovo sito (che chiede solo queste colonne) deve essere
-- online, e la pagina pubblica di un salone deve funzionare.
-- ============================================================

REVOKE SELECT ON public.saloni FROM anon;

GRANT SELECT (
  id, nome, slug, tipo, indirizzo, telefono, email, descrizione, logo, copertina, copertina_y,
  galleria, social, orari, staff, recensioni, metodi_pagamento,
  mostra_galleria, mostra_mappa, mostra_orari, mostra_recensioni, mostra_social,
  blocco_occupato, blocco_sovrapposizione, limite_sovrapposizione, prenotazione_anticipo,
  ferie_attive, ferie_dal, ferie_al, ferie_messaggio, chiusure_temporanee, aperture_straordinarie,
  stato_abbonamento, abbonamento_attivo, piano_speciale, prova_scade_il
) ON public.saloni TO anon;

-- ============================================================
-- ROLLBACK di emergenza (ridà a "anon" la lettura di tutte le colonne):
--   GRANT SELECT ON public.saloni TO anon;
--
-- NOTA: se in futuro la pagina pubblica deve leggere una colonna nuova, va
-- aggiunta qui (GRANT SELECT (nuova_colonna) ON public.saloni TO anon;) e nella
-- costante COLONNE_PUBBLICHE_SALONE di src/app-cliente-v5.jsx.
-- ============================================================
