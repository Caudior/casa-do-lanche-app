import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  ativo: boolean;
}

const MenuManagement = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole, userProfile } = useUserRole(); // Usando userProfile
  const { toast } = useToast();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<Partial<MenuItem> | null>(null);

  useEffect(() => {
    if (!isLoadingRole && userRole !== "admin") {
      navigate("/"); // Redirecionar não-administradores
    } else if (userRole === "admin") {
      fetchMenuItems();
    }
  }, [userRole, isLoadingRole, navigate]);

  const fetchMenuItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cardapio")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar itens do cardápio: " + error.message,
        variant: "destructive",
      });
    } else {
      setMenuItems(data as MenuItem[]);
    }
    setLoading(false);
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMenuItem?.nome || !currentMenuItem?.descricao || !currentMenuItem?.preco || !currentMenuItem?.imagem_url) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    let error = null;

    if (currentMenuItem.id) {
      // Atualizar item existente
      const { error: updateError } = await supabase
        .from("cardapio")
        .update({
          nome: currentMenuItem.nome,
          descricao: currentMenuItem.descricao,
          preco: currentMenuItem.preco,
          imagem_url: currentMenuItem.imagem_url,
          ativo: currentMenuItem.ativo ?? true,
        })
        .eq("id", currentMenuItem.id);
      error = updateError;
    } else {
      // Adicionar novo item
      const { error: insertError } = await supabase
        .from("cardapio")
        .insert({
          nome: currentMenuItem.nome,
          descricao: currentMenuItem.descricao,
          preco: currentMenuItem.preco,
          imagem_url: currentMenuItem.imagem_url,
          ativo: true, // Novos itens são ativos por padrão
        });
      error = insertError;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar item do cardápio: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Item do cardápio salvo com sucesso.",
      });
      setIsDialogOpen(false);
      setCurrentMenuItem(null);
      fetchMenuItems();
    }
    setLoading(false);
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este item do cardápio?")) {
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("cardapio")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir item do cardápio: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Item do cardápio excluído com sucesso.",
      });
      fetchMenuItems();
    }
    setLoading(false);
  };

  if (isLoadingRole) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Carregando...</div>;
  }

  if (userRole !== "admin") {
    return null; // Ou uma mensagem de "Acesso Negado"
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Gerenciar Cardápio {userProfile?.nome && <span className="text-muted-foreground text-2xl"> - Olá, {userProfile.nome}!</span>}
          </h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={() => navigate("/admin")} variant="outline" className="w-full sm:w-auto">
              Voltar para o Painel
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setCurrentMenuItem(null)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card text-foreground">
                <DialogHeader>
                  <DialogTitle>{currentMenuItem?.id ? "Editar Item" : "Adicionar Novo Item"}</DialogTitle>
                  <CardDescription>
                    Preencha os detalhes do item do cardápio.
                  </CardDescription>
                </DialogHeader>
                <form onSubmit={handleSaveMenuItem} className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-left sm:text-right">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={currentMenuItem?.nome || ""}
                      onChange={(e) => setCurrentMenuItem({ ...currentMenuItem, nome: e.target.value })}
                      className="col-span-1 sm:col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="descricao" className="text-left sm:text-right">
                      Descrição
                    </Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      value={currentMenuItem?.descricao || ""}
                      onChange={(e) => setCurrentMenuItem({ ...currentMenuItem, descricao: e.target.value })}
                      className="col-span-1 sm:col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="preco" className="text-left sm:text-right">
                      Preço
                    </Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      value={currentMenuItem?.preco || ""}
                      onChange={(e) => setCurrentMenuItem({ ...currentMenuItem, preco: parseFloat(e.target.value) })}
                      className="col-span-1 sm:col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="imagem_url" className="text-left sm:text-right">
                      URL da Imagem
                    </Label>
                    <Input
                      id="imagem_url"
                      name="imagem_url"
                      value={currentMenuItem?.imagem_url || ""}
                      onChange={(e) => setCurrentMenuItem({ ...currentMenuItem, imagem_url: e.target.value })}
                      className="col-span-1 sm:col-span-3"
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
                      {loading ? "Salvando..." : "Salvar Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading && menuItems.length === 0 ? (
          <div className="text-center text-muted-foreground">Carregando itens do cardápio...</div>
        ) : menuItems.length === 0 ? (
          <div className="text-center text-muted-foreground">Nenhum item no cardápio. Adicione um novo!</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Imagem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>R$ {item.preco.toFixed(2)}</TableCell>
                    <TableCell>
                      <img src={item.imagem_url} alt={item.nome} className="w-16 h-16 object-cover rounded-md" />
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentMenuItem(item);
                          setIsDialogOpen(true);
                        }}
                        className="mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMenuItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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

export default MenuManagement;