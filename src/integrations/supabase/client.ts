import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { showError } from '@/utils/toast'; // Importar o utilitário de toast

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient;

// Verifique se as chaves estão presentes antes de criar o cliente
if (!supabaseUrl || !supabaseKey) {
  const errorMessage = 'ERRO: As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram definidas corretamente. Verifique seu arquivo .env.';
  console.error(errorMessage);
  showError(errorMessage); // Mostrar toast de erro na UI
  // Retorna um cliente dummy para evitar que a aplicação quebre, mas com aviso claro
  client = createClient('http://localhost', 'dummy_key');
} else {
  client = createClient(supabaseUrl, supabaseKey);
}

export const supabase = client;