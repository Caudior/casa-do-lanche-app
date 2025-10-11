"use client";

import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

const SessionProvider = ({ children }: SessionProviderProps) => {
  // O cliente Supabase agora é sempre inicializado em src/integrations/supabase/client.ts,
  // então não precisamos mais verificar se é nulo aqui.
  // Erros de chave inválida serão tratados pelas chamadas da API do Supabase e exibidos via toast.
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
};

export default SessionProvider;