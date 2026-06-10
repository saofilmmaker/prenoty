

---

## Step 8 — Aggiungere il parametro fbc alle azioni personalizzate

### Perche serve
Il parametro fbc e l ID clic di Facebook (dal cookie _fbc). Inviarlo negli eventi
server-side migliora la qualita dell associazione degli eventi in Meta Events Manager.
Senza fbc, il punteggio rimane basso (~6/10) anche con email e nome presenti.

### Come configurarlo in Zaraz

Per ogni azione personalizzata (Lead Accedi, Lead Registrati):

1. Apri l azione → Aggiungi campo
2. Seleziona Aggiungi campo personalizzato in fondo alla lista
3. Nome campo: fbc
4. Valore: clicca + → scorri fino alla sezione COOKIE → clicca Cookie...
5. Nel popup scrivi: _fbc → clicca Conferma
6. Salva

### Risultato atteso
Il punteggio qualita associazione in Meta Events Manager dovrebbe
salire da ~6/10 a 7-8/10 nei giorni successivi alla configurazione.
