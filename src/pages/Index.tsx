import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import { supabaseUrl, supabaseKey } from "@/integrations/supabase/client"; // Importando as variáveis exportadas

const Index = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole } = useUserRole();
  const [supabaseConfigError, setSupabaseConfigError] = useState<string | null>(null);

  useEffect(() => {
    // Esta verificação agora usa as variáveis exportadas diretamente
    if (!supabaseUrl || !supabaseKey) {
      setSupabaseConfigError(
        "As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram definidas. O aplicativo pode não funcionar corretamente."
      );
    } else {
      setSupabaseConfigError(null);
    }
  }, []); // As dependências são constantes, então o array pode ser vazio

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center mb-8">
        <img 
          src="/casa_do_lanche_logo_420.png" 
          alt="Casa do Lanche Logo" 
          className="mx-auto mb-6 w-64 h-auto" 
        />
        <h1 className="text-4xl font-bold mb-4 text-foreground">Bem-vindo à Casa do Lanche!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Seu lugar favorito para os melhores lanches!
        </p>
        {/* O alerta de depuração foi movido para a página de Login */}
        {supabaseConfigError && ( 
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-left" role="alert">
            <strong className="font-bold">Erro de Configuração do Supabase:</strong>
            <span className="block sm:inline"> {supabaseConfigError}</span>
            <p className="text-sm mt-2">
              Por favor, verifique seu arquivo `.env` e certifique-se de que as chaves do Supabase estão configuradas.
            </p>
            <p className="text-sm mt-2">
              <strong className="font-bold">Valores lidos:</strong>
              <br />
              URL: <span className="font-mono break-all">{supabaseUrl || "Não definida"}</span>
              <br />
              Key (últimos 5 chars): <span className="font-mono">{supabaseKey ? '*****' + supabaseKey.substring(supabaseKey.length - 5) : "Não definida"}</span>
            </p>
          </div>
        )}
        <div className="space-x-4">
          <Button onClick={() => navigate("/login")} className="bg-primary hover:bg-primary/90">
            Login
          </Button>
          <Button onClick={() => navigate("/register")} variant="outline">
            Criar Conta
          </Button>
        </div>
      </div>
      <MadeWithDyad />
      {/* TESTE DE ATUALIZAÇÃO - REMOVER DEPOIS */}
      <div className="mt-8 text-lg font-bold text-green-500">TESTE DE ATUALIZAÇÃO</div>
      {/* FIM DO TESTE */}
    </div>
  );
};

export default Index;