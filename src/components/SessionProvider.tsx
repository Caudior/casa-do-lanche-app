"use client";

import { createClient } from "@/integrations/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

const SessionProvider = ({ children }: SessionProviderProps) => {
  const supabase = createClient();

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
};

export default SessionProvider;