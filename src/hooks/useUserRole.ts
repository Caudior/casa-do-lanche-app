import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "admin" | "cliente" | null;

export const useUserRole = () => {
  const session = useSession();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setIsLoadingRole(true);
      if (session?.user) {
        const { data, error } = await supabase
          .from("usuario")
          .select("tipo_usuario")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error.message);
          setUserRole(null);
        } else if (data) {
          setUserRole(data.tipo_usuario as UserRole);
        }
      } else {
        setUserRole(null);
      }
      setIsLoadingRole(false);
    };

    fetchUserRole();
  }, [session]);

  return { userRole, isLoadingRole };
};