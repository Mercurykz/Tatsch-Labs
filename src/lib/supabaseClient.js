import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Atenção: Supabase URL ou Anon Key não encontradas no arquivo .env");
}

export const supabase = createClient(supabaseUrl || 'https://sua-url-de-exemplo.supabase.co', supabaseAnonKey || 'sua-chave-publica-anon-key')
