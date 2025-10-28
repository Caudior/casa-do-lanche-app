import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { CalendarIcon, Save } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  ativo: boolean;
}

interface DailyAvailability {
  id: string;
  cardapio_id: string;
  data_disponibilidade: string; // YYYY-MM-DD
  quantidade_inicial: number;
  quantidade_disponivel: number;
  menu_item_name?: string; // Para exibir o nome do item
}

const DailyAvailabilityManagement = () => {
  const navigate = useNavigate();
  const { userRole, isLoadingRole, userProfile } = useUserRole();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dailyAvailability, setDailyAvailability] = useState<DailyAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState<Partial<DailyAvailability> | null>(null);
  const [dialogMenuItemName, setDialogMenuItemName] = useState<string>("");

  useEffect(() => {
    if (!isLoadingRole && userRole !== "admin") {
      navigate("/");
    } else if (userRole === "admin") {
      fetchData();
    }
  }, [userRole, isLoadingRole, navigate, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

    // Fetch all active menu items
    const { data: menuItemsData, error: menuItemsError } = await supabase
      .from("cardapio")
      .select("id, nome, ativo")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (menuItemsError) {
      showError("Erro ao carregar itens do cardápio: " + menuItemsError.message);
      setMenuItems([]);
      setDailyAvailability([]);
      setLoading(false);
      return;
    }
    setMenuItems(menuItemsData as MenuItem[]);

    // Fetch daily availability for the selected date
    const { data: availabilityData, error: availabilityError } = await supabase
      .from("disponibilidade_diaria_cardapio")
      .select("*")
      .eq("data_disponibilidade", formattedDate);

    if (availabilityError) {
      showError("Erro ao carregar disponibilidade diária: " + availabilityError.message);
      setDailyAvailability([]);
      setLoading(false);
      return;
    }

    // Combine menu items with their availability for the selected date
    const combinedAvailability: DailyAvailability[] = menuItemsData.map((item: MenuItem) => {
      const existingAvailability = availabilityData.find((avail: DailyAvailability) => avail.cardapio_id === item.id);
      return {
        id: existingAvailability?.id || "",
        cardapio_id: item.id,
        data_disponibilidade: formattedDate,
        quantidade_inicial: existingAvailability?.quantidade_inicial || 0,
        quantidade_disponivel: existingAvailability?.quantidade_disponivel || 0,
        menu_item_name: item.nome,
      };
    });

    setDailyAvailability(combinedAvailability);
    setLoading(false);
  };

  const handleOpenDialog = (availability: Partial<DailyAvailability>) => {
    setCurrentAvailability(availability);
    setDialogMenuItemName(menuItems.find(item => item.id === availability.cardapio_id)?.nome || "Item Desconhecido");
    setIsDialogOpen(true);
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAvailability?.cardapio_id || currentAvailability.quantidade_inicial === undefined || currentAvailability.quantidade_disponivel === undefined) {
      showError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    let error = null;
    const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

    if (currentAvailability.id) {
      // Update existing availability
      const { error: updateError } = await supabase
        .from("disponibilidade_diaria_cardapio")
        .update({
          quantidade_inicial: currentAvailability.quantidade_inicial,
          quantidade_disponivel: currentAvailability.quantidade_disponivel,
        })
        .eq("id", currentAvailability.id);
      error = updateError;
    } else {
      // Insert new availability
      const { error: insertError } = await supabase
        .from("disponibilidade_diaria_cardapio")
        .insert({
          cardapio_id: currentAvailability.cardapio_id,
          data_disponibilidade: formattedDate,
          quantidade_inicial: currentAvailability.quantidade_inicial,
          quantidade_disponivel: currentAvailability.quantidade_disponivel,
        });
      error = insertError;
    }

    if (error) {
      showError("Erro ao salvar disponibilidade: " + error.message);
    } else {
      showSuccess("Disponibilidade salva com sucesso.");
      setIsDialogOpen(false);
      setCurrentAvailability(null);
      fetchData(); // Re-fetch data to update the table
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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Gerenciar Disponibilidade Diária {userProfile?.nome && <span className="text-muted-foreground text-2xl"> - Olá, {userProfile.nome}!</span>}
          </h1>
          <Button onClick={() => navigate("/admin")} variant="outline" className="w-full sm:w-auto">
            Voltar para o Painel
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Data</CardTitle>
            <p className="text-sm text-muted-foreground">Escolha a data para gerenciar a disponibilidade</p>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[280px] justify-start text-left font-normal",
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disponibilidade do Cardápio para {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Hoje"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground">Carregando disponibilidade...</div>
            ) : dailyAvailability.length === 0 ? (
              <div className="text-center text-muted-foreground">Nenhum item de cardápio ativo encontrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantidade Inicial</TableHead>
                      <TableHead>Quantidade Disponível</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyAvailability.map((avail) => (
                      <TableRow key={avail.cardapio_id}>
                        <TableCell className="font-medium">{avail.menu_item_name}</TableCell>
                        <TableCell>{avail.quantidade_inicial}</TableCell>
                        <TableCell>{avail.quantidade_disponivel}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(avail)}
                          >
                            <Save className="h-4 w-4 mr-2" /> Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para editar disponibilidade */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>Editar Disponibilidade para {dialogMenuItemName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAvailability} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantidade_inicial" className="text-right">
                Qtd. Inicial
              </Label>
              <Input
                id="quantidade_inicial"
                type="number"
                value={currentAvailability?.quantidade_inicial || 0}
                onChange={(e) => setCurrentAvailability({ ...currentAvailability, quantidade_inicial: parseInt(e.target.value) || 0 })}
                className="col-span-3"
                min="0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantidade_disponivel" className="text-right">
                Qtd. Disponível
              </Label>
              <Input
                id="quantidade_disponivel"
                type="number"
                value={currentAvailability?.quantidade_disponivel || 0}
                onChange={(e) => setCurrentAvailability({ ...currentAvailability, quantidade_disponivel: parseInt(e.target.value) || 0 })}
                className="col-span-3"
                min="0"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyAvailabilityManagement;