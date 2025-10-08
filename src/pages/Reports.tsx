import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";

const Reports = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole } = useUserRole();

  useEffect(() => {
    if (!isLoadingRole && userRole !== "admin") {
      navigate("/"); // Redirecionar não-administradores
    }
  }, [userRole, isLoadingRole, navigate]);

  if (isLoadingRole) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Carregando...</div>;
  }

  if (userRole !== "admin") {
    return null; // Ou uma mensagem de "Acesso Negado"
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Relatórios Mensais por Cliente</h1>
          <Button onClick={() => navigate("/admin")} variant="outline">
            Voltar para o Painel
          </Button>
        </div>
        <p className="text-muted-foreground">
          Esta é a tela de relatórios. Aqui você poderá gerar relatórios mensais por cliente com filtros de mês e ano.
          (Funcionalidade a ser implementada)
        </p>
      </div>
    </div>
  );
};

export default Reports;