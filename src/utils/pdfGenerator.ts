import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export const generateClientReportPdf = (
  clientReport: ClientReport,
  monthName: string,
  year: string
) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text("Relatório Mensal de Pedidos", 14, 22);
  doc.setFontSize(12);
  doc.text(`Período: ${monthName}/${year}`, 14, 30);

  // Informações do Cliente
  doc.setFontSize(14);
  doc.text("Dados do Cliente:", 14, 45);
  doc.setFontSize(12);
  doc.text(`Nome: ${clientReport.userName}`, 14, 53);
  doc.text(`Telefone: ${clientReport.userPhone}`, 14, 60);
  doc.text(`Setor: ${clientReport.userSector}`, 14, 67);
  doc.text(`Total Gasto: R$ ${clientReport.totalSpent.toFixed(2).replace('.', ',')}`, 14, 74);
  doc.text(`Número de Pedidos: ${clientReport.numOrders}`, 14, 81);

  // Tabela de Pedidos
  doc.setFontSize(14);
  doc.text("Detalhes dos Pedidos:", 14, 96);

  const tableColumn = ["Item", "Quantidade", "Total", "Data"];
  const tableRows: any[] = [];

  clientReport.orders.forEach((order) => {
    const orderData = [
      order.item_nome,
      order.quantidade,
      `R$ ${order.total.toFixed(2).replace('.', ',')}`,
      format(new Date(order.data_pedido), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    ];
    tableRows.push(orderData);
  });

  (doc as any).autoTable(tableColumn, tableRows, {
    startY: 105,
    headStyles: { fillColor: [56, 189, 248] }, // Cor de cabeçalho da tabela (azul claro)
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { top: 10 },
  });

  doc.save(`Relatorio_Pedidos_${clientReport.userName}_${monthName}_${year}.pdf`);
};