"use client";

import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

const SessionProvider = ({ children }: SessionProviderProps) => {
  if (!supabase) {
    // Se o cliente Supabase não foi inicializado (devido a variáveis de ambiente ausentes),
    // renderiza os filhos diretamente para permitir que o aplicativo inicie e exiba a mensagem de erro.
    console.warn("Supabase client is not initialized. Functionality requiring Supabase will not work.");
    return <>{children}</>;
  }
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
};

export default SessionProvider;