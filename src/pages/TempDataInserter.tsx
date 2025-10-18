"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const TempDataInserter = () => {
  const [loading, setLoading] = useState(true);
  const [airtonId, setAirtonId] = useState<string | null>(null);
  const [pizzaId, setPizzaId] = useState<string | null>(null);
  const [pizzaPrice, setPizzaPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isInserting, setIsInserting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar ID do Airton
        const { data: userData, error: userError } = await supabase
          .from("usuario")
          .select("id")
          .ilike("nome", "%Airton%")
          .single();

        if (userError) {
          showError("Erro ao buscar ID do Airton: " + userError.message);
          setAirtonId(null);
        } else if (userData) {
          setAirtonId(userData.id);
          showSuccess(`ID do Airton encontrado: ${userData.id}`);
        } else {
          showError("Usuário 'Airton' não encontrado.");
          setAirtonId(null);
        }

        // Buscar ID e preço da PIZZA
        const { data: menuItemData, error: menuItemError } = await supabase
          .from("cardapio")
          .select("id, preco")
          .ilike("nome", "%PIZZA%")
          .single();

        if (menuItemError) {
          showError("Erro ao buscar ID da PIZZA: " + menuItemError.message);
          setPizzaId(null);
          setPizzaPrice(null);
        } else if (menuItemData) {
          setPizzaId(menuItemData.id);
          setPizzaPrice(menuItemData.preco);
          showSuccess(`Item 'PIZZA' encontrado: ${menuItemData.id} (R$ ${menuItemData.preco.toFixed(2)})`);
        } else {
          showError("Item 'PIZZA' não encontrado no cardápio.");
          setPizzaId(null);
          setPizzaPrice(null);
        }

      } catch (error: any) {
        showError("Erro geral ao buscar dados: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInsertOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInserting(true);

    if (!airtonId || !pizzaId || pizzaPrice === null) {
      showError("Dados essenciais (ID do Airton, ID/Preço da Pizza) não foram carregados. Não é possível inserir o pedido.");
      setIsInserting(false);
      return;
    }

    if (quantity <= 0) {
      showError("A quantidade deve ser maior que zero.");
      setIsInserting(false);
      return;
    }

    try {
      const total = pizzaPrice * quantity;
      const { error } = await supabase.from("pedidos").insert({
        usuario_id: airtonId,
        cardapio_id: pizzaId,
        quantidade: quantity,
        total: parseFloat(total.toFixed(2)),
        status: "Pendente",
        data_pedido: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      showSuccess(`Pedido de ${quantity}x PIZZA para Airton inserido com sucesso! Total: R$ ${total.toFixed(2).replace('.', ',')}`);
      setQuantity(1); // Reset quantity
    } catch (error: any) {
      showError("Erro ao inserir pedido: " + error.message);
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">Inserir Pedido Temporário</CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            Página de depuração para inserir pedidos para o Airton.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground">Carregando IDs de usuário e cardápio...</div>
          ) : (
            <form onSubmit={handleInsertOrder} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="airtonId">ID do Airton</Label>
                  <Input id="airtonId" value={airtonId || "Não encontrado"} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="pizzaId">ID da PIZZA</Label>
                  <Input id="pizzaId" value={pizzaId || "Não encontrado"} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="pizzaPrice">Preço da PIZZA</Label>
                  <Input id="pizzaPrice" value={pizzaPrice !== null ? `R$ ${pizzaPrice.toFixed(2).replace('.', ',')}` : "Não encontrado"} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantidade de PIZZAs</Label>
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
              </div>
              <Button
                type="submit"
                disabled={isInserting || loading || !airtonId || !pizzaId || pizzaPrice === null}
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
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TempDataInserter;