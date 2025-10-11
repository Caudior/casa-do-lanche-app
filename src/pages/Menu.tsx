import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import LogoutButton from "@/components/LogoutButton";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react"; // Importando ícones de mais e menos

interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  ativo: boolean;
}

const Menu = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole } = useUserRole();
  const { toast } = useToast();
  const session = useSession();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [itemToOrder, setItemToOrder] = useState<MenuItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1); // Default quantity

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from("usuario")
          .select("nome")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar nome do usuário:", error.message);
          setUserName(null);
        } else if (data) {
          setUserName(data.nome);
        }
      }
    };
    fetchUserName();
  }, [session]);

  const fetchMenuItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cardapio")
      .select("*")
      .eq("ativo", true) // Buscar apenas itens ativos
      .order("nome", { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar itens do cardápio: " + error.message,
        variant: "destructive",
      });
      setMenuItems([]); // Limpar itens em caso de erro
    } else {
      setMenuItems(data as MenuItem[]);
    }
    setLoading(false);
  };

  const handleOpenOrderDialog = (item: MenuItem) => {
    setItemToOrder(item);
    setOrderQuantity(1); // Reset quantity when opening dialog
    setIsOrderDialogOpen(true);
  };

  const handleDecreaseQuantity = () => {
    setOrderQuantity((prev) => Math.max(1, prev - 1)); // Garante que a quantidade mínima é 1
  };

  const handleIncreaseQuantity = () => {
    setOrderQuantity((prev) => prev + 1);
  };

  const confirmOrder = async () => {
    if (!itemToOrder) return;

    if (orderQuantity <= 0) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer um pedido.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const orderId = uuidv4();
    const total = itemToOrder.preco * orderQuantity;
    const orderDate = new Date().toISOString();

    const { error: insertError } = await supabase.from("pedidos").insert({
      id: orderId,
      usuario_id: session.user.id,
      cardapio_id: itemToOrder.id,
      quantidade: orderQuantity, // Agora diretamente um número
      total: parseFloat(total.toFixed(2)), // Garante 2 casas decimais e tipo numérico
      data_pedido: orderDate,
      status: "Pendente",
    });

    if (insertError) {
      toast({
        title: "Erro ao fazer pedido",
        description: insertError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Pedido Realizado!",
      description: `"${itemToOrder.nome}" (x${orderQuantity}) adicionado ao seu pedido.`,
    });

    // Abrir WhatsApp com a mensagem pré-preenchida
    const ownerPhoneNumber = "5521984117689"; // Número de WhatsApp do Claudio Rodrigues
    const ownerName = "CLAUDIO RODRIGUES"; 
    const clientName = userName || "Cliente";

    const whatsappMessage = `Olá ${ownerName}, o cliente ${clientName} confirmou ter comprado ${orderQuantity}x ${itemToOrder.nome} como mostra a mensagem.`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${ownerPhoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');

    setIsOrderDialogOpen(false); // Fecha o diálogo após o pedido
    setItemToOrder(null);
    setOrderQuantity(1);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Nosso Cardápio</h1>
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate("/")} variant="outline">
              Voltar para o Início
            </Button>
            {!isLoadingRole && userRole === "admin" && (
              <Button onClick={() => navigate("/admin")} variant="ghost" className="text-accent hover:text-accent-foreground">
                Painel Admin
              </Button>
            )}
            {!isLoadingRole && session?.user && ( // Mostrar para usuários logados (clientes ou admins)
              <Button onClick={() => navigate("/my-reports")} variant="destructive"> {/* Alterado para variant="destructive" */}
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
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleOpenOrderDialog(item)} className="w-full bg-primary hover:bg-primary/90">Adicionar ao Pedido</Button>
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-name" className="text-right">Item</Label>
                <Input id="item-name" value={itemToOrder.nome} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-price" className="text-right">Preço Unitário</Label>
                <Input id="item-price" value={`R$ ${itemToOrder.preco.toFixed(2).replace('.', ',')}`} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Quantidade</Label>
                <div className="col-span-3 flex items-center space-x-2">
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
                    type="text" // Alterado para text para evitar teclado numérico em mobile e controlar via botões
                    readOnly
                    value={orderQuantity}
                    className="w-16 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleIncreaseQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 font-bold text-lg">
                <Label className="text-right">Total</Label>
                <span className="col-span-3">R$ {(itemToOrder.preco * orderQuantity).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmOrder} className="bg-primary hover:bg-primary/90">Confirmar Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;