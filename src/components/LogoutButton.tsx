"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast"; // Importação atualizada
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      showError(error.message); // Usando showError
    } else {
      showSuccess("Você foi desconectado."); // Usando showSuccess
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