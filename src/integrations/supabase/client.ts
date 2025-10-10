import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adicionando logs para depuração
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Definido' : 'Não definido');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Definido' : 'Não definido');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem ser definidas.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);