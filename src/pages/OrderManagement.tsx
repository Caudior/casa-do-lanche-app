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
import { Label } from "@/components/ui/label"; // Importação adicionada

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

  useEffect(() => {
    if (!isLoadingRole && userRole !== "admin") {
      navigate("/"); // Redirecionar não-administradores
    } else if (userRole === "admin") {
      fetchOrders(date);
    }
  }, [userRole, isLoadingRole, navigate, date]);

  const fetchOrders = async (selectedDate?: Date) => {
    setLoading(true);
    let query = supabase
      .from("pedidos")
      .select("*, usuario(nome, email), cardapio(nome)");

    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte("data_pedido", startOfDay.toISOString())
        .lt("data_pedido", endOfDay.toISOString());
    } else {
      // Default to current day if no date is selected
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      query = query
        .gte("data_pedido", today.toISOString())
        .lt("data_pedido", tomorrow.toISOString());
    }

    query = query.order("data_pedido", { ascending: false });

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pedidos: " + error.message,
        variant: "destructive",
      });
      setOrders([]);
    } else {
      const formattedOrders: Order[] = data.map((order: any) => ({
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
      setOrders(formattedOrders);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Gerenciar Pedidos</h1>
          <Button onClick={() => navigate("/admin")} variant="outline">
            Voltar para o Painel
          </Button>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <Label htmlFor="date-filter" className="text-foreground">Filtrar por Data:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
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
                  <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{format(new Date(order.data_pedido), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;