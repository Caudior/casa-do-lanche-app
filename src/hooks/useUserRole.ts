import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "admin" | "cliente" | null;

interface UserProfile {
  id: string;
  nome: string;
  telefone: string;
  setor: string;
  email: string;
  tipo_usuario: UserRole;
}

export const useUserRole = () => {
  const session = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoadingRole(true);
      if (session?.user) {
        const userIdAsString = session.user.id as string;
        const { data, error } = await supabase
          .from("usuario")
          .select("id, nome, telefone, setor, email, tipo_usuario")
          .eq("id", userIdAsString)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error.message);
          setUserProfile(null);
        } else if (data) {
          setUserProfile(data as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoadingRole(false);
    };

    fetchUserProfile();
  }, [session]);

  return { userProfile, isLoadingRole, userRole: userProfile?.tipo_usuario };
};