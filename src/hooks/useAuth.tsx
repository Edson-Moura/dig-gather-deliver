import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: "Bem-vindo!",
            description: "Login realizado com sucesso.",
          });
          
          // Check subscription status after login
          if (session?.access_token) {
            setTimeout(async () => {
              try {
                await supabase.functions.invoke('check-subscription', {
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                });
              } catch (error) {
                console.error('Error checking subscription after login:', error);
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Até logo!",
            description: "Você foi desconectado.",
          });
        }
      }
    );


    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/email-confirmation`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: displayName ? { display_name: displayName } : undefined
        }
      });

      if (error) {
        let message = "Erro ao criar conta.";
        if (error.message.includes("User already registered")) {
          message = "Este email já está cadastrado. Tente fazer login.";
        } else if (error.message.includes("Password")) {
          message = "A senha deve ter pelo menos 6 caracteres.";
        } else if (error.message.includes("Invalid email")) {
          message = "Email inválido.";
        } else if (error.message.includes("429") || error.message.includes("rate limit") || error.message.includes("over_email_send_rate_limit")) {
          message = "Muitos emails enviados. Aguarde alguns minutos e tente novamente.";
        }
        
        toast({
          title: "Erro no cadastro",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }

      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let message = "Email ou senha incorretos.";
        if (error.message.includes("Invalid login credentials")) {
          message = "Email ou senha incorretos.";
        } else if (error.message.includes("Email not confirmed")) {
          message = "Confirme seu email antes de fazer login.";
        }
        
        toast({
          title: "Erro no login",
          description: message,
          variant: "destructive",
        });
      }

      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/update-password`;
      
      console.log('Attempting password reset for:', email);
      console.log('Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Password reset error:', error);
        let message = "Erro ao enviar email de recuperação.";
        
        if (error.message.includes("429") || error.message.includes("rate limit") || error.message.includes("over_email_send_rate_limit")) {
          message = "Por segurança, você só pode solicitar um novo email após alguns minutos. Tente novamente em breve.";
        } else if (error.message.includes("Email not found") || error.message.includes("User not found")) {
          message = "Email não encontrado. Verifique se você digitou corretamente.";
        } else if (error.message.includes("Invalid email")) {
          message = "Email inválido. Verifique o formato do email.";
        }
        
        toast({
          title: "Problema no envio",
          description: message,
          variant: "destructive",
        });
        
        return { error };
      } else {
        console.log('Password reset email sent successfully');
        toast({
          title: "Email enviado com sucesso!",
          description: "Verifique sua caixa de entrada (e spam) para recuperar sua senha.",
        });
        
        return { error: null };
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      toast({
        title: "Erro inesperado",
        description: "Algo deu errado. Tente novamente em alguns minutos.",
        variant: "destructive",
      });
      
      return { error: err };
    }
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error('Password update error:', error);
      let message = "Erro ao atualizar senha.";
      if (error.message.includes("Password should be at least 6 characters")) {
        message = "A senha deve ter pelo menos 6 caracteres.";
      }
      
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
    }

    return { error };
  };

  const resendConfirmation = async (email: string) => {
    const redirectUrl = `${window.location.origin}/email-confirmation`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });

    if (error) {
      let message = "Erro ao reenviar confirmação.";
      if (error.message.includes("429") || error.message.includes("rate limit")) {
        message = "Muitos emails enviados. Aguarde alguns minutos e tente novamente.";
      }
      
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email reenviado!",
        description: "Verifique seu email (e spam) para confirmar a conta.",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};