import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null; // Inicializa como null

// Verifique se as chaves estão presentes antes de criar o cliente
if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: As variáveis de ambiente VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não foram definidas corretamente. O cliente Supabase não será inicializado.');
  // O cliente permanece null, e o SessionProvider irá lidar com isso.
} else {
  client = createClient(supabaseUrl, supabaseKey);
}

export const supabase = client;