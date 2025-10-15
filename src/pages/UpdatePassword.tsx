"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast"; // Importação atualizada
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const UpdatePassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verifica se há uma sessão ativa. Se sim, o usuário já está logado e não precisa redefinir.
    // No entanto, para o fluxo de redefinição de senha, o usuário pode não ter uma sessão ativa.
    // O Supabase lida com o token de redefinição automaticamente na URL.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        // Se o evento for PASSWORD_RECOVERY, o usuário está no fluxo de redefinição.
        // Se for SIGNED_IN, significa que a sessão foi estabelecida (ou já existia).
        // Podemos verificar se o usuário já está logado e redirecionar, se necessário.
        if (session) {
          // O usuário já está logado ou acabou de fazer login após a redefinição.
          // Redirecionar para uma página pós-login.
          // Para este caso, vamos permitir que ele atualize a senha se chegou aqui via link de redefinição.
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Sua senha foi atualizada com sucesso. Você já está logado.",
      });
      navigate("/menu"); // Redireciona para a página principal após a atualização
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <CardHeader className="text-center">
          <img 
            src="/casa_do_lanche_logo_420.png" 
            alt="Casa do Lanche Logo" 
            className="mx-auto mb-6 w-48 h-auto" 
          />
          <CardTitle className="text-3xl font-bold text-foreground">Redefinir Senha</CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua nova senha"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? "Atualizando..." : "Atualizar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdatePassword;