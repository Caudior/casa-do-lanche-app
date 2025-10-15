"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog"; // Importar o novo componente

const LOCAL_STORAGE_EMAIL_KEY = "rememberedEmail";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedEmail = localStorage.getItem(LOCAL_STORAGE_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (rememberMe) {
        localStorage.setItem(LOCAL_STORAGE_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_EMAIL_KEY);
      }

      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso.",
      });
      navigate("/menu");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
          />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />
        </div>
        <div className="flex items-center justify-between"> {/* Adicionado justify-between */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
            />
            <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Lembrar-me
            </Label>
          </div>
          <ForgotPasswordDialog> {/* Integrando o diálogo aqui */}
            <Button variant="link" type="button" className="px-0 text-sm text-primary hover:underline">
              Esqueceu sua senha?
            </Button>
          </ForgotPasswordDialog>
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <a href="/register" className="text-primary hover:underline">
          Crie uma aqui
        </a>
      </div>
    </form>
  );
};

export default LoginForm;