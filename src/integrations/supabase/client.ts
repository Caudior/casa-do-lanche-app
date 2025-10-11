import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient;

// Verifique se as chaves estão presentes antes de criar o cliente
if (!supabaseUrl) {
  console.error('ERRO: A variável de ambiente VITE_SUPABASE_URL não foi definida corretamente. Verifique seu arquivo .env.');
  throw new Error('VITE_SUPABASE_URL is not defined.');
}
if (!supabaseKey) {
  console.error('ERRO: A variável de ambiente VITE_SUPABASE_ANON_KEY não foi definida corretamente. Verifique seu arquivo .env.');
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined.');
}

client = createClient(supabaseUrl, supabaseKey);

export const supabase = client;