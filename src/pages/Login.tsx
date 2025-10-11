import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import LoginForm from "@/components/LoginForm";
import { supabaseUrl, supabaseKey } from "@/integrations/supabase/client"; // Importando as variáveis exportadas

const Login = () => {
  const navigate = useNavigate();
  const session = useSession();
  const [supabaseConfigError, setSupabaseConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      navigate("/menu");
    }
  }, [session, navigate]);

  useEffect(() => {
    // Esta verificação agora usa as variáveis exportadas diretamente
    if (!supabaseUrl || !supabaseKey) {
      setSupabaseConfigError(
        "As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram definidas. O aplicativo pode não funcionar corretamente."
      );
    } else {
      setSupabaseConfigError(null);
    }
  }, []);

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
        
        {/* Este bloco agora sempre será exibido para depuração na tela de login */}
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4 text-left" role="alert">
          <strong className="font-bold">Status da Configuração do Supabase:</strong>
          <span className="block sm:inline"> {supabaseConfigError || "Variáveis de ambiente do Supabase lidas."}</span>
          <p className="text-sm mt-2">
            <strong className="font-bold">Valores lidos:</strong>
            <br />
            URL: <span className="font-mono break-all">{supabaseUrl || "Não definida"}</span>
            <br />
            Key (completa para depuração): <span className="font-mono break-all">{supabaseKey || "Não definida"}</span>
          </p>
          {supabaseConfigError && (
            <p className="text-sm mt-2 text-red-700">
              Por favor, verifique seu arquivo `.env` e certifique-se de que as chaves do Supabase estão configuradas corretamente.
            </p>
          )}
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;