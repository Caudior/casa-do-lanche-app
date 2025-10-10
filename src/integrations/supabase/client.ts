import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adicionando logs para depuração, sem lançar erro imediatamente
console.log("DEBUG: Supabase client.ts carregado.");
console.log("DEBUG: VITE_SUPABASE_URL lido:", supabaseUrl);
console.log("DEBUG: VITE_SUPABASE_ANON_KEY lido:", supabaseKey);

// Apenas crie o cliente se as chaves existirem, caso contrário, o erro será lançado pelo Supabase SDK
// ou o app pode continuar a carregar com funcionalidade Supabase desativada temporariamente para depuração.
export const supabase = createClient(
  supabaseUrl || 'http://localhost', // Valor dummy para evitar erro de tipo se undefined
  supabaseKey || 'dummy_key' // Valor dummy para evitar erro de tipo se undefined
);

// Se as chaves forem realmente undefined, ainda podemos querer um aviso claro
if (!supabaseUrl || !supabaseKey) {
  console.error('AVISO: As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram definidas corretamente.');
}