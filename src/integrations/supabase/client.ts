import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adicionando logs para depuração
console.log("DEBUG: VITE_SUPABASE_URL lido:", supabaseUrl);
console.log("DEBUG: VITE_SUPABASE_ANON_KEY lido:", supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem ser definidas.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);