"use client";

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPasswordDialog = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      showError("Por favor, digite seu email.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      showSuccess("Verifique seu email para o link de redefinição de senha.");
      setEmail("");
      setIsOpen(false);
    } catch (error: any) {
      showError(error.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* Botão de gatilho hardcoded para depuração */}
        <Button variant="link" type="button" className="px-0 text-sm text-primary hover:underline">
          Esqueceu sua senha?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Esqueceu sua Senha?</DialogTitle>
          <DialogDescription>
            Digite seu email abaixo e enviaremos um link para redefinir sua senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleResetPassword} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? "Enviando..." : "Enviar Link de Redefinição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;