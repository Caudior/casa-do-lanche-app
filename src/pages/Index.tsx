import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react"; // Importar useEffect e useState

const Index = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole } = useUserRole();
  const [supabaseEnvStatus, setSupabaseEnvStatus] = useState("Verificando...");

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (url && key && url !== 'http://localhost' && key !== 'dummy_key') {
      setSupabaseEnvStatus("Supabase configurado (chaves presentes)");
    } else if (!url || !key) {
      setSupabaseEnvStatus("ERRO: Chaves Supabase ausentes no .env");
    } else {
      setSupabaseEnvStatus("AVISO: Usando chaves Supabase dummy (verifique .env)");
    }
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
        <div className="space-x-4">
          <Button onClick={() => navigate("/login")} className="bg-primary hover:bg-primary/90">
            Login
          </Button>
          <Button onClick={() => navigate("/register")} variant="outline">
            Criar Conta
          </Button>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Status Supabase: <span className="font-semibold">{supabaseEnvStatus}</span>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;