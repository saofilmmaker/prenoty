-- Aggiunge la colonna "posizione" alla tabella servizi per il riordinamento
-- Esegui questo script nel Supabase SQL Editor

ALTER TABLE public.servizi
  ADD COLUMN IF NOT EXISTS posizione integer DEFAULT 0;

-- Assegna posizione iniziale basata sull'ordine di creazione
UPDATE public.servizi s
SET posizione = sub.rn - 1
FROM (
  SELECT id, salone_id,
         ROW_NUMBER() OVER (PARTITION BY salone_id ORDER BY created_at ASC) AS rn
  FROM public.servizi
) sub
WHERE s.id = sub.id;
