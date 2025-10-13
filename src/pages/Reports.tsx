import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Share2 } from "lucide-react";
import { format, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateClientReportPdf } from "@/utils/pdfGenerator";

interface Order {
  id: string;
  usuario_id: string;
  cardapio_id: string;
  quantidade: number;
  total: number;
  status: string;
  data_pedido: string;
  item_nome?: string;
}

interface ClientReport {
  userId: string;
  userName: string;
  userPhone: string;
  userSector: string;
  totalSpent: number;
  numOrders: number;
  orders: Order[];
}

const Reports = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole, userProfile } = useUserRole(); // Usando userProfile
  const { toast } = useToast();

  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());

  const [selectedMonth, setSelectedMonth] = useState<string>((currentMonth + 1).toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [clientReports, setClientReports] = useState<ClientReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(0, i);
    return { value: (i + 1).toString(), label: format(date, "MMMM", { locale: ptBR }) };
  });

  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  useEffect(() => {
    if (!isLoadingRole && userRole !== "admin") {
      navigate("/");
    } else if (userRole === "admin") {
      fetchClientReports();
    }
  }, [userRole, isLoadingRole, navigate, selectedMonth, selectedYear]);

  const fetchClientReports = async () => {
    setLoadingReports(true);
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth) - 1; // Mês é 0-indexado para Date

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0); // Último dia do mês

    const { data: ordersData, error } = await supabase
      .from("pedidos")
      .select("*, usuario(id, nome, telefone, setor), cardapio(nome)") // Incluindo 'setor'
      .gte("data_pedido", startOfMonth.toISOString())
      .lt("data_pedido", endOfMonth.toISOString())
      .order("data_pedido", { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar relatórios: " + error.message,
        variant: "destructive",
      });
      setClientReports([]);
    } else {
      const reportsMap = new Map<string, ClientReport>();

      ordersData.forEach((order: any) => {
        const userId = order.usuario.id;
        if (!reportsMap.has(userId)) {
          reportsMap.set(userId, {
            userId: userId,
            userName: order.usuario.nome || "Usuário Desconhecido",
            userPhone: order.usuario.telefone || "N/A",
            userSector: order.usuario.setor || "N/A", // Populando o setor
            totalSpent: 0,
            numOrders: 0,
            orders: [],
          });
        }
        const clientReport = reportsMap.get(userId)!;
        clientReport.totalSpent += parseFloat(order.total);
        clientReport.numOrders += 1;
        clientReport.orders.push({
          ...order,
          item_nome: order.cardapio?.nome || "Item Desconhecido",
          quantidade: parseFloat(order.quantidade), // Mantido parseFloat para robustez
          total: parseFloat(order.total),
        });
      });
      setClientReports(Array.from(reportsMap.values()).sort((a, b) => b.totalSpent - a.totalSpent));
    }
    setLoadingReports(false);
  };

  const handleShareReport = (client: ClientReport) => {
    const monthName = months.find(m => m.value === selectedMonth)?.label;
    
    // 1. Gerar e baixar o PDF
    if (monthName) {
      generateClientReportPdf(client, monthName, selectedYear);
      toast({
        title: "PDF Gerado!",
        description: "O relatório em PDF foi baixado. Anexe-o manualmente no WhatsApp.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível determinar o nome do mês para o PDF.",
        variant: "destructive",
      });
      return;
    }

    // 2. Abrir WhatsApp com a mensagem de texto
    let message = `*Relatório Mensal de Pedidos - ${monthName}/${selectedYear}*\n\n`;
    message += `*Cliente:* ${client.userName}\n`;
    message += `*Telefone:* ${client.userPhone}\n`;
    message += `*Setor:* ${client.userSector}\n`;
    message += `*Total Gasto:* R$ ${client.totalSpent.toFixed(2).replace('.', ',')}\n`;
    message += `*Número de Pedidos:* ${client.numOrders}\n\n`;
    message += `*Detalhes dos Pedidos:*\n`;

    client.orders.forEach((order, index) => {
      message += `  ${index + 1}. ${order.item_nome} (x${order.quantidade}) - R$ ${order.total.toFixed(2).replace('.', ',')} em ${format(new Date(order.data_pedido), "dd/MM HH:mm", { locale: ptBR })}\n`;
    });

    const whatsappUrl = `https://wa.me/${client.userPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Relatórios Mensais por Cliente {userProfile?.nome && <span className="text-muted-foreground text-2xl"> - Olá, {userProfile.nome}!</span>}
          </h1>
          <Button onClick={() => navigate("/admin")} variant="outline" className="w-full sm:w-auto">
            Voltar para o Painel
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtrar Período</CardTitle>
            <p className="text-sm text-muted-foreground">Selecione o mês e ano para visualizar</p>
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
            <CardTitle>Relatório por Cliente</CardTitle>
            <p className="text-sm text-muted-foreground">Clientes que mais compraram no período selecionado</p>
          </CardHeader>
          <CardContent>
            {loadingReports ? (
              <div className="text-center text-muted-foreground">Carregando relatórios...</div>
            ) : clientReports.length === 0 ? (
              <div className="text-center text-muted-foreground">Nenhum pedido encontrado para o período selecionado.</div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {clientReports.map((client, index) => (
                  <AccordionItem key={client.userId} value={client.userId} className="border-b border-border">
                    <AccordionTrigger className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-muted/50 text-left">
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold">
                          {index + 1}
                        </span>
                        <div className="text-left">
                          <p className="font-bold text-foreground">{client.userName}</p>
                          <p className="text-sm text-muted-foreground">{client.userSector} • {client.numOrders} pedidos</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <span className="text-lg font-semibold text-secondary">R$ {client.totalSpent.toFixed(2).replace('.', ',')}</span>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que o accordion feche/abra
                            handleShareReport(client);
                          }}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                        >
                          <Share2 className="h-4 w-4 mr-2" /> Compartilhar
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-muted/20">
                      <h3 className="font-semibold text-foreground mb-2">Pedidos de {client.userName}:</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[120px]">Item</TableHead>
                              <TableHead className="min-w-[80px]">Quantidade</TableHead>
                              <TableHead className="min-w-[100px]">Total</TableHead>
                              <TableHead className="min-w-[150px]">Data</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {client.orders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="whitespace-nowrap">{order.item_nome}</TableCell>
                                <TableCell>{order.quantidade}</TableCell>
                                <TableCell className="whitespace-nowrap">R$ {order.total.toFixed(2).replace('.', ',')}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;