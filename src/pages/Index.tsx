import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center mb-8">
        <img 
          src="/casa_do_lanche_logo_420.png" 
          alt="Casa do Lanche Logo" 
          className="mx-auto mb-6 w-64 h-auto" 
        />
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Bem-vindo à Casa do Lanche!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Seu lugar favorito para os melhores lanches!
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700">
            Login
          </Button>
          <Button onClick={() => navigate("/register")} variant="outline">
            Criar Conta
          </Button>
          <Button onClick={() => navigate("/menu")} variant="secondary"> {/* Novo botão para o cardápio */}
            Ver Cardápio
          </Button>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;