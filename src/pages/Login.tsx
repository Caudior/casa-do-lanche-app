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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <img 
            src="/casa_do_lanche_logo_420.png" 
            alt="Casa do Lanche Logo" 
            className="mx-auto mb-6 w-48 h-auto" 
          />
          <h1 className="text-3xl font-bold text-foreground">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
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
                    brand: 'hsl(var(--primary))', // Usando a nova cor primária
                    brandAccent: 'hsl(var(--primary))', // Usando a nova cor primária
                  },
                },
              },
            }}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  social_provider_text: 'Continuar com {provider}',
                  link_text: 'Não tem uma conta? {0}',
                  forgotten_password_text: 'Esqueceu sua senha?',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Criar conta',
                  social_provider_text: 'Continuar com {provider}',
                  link_text: 'Já tem uma conta? {0}',
                },
                forgotten_password: {
                  email_label: 'Email',
                  button_label: 'Enviar instruções de recuperação',
                  link_text: 'Lembrou sua senha? {0}',
                },
                update_password: {
                  password_label: 'Nova senha',
                  button_label: 'Atualizar senha',
                },
                magic_link: {
                  email_label: 'Email',
                  button_label: 'Enviar link mágico',
                  link_text: 'Já tem uma conta? {0}',
                },
                verify_otp: {
                  email_label: 'Email',
                  phone_label: 'Número de telefone',
                  token_label: 'Código OTP',
                  button_label: 'Verificar código',
                  link_text: 'Já tem uma conta? {0}',
                },
                update_user: {
                  password_label: 'Nova senha',
                  password_input_placeholder: 'Sua nova senha',
                  button_label: 'Atualizar',
                },
                // Adicione outras variáveis de localização conforme necessário
                common: {
                  button_label_loading: 'Carregando...',
                },
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