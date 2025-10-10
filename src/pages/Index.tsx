import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole"; // Importar o hook

const Index = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole } = useUserRole(); // Usar o hook

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
          {/* O botão "Painel Admin" foi removido daqui */}
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;