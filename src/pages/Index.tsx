import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

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
          <Button onClick={() => navigate("/menu")} className="bg-primary hover:bg-primary/90">
            Entrar
          </Button>
          <Button onClick={() => navigate("/register")} variant="outline">
            Criar Conta
          </Button>
          <Button onClick={() => navigate("/menu")} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            Ver Cardápio
          </Button>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;