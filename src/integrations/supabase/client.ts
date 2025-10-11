import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adicionando logs para verificar se as variáveis de ambiente estão sendo lidas
console.log('Supabase URL lida do .env:', supabaseUrl);
console.log('Supabase Key lida do .env (completa):', supabaseKey); // Log da chave completa aqui

// Sempre cria uma instância do cliente Supabase.
// Se as chaves estiverem ausentes, o Supabase.js ainda criará um objeto,
// mas as chamadas à API falharão com o erro "Invalid API key", que será capturado pelo nosso toast.
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'http://localhost:3000', // Fallback URL para evitar null
  supabaseKey || 'dummy_key' // Fallback Key para evitar null
);