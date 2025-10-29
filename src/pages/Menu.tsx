import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import LogoutButton from "@/components/LogoutButton";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useSession } from "@supabase/auth-helpers-react";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { format } from "date-fns"; // Importar format para formatar a data

interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  ativo: boolean;
  quantidade_disponivel?: number; // Adicionar campo para disponibilidade
}

const Menu = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole, userProfile } = useUserRole();
  const session = useSession();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [itemToOrder, setItemToOrder] = useState<MenuItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);

  useEffect(() => {
    fetchMenuItemsWithAvailability();
  }, []);

  const fetchMenuItemsWithAvailability = async () => {
    setLoading(true);
    const formattedDate = format(new Date(), "yyyy-MM-dd");

    // 1. Fetch all active menu items
    const { data: menuItemsData, error: menuItemsError } = await supabase
      .from("cardapio")
      .select("id, nome, descricao, preco, imagem_url, ativo")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (menuItemsError) {
      showError("Erro ao carregar itens do cardápio: " + menuItemsError.message);
      setMenuItems([]);
      setLoading(false);
      return;
    }

    // 2. Fetch daily availability for today
    const { data: availabilityData, error: availabilityError } = await supabase
      .from("disponibilidade_diaria_cardapio")
      .select("cardapio_id, quantidade_disponivel")
      .eq("data_disponibilidade", formattedDate);

    if (availabilityError) {
      showError("Erro ao carregar disponibilidade diária: " + availabilityError.message);
      // Continue without availability if there's an error, or set all to 0
      const itemsWithoutAvailability = menuItemsData.map(item => ({
        ...item,
        quantidade_disponivel: 0, // Assume 0 se não conseguir carregar
      }));
      setMenuItems(itemsWithoutAvailability as MenuItem[]);
      setLoading(false);
      return;
    }

    // 3. Combine menu items with their availability
    const combinedMenuItems: MenuItem[] = menuItemsData.map((item: any) => {
      const avail = availabilityData.find((a: any) => a.cardapio_id === item.id);
      return {
        ...item,
        quantidade_disponivel: avail ? avail.quantidade_disponivel : 0, // Default to 0 if no availability set
      };
    });

    setMenuItems(combinedMenuItems);
    setLoading(false);
  };

  const handleOpenOrderDialog = (item: MenuItem) => {
    console.log("Dyad Debug: Abrindo diálogo de pedido para o item:", item.nome);
    setItemToOrder(item);
    setOrderQuantity(1); // Reset quantity when opening dialog
    setIsOrderDialogOpen(true);
  };

  const handleDecreaseQuantity = () => {
    setOrderQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    if (itemToOrder && itemToOrder.quantidade_disponivel !== undefined) {
      setOrderQuantity((prev) => Math.min(prev + 1, itemToOrder.quantidade_disponivel!)); // Limita à disponibilidade
    } else {
      setOrderQuantity((prev) => prev + 1);
    }
  };

  const confirmOrder = async () => {
    console.log("Dyad Debug: Função confirmOrder iniciada."); // Novo log aqui
    if (!itemToOrder) return;

    if (orderQuantity <= 0) {
      showError("A quantidade deve ser maior que zero.");
      return;
    }

    if (!session?.user) {
      showError("Você precisa estar logado para fazer um pedido.");
      navigate("/login");
      return;
    }

    if (itemToOrder.quantidade_disponivel !== undefined && orderQuantity > itemToOrder.quantidade_disponivel) {
      showError(`Não há quantidade suficiente de "${itemToOrder.nome}" disponível. Restam apenas ${itemToOrder.quantidade_disponivel}.`);
      return;
    }

    const total = itemToOrder.preco * orderQuantity;
    const orderDate = new Date();
    const formattedDate = format(orderDate, "yyyy-MM-dd");

    try {
      console.log("Dyad Debug: Tentando fazer pedido via RPC com os seguintes parâmetros:", {
        p_usuario_id: session.user.id,
        p_cardapio_id: itemToOrder.id,
        p_quantidade: orderQuantity,
        p_total: parseFloat(total.toFixed(2)),
        p_status: "Pendente",
        p_data_pedido: orderDate.toISOString(),
        p_data_disponibilidade: formattedDate,
      });

      // Chamar a nova função de banco de dados para registrar o pedido e deduzir o estoque
      const { data: orderId, error: rpcError } = await supabase.rpc('place_order_and_deduct_stock', {
        p_usuario_id: session.user.id,
        p_cardapio_id: itemToOrder.id,
        p_quantidade: orderQuantity,
        p_total: parseFloat(total.toFixed(2)),
        p_status: "Pendente",
        p_data_pedido: orderDate.toISOString(),
        p_data_disponibilidade: formattedDate,
      });

      if (rpcError) {
        console.error("Dyad Debug: Erro na chamada RPC 'place_order_and_deduct_stock':", rpcError);
        throw rpcError;
      }

      console.log("Dyad Debug: Pedido realizado com sucesso, ID do pedido:", orderId);
      showSuccess(`"${itemToOrder.nome}" (x${orderQuantity}) adicionado ao seu pedido.`);

      // Abrir WhatsApp com a mensagem pré-preenchida
      const ownerPhoneNumber = "5521984117689"; // Número de WhatsApp do Claudio Rodrigues
      const ownerName = "CLAUDIO RODRIGUES"; 
      const clientName = userProfile?.nome || "Cliente";
      const formattedTotal = total.toFixed(2).replace('.', ',');

      const whatsappMessage = `Olá ${ownerName}, o cliente ${clientName} confirmou ter comprado ${orderQuantity}x *${itemToOrder.nome}* no valor total de *R$ ${formattedTotal}* como mostra a mensagem.`;
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${ownerPhoneNumber}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');

      setIsOrderDialogOpen(false);
      setItemToOrder(null);
      setOrderQuantity(1);
      console.log("Dyad Debug: Chamando fetchMenuItemsWithAvailability para atualizar a tela.");
      fetchMenuItemsWithAvailability(); // Re-fetch para atualizar a disponibilidade na tela
    } catch (error: any) {
      console.error("Dyad Debug: Erro geral em confirmOrder:", error);
      showError(error.message || "Ocorreu um erro ao fazer o pedido.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Nosso Cardápio {userProfile?.nome && <span className="text-muted-foreground text-2xl"> - Olá, {userProfile.nome}!</span>}
          </h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={() => navigate("/")} variant="outline" className="w-full sm:w-auto">
              Voltar para o Início
            </Button>
            {!isLoadingRole && userRole === "admin" && (
              <Button onClick={() => navigate("/admin")} variant="ghost" className="text-accent hover:text-accent-foreground w-full sm:w-auto">
                Painel Admin
              </Button>
            )}
            {!isLoadingRole && session?.user && (
              <Button onClick={() => navigate("/my-reports")} variant="destructive" className="w-full sm:w-auto">
                Histórico de Pedidos
              </Button>
            )}
            <LogoutButton />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Carregando cardápio...</div>
        ) : menuItems.length === 0 ? (
          <div className="text-center text-muted-foreground">Nenhum item disponível no cardápio.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <img src={item.imagem_url} alt={item.nome} className="w-full h-48 object-cover rounded-t-lg" />
                <CardHeader>
                  <CardTitle>{item.nome}</CardTitle>
                  <CardDescription>{item.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-2xl font-semibold text-primary">R$ {item.preco.toFixed(2)}</p>
                  {item.quantidade_disponivel !== undefined && (
                    <p className={`text-sm mt-2 ${item.quantidade_disponivel > 0 ? "text-muted-foreground" : "text-destructive font-semibold"}`}>
                      Disponível: {item.quantidade_disponivel}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleOpenOrderDialog(item)} 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={item.quantidade_disponivel === 0} // Desabilita se não houver estoque
                  >
                    {item.quantidade_disponivel === 0 ? "Esgotado" : "Adicionar ao Pedido"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de Confirmação de Pedido */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>Confirmar Pedido</DialogTitle>
            <DialogDescription>
              Confirme a quantidade para "{itemToOrder?.nome}"
            </DialogDescription>
          </DialogHeader>
          {itemToOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="item-name" className="text-left sm:text-right">Item</Label>
                <Input id="item-name" value={itemToOrder.nome} readOnly className="col-span-1 sm:col-span-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="item-price" className="text-left sm:text-right">Preço Unitário</Label>
                <Input id="item-price" value={`R$ ${itemToOrder.preco.toFixed(2).replace('.', ',')}`} readOnly className="col-span-1 sm:col-span-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-left sm:text-right">Quantidade</Label>
                <div className="col-span-1 sm:col-span-3 flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDecreaseQuantity}
                    disabled={orderQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="text"
                    readOnly
                    value={orderQuantity}
                    className="w-16 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleIncreaseQuantity}
                    disabled={itemToOrder.quantidade_disponivel !== undefined && orderQuantity >= itemToOrder.quantidade_disponivel}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {itemToOrder.quantidade_disponivel !== undefined && (
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 text-sm text-muted-foreground">
                  <Label className="text-left sm:text-right">Estoque</Label>
                  <span className="col-span-1 sm:col-span-3">
                    {itemToOrder.quantidade_disponivel} disponível
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 font-bold text-lg">
                <Label className="text-left sm:text-right">Total</Label>
                <span className="col-span-1 sm:col-span-3">R$ {(itemToOrder.preco * orderQuantity).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button 
              onClick={confirmOrder} 
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              disabled={itemToOrder?.quantidade_disponivel === 0 || orderQuantity > (itemToOrder?.quantidade_disponivel || 0)}
            >
              Confirmar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;