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
import { CalendarIcon, CheckCircle } from "lucide-react"; // Importando CheckCircle
import { cn, formatName } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Order {
  id: string;
  usuario_id: string;
  cardapio_id: string;
  quantidade: number;
  total: number;
  status: "Pendente" | "Pago"; // Definindo os tipos de status
  data_pedido: string; // ISO string from DB
  item_nome?: string;
}

interface ClientOrderGroup {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userSector: string;
  totalPaid: number;
  totalPending: number;
  orders: Order[];
}

const PaidOrders = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole, userProfile } = useUserRole();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [clientOrderGroups, setClientOrderGroups] = useState<ClientOrderGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDailySales, setTotalDailySales] = useState<number>(0);

  useEffect(() => {
    if (!isLoadingRole && userRole !== "admin") {
      navigate("/");
    } else if (userRole === "admin") {
      fetchClientOrders(date);
    }
  }, [userRole, isLoadingRole, navigate, date]);

  const fetchClientOrders = async (selectedDate?: Date) => {
    setLoading(true);
    const today = selectedDate || new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("pedidos")
      .select("*, usuario(id, nome, email, telefone, setor), cardapio(nome)")
      .gte("data_pedido", startOfDay.toISOString())
      .lt("data_pedido", endOfDay.toISOString())
      .order("data_pedido", { ascending: false });

    if (error) {
      showError("Erro ao carregar pedidos: " + error.message);
      setClientOrderGroups([]);
      setTotalDailySales(0);
    } else {
      const groupsMap = new Map<string, ClientOrderGroup>();
      let currentTotalDailySales = 0;

      data.forEach((order: any) => {
        const userId = order.usuario.id;
        if (!groupsMap.has(userId)) {
          groupsMap.set(userId, {
            userId: userId,
            userName: order.usuario?.nome || "N/A",
            userEmail: order.usuario?.email || "N/A",
            userPhone: order.usuario?.telefone || "N/A",
            userSector: order.usuario?.setor || "N/A",
            totalPaid: 0,
            totalPending: 0,
            orders: [],
          });
        }
        const clientGroup = groupsMap.get(userId)!;
        const orderTotal = parseFloat(order.total);
        
        if (order.status === "Pago") {
          clientGroup.totalPaid += orderTotal;
        } else {
          clientGroup.totalPending += orderTotal;
        }
        clientGroup.orders.push({
          id: order.id,
          usuario_id: order.usuario_id,
          cardapio_id: order.cardapio_id,
          quantidade: parseFloat(order.quantidade),
          total: orderTotal,
          status: order.status,
          data_pedido: order.data_pedido,
          item_nome: order.cardapio?.nome || "N/A",
        });
        currentTotalDailySales += orderTotal;
      });
      setClientOrderGroups(Array.from(groupsMap.values()).sort((a, b) => a.userName.localeCompare(b.userName)));
      setTotalDailySales(currentTotalDailySales);
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
      fetchClientOrders(date); // Re-fetch orders to reflect the change
    }
    setLoading(false);
  };

  const handleMarkAllClientOrdersAsPaid = async (userId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("pedidos")
      .update({ status: "Pago" })
      .eq("usuario_id", userId)
      .eq("status", "Pendente") // Apenas pedidos pendentes
      .gte("data_pedido", new Date(date!).setHours(0,0,0,0).toISOString())
      .lt("data_pedido", new Date(date!).setHours(23,59,59,999).toISOString());

    if (error) {
      showError("Erro ao marcar todos os pedidos como pagos: " + error.message);
    } else {
      showSuccess("Todos os pedidos pendentes do cliente foram marcados como pagos.");
      fetchClientOrders(date);
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
              Gerenciar Pedidos {userProfile?.nome && <span className="text-muted-foreground text-2xl"> - Olá, {formatName(userProfile.nome)}!</span>}
            </h1>
          </div>
          <Button onClick={() => navigate("/admin")} variant="outline" className="w-full sm:w-auto">
            Voltar para o Painel
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas do Dia</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalDailySales.toFixed(2).replace('.', ',')}
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
          <div className="text-center text-muted-foreground">Carregando pedidos...</div>
        ) : clientOrderGroups.length === 0 ? (
          <div className="text-center text-muted-foreground">Nenhum pedido encontrado para a data selecionada.</div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {clientOrderGroups.map((clientGroup) => (
              <AccordionItem key={clientGroup.userId} value={clientGroup.userId} className="border-b border-border">
                <AccordionTrigger className="flex flex-col sm:flex-row items-center justify-between p-4 hover:bg-muted/50 text-left">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div className="text-left">
                      <p className="font-bold text-foreground">{formatName(clientGroup.userName)}</p>
                      <p className="text-sm text-muted-foreground">{clientGroup.userSector} • {clientGroup.userPhone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    {clientGroup.totalPending > 0 && (
                      <span className="text-lg font-semibold text-destructive">
                        Pendente: R$ {clientGroup.totalPending.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    {clientGroup.totalPaid > 0 && (
                      <span className="text-lg font-semibold text-green-600">
                        Pago: R$ {clientGroup.totalPaid.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    {clientGroup.totalPending > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAllClientOrdersAsPaid(clientGroup.userId);
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Marcar Todos como Pagos
                      </Button>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted/20">
                  <h3 className="font-semibold text-foreground mb-2">Pedidos de {formatName(clientGroup.userName)}:</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Item</TableHead>
                          <TableHead className="min-w-[80px]">Quantidade</TableHead>
                          <TableHead className="min-w-[100px]">Total</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[150px]">Data do Pedido</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientGroup.orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium whitespace-nowrap">{order.item_nome}</TableCell>
                            <TableCell>{order.quantidade}</TableCell>
                            <TableCell className="whitespace-nowrap">R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span>{order.status}</span>
                                <Switch
                                  checked={order.status === "Pago"}
                                  onCheckedChange={(checked) => handleUpdateOrderStatus(order.id, checked ? "Pago" : "Pendente")}
                                  aria-label={`Marcar pedido ${order.item_nome} como pago`}
                                  disabled={loading}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{format(new Date(order.data_pedido), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default PaidOrders;