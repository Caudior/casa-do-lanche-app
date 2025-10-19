import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn, formatName } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Importando o componente Switch

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

const PaidOrders = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole, userProfile } = useUserRole();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [totalPaidInPeriod, setTotalPaidInPeriod] = useState<number>(0);

  useEffect(() => {
    if (!isLoadingRole && userRole !== "admin") {
      navigate("/");
    } else if (userRole === "admin") {
      fetchPaidOrders(date);
    }
  }, [userRole, isLoadingRole, navigate, date]);

  const fetchPaidOrders = async (selectedDate?: Date) => {
    setLoading(true);
    const today = selectedDate || new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("pedidos")
      .select("*, usuario(nome, email), cardapio(nome)")
      .eq("status", "Pago") // Filtrar por status 'Pago'
      .gte("data_pedido", startOfDay.toISOString())
      .lt("data_pedido", endOfDay.toISOString())
      .order("data_pedido", { ascending: false });

    if (error) {
      showError("Erro ao carregar pedidos pagos: " + error.message);
      setOrders([]);
      setTotalPaidInPeriod(0);
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
      const currentTotal = formattedOrders.reduce((sum, order) => sum + order.total, 0);
      setTotalPaidInPeriod(currentTotal);
    }
    setLoading(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: "Pendente" | "Pago") => {
    setLoading(true);
    const { error } = await supabase
      .from("pedidos")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      showError("Erro ao atualizar status do pedido: " + error.message);
    } else {
      showSuccess(`Status do pedido atualizado para "${newStatus}".`);
      fetchPaidOrders(date); // Re-fetch orders to reflect the change
    }
    setLoading(false);
  };

  if (isLoadingRole) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Carregando...</div>;
  }

  if (userRole !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center mb-4 sm:mb-0">
            <img 
              src="/casa_do_lanche_logo_420.png" 
              alt="Casa do Lanche Logo" 
              className="w-12 h-auto sm:w-16 mr-4" 
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Pedidos Pagos {userProfile?.nome && <span className="text-muted-foreground text-2xl"> - Olá, {userProfile.nome}!</span>}
            </h1>
          </div>
          <Button onClick={() => navigate("/admin")} variant="outline" className="w-full sm:w-auto">
            Voltar para o Painel
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago no Dia</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalPaidInPeriod.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground">
              {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Hoje"}
            </p>
          </CardContent>
        </Card>

        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Label htmlFor="date-filter" className="block text-sm font-medium text-foreground">Filtrar por Data:</Label>
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
          <div className="text-center text-muted-foreground">Carregando pedidos pagos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-muted-foreground">Nenhum pedido pago encontrado para a data selecionada.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Item</TableHead>
                  <TableHead className="min-w-[120px]">Cliente</TableHead>
                  <TableHead className="min-w-[150px]">Email Cliente</TableHead>
                  <TableHead className="min-w-[80px]">Quantidade</TableHead>
                  <TableHead className="min-w-[100px]">Total</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Data do Pedido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium whitespace-nowrap">{order.item_nome}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatName(order.usuario_nome)}</TableCell>
                    <TableCell className="whitespace-nowrap">{order.usuario_email}</TableCell>
                    <TableCell>{order.quantidade}</TableCell>
                    <TableCell className="whitespace-nowrap">R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{order.status}</span>
                        <Switch
                          checked={order.status === "Pago"}
                          onCheckedChange={(checked) => handleUpdateOrderStatus(order.id, checked ? "Pago" : "Pendente")}
                          aria-label={`Marcar pedido ${order.item_nome} como pago`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{format(new Date(order.data_pedido), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
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

export default PaidOrders;