import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react"; // Import useState

const Index = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole } = useUserRole();
  const [supabaseConfigError, setSupabaseConfigError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupabaseConfig = () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setSupabaseConfigError(
          "As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram definidas. O aplicativo pode não funcionar corretamente."
        );
      } else {
        setSupabaseConfigError(null);
      }
    };

    checkSupabaseConfig();
  }, []);

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
        {supabaseConfigError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro de Configuração:</strong>
            <span className="block sm:inline"> {supabaseConfigError}</span>
            <p className="text-sm mt-2">Por favor, verifique seu arquivo `.env` e certifique-se de que as chaves do Supabase estão configuradas.</p>
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
    </div>
  );
};

export default Index;