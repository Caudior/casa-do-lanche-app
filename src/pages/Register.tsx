import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast"; // Importação atualizada
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    sector: "",
    userType: "cliente" // Default user type
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            sector: formData.sector,
            userType: formData.userType
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        showSuccess("Conta criada com sucesso. Por favor, verifique seu email."); // Usando showSuccess
        navigate("/login");
      }
    } catch (error: any) {
      showError(error.message || "Ocorreu um erro ao criar a conta."); // Usando showError
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Criar Conta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Preencha os campos abaixo para criar sua conta
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Nome Completo
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
              />
            </div>

            <div>
              <Label htmlFor="phone">
                Telefone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>

            <div>
              <Label htmlFor="sector">
                Setor
              </Label>
              <Input
                id="sector"
                name="sector"
                type="text"
                required
                value={formData.sector}
                onChange={handleInputChange}
                placeholder="Digite seu setor"
              />
            </div>

            <div>
              <Label htmlFor="password">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Digite sua senha"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? "Criando conta..." : "Criar Conta"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full mt-4"
          >
            Voltar para o Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;