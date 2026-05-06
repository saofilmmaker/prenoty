import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lievvbydmynrdrmgxljm.supabase.co'
const supabaseKey = 'sb_publishable_5F_dQ3i8fsEuNmS9kXazcA_CWONTYqF'

// Client principale — usato da dashboard salon e app cliente
export const supabase = createClient(supabaseUrl, supabaseKey)

// Client admin — sessione separata, non sovrascrive quella del salone
// Permette di tenere aperto /admin e /dashboard contemporaneamente
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storageKey: 'prenoty-admin-session',
  }
})
