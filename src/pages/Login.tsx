import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import LoginForm from "@/components/LoginForm";
import { supabaseUrl, supabaseKey } from "@/integrations/supabase/client"; // Importando as variáveis exportadas

const Login = () => {
  const navigate = useNavigate();
  const session = useSession();
  // Removido o estado supabaseConfigError, pois a depuração visual não é mais necessária aqui.

  useEffect(() => {
    if (session) {
      navigate("/menu");
    }
  }, [session, navigate]);

  // Removido o useEffect que definia supabaseConfigError, pois a depuração visual não é mais necessária aqui.

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <img 
            src="/casa_do_lanche_logo_420.png" 
            alt="Casa do Lanche Logo" 
            className="mx-auto mb-6 w-48 h-auto" 
          />
          <h1 className="text-3xl font-bold text-foreground">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre na sua conta para continuar
          </p>
        </div>
        
        {/* O bloco de depuração foi removido daqui. */}

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;