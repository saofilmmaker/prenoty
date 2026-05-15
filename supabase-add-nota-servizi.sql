-- Aggiunge la colonna "nota" alla tabella servizi
-- Esegui questo script nel Supabase SQL Editor

ALTER TABLE public.servizi
  ADD COLUMN IF NOT EXISTS nota text DEFAULT NULL;
