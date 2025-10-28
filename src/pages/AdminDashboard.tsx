import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import LogoutButton from "@/components/LogoutButton";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole, userProfile } = useUserRole();

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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Painel Administrativo {userProfile?.nome && <span className="text-muted-foreground text-2xl"> - Olá, {userProfile.nome}!</span>}
          </h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={() => navigate("/menu")} variant="outline" className="w-full sm:w-auto">
              Ver Cardápio
            </Button>
            <LogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Gerenciar Cardápio</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">Adicione, edite ou remova itens do cardápio.</p>
              <Button onClick={() => navigate("/admin/menu-management")} className="w-full bg-primary hover:bg-primary/90">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Gerenciar Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">Visualize e atualize o status dos pedidos.</p>
              <Button onClick={() => navigate("/admin/order-management")} className="w-full bg-primary hover:bg-primary/90">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Relatórios Mensais</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">Gere relatórios de gastos por cliente.</p>
              <Button onClick={() => navigate("/admin/reports")} className="w-full bg-primary hover:bg-primary/90">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Pedidos Pagos</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">Visualize e gerencie pedidos que já foram pagos.</p>
              <Button onClick={() => navigate("/admin/paid-orders")} className="w-full bg-primary hover:bg-primary/90">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Disponibilidade Diária</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">Defina e gerencie a quantidade de itens disponíveis por dia.</p>
              <Button onClick={() => navigate("/admin/daily-availability")} className="w-full bg-primary hover:bg-primary/90">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Inserir Dados de Teste</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground mb-4">Página temporária para inserir pedidos de teste.</p>
              <Button onClick={() => navigate("/temp-data-inserter")} className="w-full bg-secondary hover:bg-secondary/90">
                Acessar Teste
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;