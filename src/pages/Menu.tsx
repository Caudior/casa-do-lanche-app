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

  const handlePlaceOrder = async (item: MenuItem) => {
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
    const quantity = 1; // Por enquanto, quantidade fixa em 1
    const total = item.preco * quantity;
    const orderDate = new Date().toISOString();

    const { error: insertError } = await supabase.from("pedidos").insert({
      id: orderId,
      usuario_id: session.user.id,
      cardapio_id: item.id,
      quantidade: quantity.toString(), // Converte para string conforme o schema atual
      total: total.toFixed(2).toString(), // Converte para string conforme o schema atual
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
      description: `"${item.nome}" adicionado ao seu pedido.`,
    });

    // Abrir WhatsApp com a mensagem pré-preenchida
    const ownerPhoneNumber = "5521984117689"; // Número de WhatsApp do Claudio Rodrigues
    const ownerName = "CLAUDIO RODRIGUES"; 
    const clientName = userName || "Cliente";

    const whatsappMessage = `Olá ${ownerName}, o cliente ${clientName} confirmo ter comprado o lanche ${item.nome} como mostra a mensagem.`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${ownerPhoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
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
                  <Button onClick={() => handlePlaceOrder(item)} className="w-full bg-primary hover:bg-primary/90">Adicionar ao Pedido</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;