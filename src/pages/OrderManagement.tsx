import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Importar Card

interface Order {
  id: string;
  usuario_id: string;
  cardapio_id: string;
  quantidade: number;
  total: number;
  status: string;
  data_pedido: string; // ISO string from DB
  usuario_nome?: string;
  usuario_email?: string;
  item_nome?: string;
}

const OrderManagement = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole } = useUserRole();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date()); // Default to current day
  const [dailyTotal, setDailyTotal] = useState<number>(0);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);

  useEffect(() => {
    if (!isLoadingRole && userRole !== "admin") {
      navigate("/"); // Redirecionar não-administradores
    } else if (userRole === "admin") {
      fetchOrders(date);
    }
  }, [userRole, isLoadingRole, navigate, date]);

  const fetchOrders = async (selectedDate?: Date) => {
    setLoading(true);
    const today = selectedDate || new Date(); // Usa selectedDate ou o dia atual para a visualização diária

    // --- Buscar pedidos para o dia selecionado (para a tabela e total diário) ---
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: dailyOrdersData, error: dailyError } = await supabase
      .from("pedidos")
      .select("*, usuario(nome, email), cardapio(nome)")
      .gte("data_pedido", startOfDay.toISOString())
      .lt("data_pedido", endOfDay.toISOString())
      .order("data_pedido", { ascending: false });

    if (dailyError) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pedidos do dia: " + dailyError.message,
        variant: "destructive",
      });
      setOrders([]);
      setDailyTotal(0);
    } else {
      const formattedDailyOrders: Order[] = dailyOrdersData.map((order: any) => ({
        id: order.id,
        usuario_id: order.usuario_id,
        cardapio_id: order.cardapio_id,
        quantidade: parseFloat(order.quantidade),
        total: parseFloat(order.total),
        status: order.status,
        data_pedido: order.data_pedido,
        usuario_nome: order.usuario?.nome || "N/A",
        usuario_email: order.usuario?.email || "N/A",
        item_nome: order.cardapio?.nome || "N/A",
      }));
      setOrders(formattedDailyOrders);
      const currentDailyTotal = formattedDailyOrders.reduce((sum, order) => sum + order.total, 0);
      setDailyTotal(currentDailyTotal);
    }

    // --- Buscar pedidos para o mês corrente (para o total mensal) ---
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0); // Último dia do mês corrente

    const { data: monthlyOrdersData, error: monthlyError } = await supabase
      .from("pedidos")
      .select("total")
      .gte("data_pedido", startOfMonth.toISOString())
      .lt("data_pedido", endOfMonth.toISOString());

    if (monthlyError) {
      console.error("Erro ao carregar pedidos do mês para total:", monthlyError.message);
      setMonthlyTotal(0);
    } else {
      const currentMonthlyTotal = monthlyOrdersData.reduce((sum, order: any) => sum + parseFloat(order.total), 0);
      setMonthlyTotal(currentMonthlyTotal);
    }

    setLoading(false);
  };

  if (isLoadingRole) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Carregando...</div>;
  }

  if (userRole !== "admin") {
    return null; // Ou uma mensagem de "Acesso Negado"
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <img 
              src="/casa_do_lanche_logo_420.png" 
              alt="Casa do Lanche Logo" 
              className="w-16 h-auto mr-4" 
            />
            <h1 className="text-4xl font-bold text-foreground">Gerenciar Pedidos</h1>
          </div>
          <Button onClick={() => navigate("/admin")} variant="outline">
            Voltar para o Painel
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas do Dia</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {dailyTotal.toFixed(2).replace('.', ',')}</div>
              <p className="text-xs text-muted-foreground">
                {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Hoje"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas do Mês</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {monthlyTotal.toFixed(2).replace('.', ',')}</div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), "MMMM yyyy", { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Label htmlFor="date-filter" className="text-foreground">Filtrar por Data:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card text-foreground">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Carregando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-muted-foreground">Nenhum pedido encontrado para a data selecionada.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email Cliente</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data do Pedido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.item_nome}</TableCell>
                    <TableCell>{order.usuario_nome}</TableCell>
                    <TableCell>{order.usuario_email}</TableCell>
                    <TableCell>{order.quantidade}</TableCell>
                    <TableCell>R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{format(new Date(order.data_pedido), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;