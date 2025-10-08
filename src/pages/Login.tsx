import { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <img 
            src="/casa_do_lanche_logo_420.png" 
            alt="Casa do Lanche Logo" 
            className="mx-auto mb-6 w-48 h-auto" 
          />
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Entre na sua conta para continuar
          </p>
        </div>
        
        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                  },
                },
              },
            }}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  label: 'Entrar',
                },
                sign_up: {
                  label: 'Criar conta',
                },
                email_label: 'Email',
                password_label: 'Senha',
                button_label_loading: 'Carregando...',
                social_provider_text: 'Continuar com {provider}',
                link_text: 'Não tem uma conta? {0}',
                link_sign_up_text: 'Criar conta',
                link_sign_in_text: 'Já tem uma conta? {0}',
                link_sign_in_text_forgot_password: 'Esqueceu sua senha?',
              },
            }}
            magicLink={false}
            redirectTo="/"
            onlyThirdPartyProviders={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;