-- Verifica e ricrea la policy di delete per servizi
DROP POLICY IF EXISTS "servizi_delete_owner" ON public.servizi;

CREATE POLICY "servizi_delete_owner"
  ON public.servizi FOR DELETE
  USING (
    salone_id IN (SELECT id FROM public.saloni WHERE user_id = auth.uid())
  );

-- Verifica che RLS sia abilitata
ALTER TABLE public.servizi ENABLE ROW LEVEL SECURITY;
