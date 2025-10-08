import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600 mb-8">
          Start building your amazing project here!
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700">
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