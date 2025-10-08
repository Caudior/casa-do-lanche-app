"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Você foi desconectado.",
      });
      navigate("/login");
    }
  };

  return (
    <Button onClick={handleLogout} variant="ghost" className="flex items-center gap-2">
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
};

export default LogoutButton;