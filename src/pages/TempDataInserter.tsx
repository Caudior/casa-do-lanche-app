"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatName, cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { generateClientReportPdf } from "@/utils/pdfGenerator"; // Importar a função de geração de PDF

interface User {
  id: string;
  nome: string;
  email: string;
}

interface MenuItem {
  id: string;
  nome: string;
  preco: number;
}

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

const TempDataInserter = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
  const [selectedMenuItemPrice, setSelectedMenuItemPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isInserting, setIsInserting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar todos os usuários
        const { data: usersData, error: usersError } = await supabase
          .from("usuario")
          .select("id, nome, email")
          .order("nome", { ascending: true });

        if (usersError) {
          showError("Erro ao buscar usuários: " + usersError.message);
          setUsers([]);
        } else if (usersData) {
          setUsers(usersData as User[]);
          showSuccess(`Usuários carregados: ${usersData.length}`);
        }

        // Buscar todos os itens do cardápio ativos
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from("cardapio")
          .select("id, nome, preco")
          .eq("ativo", true)
          .order("nome", { ascending: true });

        if (menuItemsError) {
          showError("Erro ao buscar itens do cardápio: " + menuItemsError.message);
          setMenuItems([]);
        } else if (menuItemsData) {
          setMenuItems(menuItemsData as MenuItem[]);
          showSuccess(`Itens do cardápio carregados: ${menuItemsData.length}`);
        }

      } catch (error: any) {
        showError("Erro geral ao buscar dados: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Atualiza o preço do item selecionado quando o item do cardápio muda
  useEffect(() => {
    if (selectedMenuItemId) {
      const item = menuItems.find(item => item.id === selectedMenuItemId);
      setSelectedMenuItemPrice(item?.preco || null);
    } else {
      setSelectedMenuItemPrice(null);
    }
  }, [selectedMenuItemId, menuItems]);

  const handleInsertOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInserting(true);

    if (!selectedUserId || !selectedMenuItemId || selectedMenuItemPrice === null) {
      showError("Por favor, selecione um usuário e um item do cardápio.");
      setIsInserting(false);
      return;
    }

    if (quantity <= 0) {
      showError("A quantidade deve ser maior que zero.");
      setIsInserting(false);
      return;
    }

    try {
      const total = selectedMenuItemPrice * quantity;
      const orderDate = selectedDate ? selectedDate.toISOString() : new Date().toISOString();

      const { error } = await supabase.from("pedidos").insert({
        usuario_id: selectedUserId,
        cardapio_id: selectedMenuItemId,
        quantidade: quantity,
        total: parseFloat(total.toFixed(2)),
        status: "Pendente",
        data_pedido: orderDate,
      });

      if (error) {
        throw error;
      }

      const selectedUser = users.find(u => u.id === selectedUserId);
      const selectedItem = menuItems.find(item => item.id === selectedMenuItemId);

      showSuccess(`Pedido de ${quantity}x ${selectedItem?.nome || 'Item'} para ${selectedUser?.nome || 'Usuário'} inserido com sucesso! Total: R$ ${total.toFixed(2).replace('.', ',')}`);
      setQuantity(1);
    } catch (error: any) {
      showError("Erro ao inserir pedido: " + error.message);
    } finally {
      setIsInserting(false);
    }
  };

  const handleGenerateTestReport = () => {
    const dummyClientReport: ClientReport = {
      userId: "test-user-123",
      userName: "Cliente Teste",
      userPhone: "21987654321",
      userSector: "TI",
      totalSpent: 150.75,
      numOrders: 3,
      orders: [
        {
          id: "order-1",
          usuario_id: "test-user-123",
          cardapio_id: "item-1",
          quantidade: 2,
          total: 50.00,
          status: "Concluído",
          data_pedido: new Date().toISOString(),
          item_nome: "Hambúrguer Clássico",
        },
        {
          id: "order-2",
          usuario_id: "test-user-123",
          cardapio_id: "item-2",
          quantidade: 1,
          total: 35.75,
          status: "Pendente",
          data_pedido: new Date().toISOString(),
          item_nome: "Batata Frita Grande",
        },
        {
          id: "order-3",
          usuario_id: "test-user-123",
          cardapio_id: "item-3",
          quantidade: 3,
          total: 65.00,
          status: "Concluído",
          data_pedido: new Date().toISOString(),
          item_nome: "Refrigerante Lata",
        },
      ],
    };

    const monthName = format(new Date(), "MMMM", { locale: ptBR });
    const year = format(new Date(), "yyyy");

    generateClientReportPdf(dummyClientReport, monthName, year);
    showSuccess("Relatório de teste gerado e baixado para sua pasta de downloads.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">Inserir Pedido Temporário</CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            Página de depuração para inserir pedidos de teste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground">Carregando usuários e cardápio...</div>
          ) : (
            <form onSubmit={handleInsertOrder} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-select">Selecionar Usuário</Label>
                  <Select value={selectedUserId || ""} onValueChange={setSelectedUserId}>
                    <SelectTrigger id="user-select" className="w-full bg-input text-foreground">
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent className="bg-card text-foreground">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {formatName(user.nome)} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="menu-item-select">Selecionar Item do Cardápio</Label>
                  <Select value={selectedMenuItemId || ""} onValueChange={setSelectedMenuItemId}>
                    <SelectTrigger id="menu-item-select" className="w-full bg-input text-foreground">
                      <SelectValue placeholder="Selecione um item" />
                    </SelectTrigger>
                    <SelectContent className="bg-card text-foreground">
                      {menuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.nome} (R$ {item.preco.toFixed(2).replace('.', ',')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pizzaPrice">Preço do Item Selecionado</Label>
                  <Input
                    id="pizzaPrice"
                    value={selectedMenuItemPrice !== null ? `R$ ${selectedMenuItemPrice.toFixed(2).replace('.', ',')}` : "N/A"}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    required
                    className="bg-input"
                  />
                </div>
                <div>
                  <Label htmlFor="date-select">Data do Pedido</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card text-foreground">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isInserting || loading || !selectedUserId || !selectedMenuItemId || selectedMenuItemPrice === null}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isInserting ? "Inserindo..." : "Inserir Pedido"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/order-management")}
                className="w-full mt-4"
              >
                Voltar para Gerenciar Pedidos
              </Button>
              <Button
                type="button"
                onClick={handleGenerateTestReport}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mt-4"
              >
                Gerar Relatório de Teste (PDF)
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TempDataInserter;