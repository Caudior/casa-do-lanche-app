import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast"; // Importação atualizada
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import LogoutButton from "@/components/LogoutButton";
import { useUserRole } from "@/hooks/useUserRole"; // Importar o hook useUserRole

interface ClientOrder {
  id: string;
  cardapio_id: string;
  quantidade: number;
  total: number;
  status: string;
  data_pedido: string;
  item_nome?: string;
}

const ClientReports = () => {
  const navigate = useNavigate();
  const session = useSession();
  const { userProfile } = useUserRole(); // Usando userProfile

  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());

  const [selectedMonth, setSelectedMonth] = useState<string>((currentMonth + 1).toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [userOrders, setUserOrders] = useState<ClientOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [totalSpentInPeriod, setTotalSpentInPeriod] = useState<number>(0);

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(0, i);
    return { value: (i + 1).toString(), label: format(date, "MMMM", { locale: ptBR }) };
  });

  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  useEffect(() => {
    if (!session) {
      navigate("/login"); // Redirecionar usuários não autenticados
      return;
    }
    fetchUserOrders();
  }, [session, navigate, selectedMonth, selectedYear]);

  const fetchUserOrders = async () => {
    setLoadingOrders(true);
    const userId = session?.user?.id;

    if (!userId) {
      setLoadingOrders(false);
      setUserOrders([]);
      setTotalSpentInPeriod(0);
      return;
    }

    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth) - 1; // Mês é 0-indexado para Date

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0); // Último dia do mês

    const { data, error } = await supabase
      .from("pedidos")
      .select("*, cardapio(nome)")
      .eq("usuario_id", userId)
      .gte("data_pedido", startOfMonth.toISOString())
      .lt("data_pedido", endOfMonth.toISOString())
      .order("data_pedido", { ascending: false });

    if (error) {
      showError("Erro ao carregar seus pedidos: " + error.message); // Usando showError
      setUserOrders([]);
      setTotalSpentInPeriod(0);
    } else {
      const formattedOrders: ClientOrder[] = data.map((order: any) => ({
        id: order.id,
        cardapio_id: order.cardapio_id,
        quantidade: parseFloat(order.quantidade),
        total: parseFloat(order.total),
        status: order.status,
        data_pedido: order.data_pedido,
        item_nome: order.cardapio?.nome || "Item Desconhecido",
      }));
      setUserOrders(formattedOrders);
      const total = formattedOrders.reduce((sum, order) => sum + order.total, 0);
      setTotalSpentInPeriod(total);
    }
    setLoadingOrders(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Meus Relatórios de Pedidos {userProfile?.nome && <span className="text-muted-foreground text-2xl"> - Olá, {userProfile.nome}!</span>}
          </h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={() => navigate("/menu")} variant="outline" className="w-full sm:w-auto">
              Voltar para o Cardápio
            </Button>
            <LogoutButton />
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtrar Período</CardTitle>
            <p className="text-sm text-muted-foreground">Selecione o mês e ano para visualizar seus pedidos</p>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="month-select" className="block text-sm font-medium text-foreground mb-1">Mês</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month-select" className="w-full bg-input text-foreground">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent className="bg-card text-foreground">
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label htmlFor="year-select" className="block text-sm font-medium text-foreground mb-1">Ano</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-select" className="w-full bg-input text-foreground">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent className="bg-card text-foreground">
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              Total Gasto: <span className="text-primary">R$ {totalSpentInPeriod.toFixed(2).replace('.', ',')}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Número de Pedidos: {userOrders.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="text-center text-muted-foreground">Carregando seus pedidos...</div>
            ) : userOrders.length === 0 ? (
              <div className="text-center text-muted-foreground">Nenhum pedido encontrado para o período selecionado.</div>
            ) : (
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
                    {userOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium whitespace-nowrap">{order.item_nome}</TableCell>
                        <TableCell>{order.quantidade}</TableCell>
                        <TableCell className="whitespace-nowrap">R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
                        <TableCell className="whitespace-nowrap">{order.status}</TableCell>
                        <TableCell className="whitespace-nowrap">{format(new Date(order.data_pedido), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientReports;