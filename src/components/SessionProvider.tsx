"use client";

import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ReactNode, useEffect } from "react"; // Import useEffect

interface SessionProviderProps {
  children: ReactNode;
}

const SessionProvider = ({ children }: SessionProviderProps) => {
  useEffect(() => {
    console.log("SessionProvider: Supabase client instance:", supabase);
    if (!supabase) {
      console.error("SessionProvider: Supabase client is null or undefined!");
    }
  }, []);

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
};

export default SessionProvider;