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

  // Adicionar o logo
  const imgData = "/casa_do_lanche_logo_420.png"; // Caminho para o logo na pasta public
  const imgWidth = 40; // Largura da imagem em mm
  const imgHeight = 40; // Altura da imagem em mm (ajustar conforme proporção)
  const imgX = 14; // Posição X
  const imgY = 10; // Posição Y
  doc.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);

  // Ajustar a posição inicial do texto após o logo
  let currentY = imgY + imgHeight + 10; // Começa 10mm abaixo do logo

  // Título
  doc.setFontSize(18);
  doc.text("Relatório Mensal de Pedidos", 14, currentY);
  currentY += 8;
  doc.setFontSize(12);
  doc.text(`Período: ${monthName}/${year}`, 14, currentY);
  currentY += 15;

  // Informações do Cliente
  doc.setFontSize(14);
  doc.text("Dados do Cliente:", 14, currentY);
  currentY += 8;
  doc.setFontSize(12);
  doc.text(`Nome: ${clientReport.userName}`, 14, currentY);
  currentY += 7;
  doc.text(`Telefone: ${clientReport.userPhone}`, 14, currentY);
  currentY += 7;
  doc.text(`Setor: ${clientReport.userSector}`, 14, currentY);
  currentY += 7;
  doc.text(`Total Gasto: R$ ${clientReport.totalSpent.toFixed(2).replace('.', ',')}`, 14, currentY);
  currentY += 7;
  doc.text(`Número de Pedidos: ${clientReport.numOrders}`, 14, currentY);
  currentY += 15;

  // Tabela de Pedidos
  doc.setFontSize(14);
  doc.text("Detalhes dos Pedidos:", 14, currentY);
  currentY += 10;

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
    startY: currentY,
    headStyles: { fillColor: [56, 189, 248] }, // Cor de cabeçalho da tabela (azul claro)
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { top: 10 },
  });

  doc.save(`Relatorio_Pedidos_${clientReport.userName}_${monthName}_${year}.pdf`);
};