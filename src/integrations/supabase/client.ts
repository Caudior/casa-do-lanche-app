import { createClient } from '@supabase/supabase-js';
import { showError } from '@/utils/toast'; // Importar o utilitário de toast

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adicionando logs para depuração, sem lançar erro imediatamente
console.log("DEBUG: Supabase client.ts carregado.");
console.log("DEBUG: VITE_SUPABASE_URL lido:", supabaseUrl);
console.log("DEBUG: VITE_SUPABASE_ANON_KEY lido:", supabaseKey);

// Verifique se as chaves estão presentes antes de criar o cliente
if (!supabaseUrl || !supabaseKey) {
  const errorMessage = 'ERRO: As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram definidas corretamente. Verifique seu arquivo .env.';
  console.error(errorMessage);
  showError(errorMessage); // Mostrar toast de erro na UI
  // Retorna um cliente dummy para evitar que a aplicação quebre, mas com aviso claro
  export const supabase = createClient('http://localhost', 'dummy_key');
} else {
  export const supabase = createClient(supabaseUrl, supabaseKey);
}