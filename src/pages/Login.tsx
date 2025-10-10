import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import LoginForm from "@/components/LoginForm"; // Importar o novo componente

const Login = () => {
  const navigate = useNavigate();
  const session = useSession(); // Hook para obter a sessão do usuário

  // Redireciona para o cardápio se o usuário já estiver logado
  useEffect(() => {
    if (session) {
      navigate("/menu");
    }
  }, [session, navigate]);

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
        
        <div className="mt-8">
          <LoginForm /> {/* Usar o novo componente LoginForm */}
        </div>
      </div>
    </div>
  );
};

export default Login;