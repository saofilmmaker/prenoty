import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lievvbydmynrdrmgxljm.supabase.co'
const supabaseKey = 'sb_publishable_5F_dQ3i8fsEuNmS9kXazcA_CWONTYqF'

export const supabase = createClient(supabaseUrl, supabaseKey)
