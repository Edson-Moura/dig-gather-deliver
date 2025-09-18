import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { errorHandler, ErrorCategory, handleAsyncError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

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
    logger.userAction('Sign in initiated', undefined, { email });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        errorHandler.handleError(error, {
          action: 'signIn',
          component: 'useAuth',
          metadata: { email }
        });
      } else {
        logger.userAction('Sign in successful', undefined, { email });
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
    logger.userAction('Password reset initiated', undefined, { email });

    const result = await handleAsyncError(
      async () => {
        const redirectUrl = `${window.location.origin}/update-password`;
        
        logger.info('Attempting password reset', { email, redirectUrl }, 'useAuth');
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });

        if (error) {
          throw error;
        }

        logger.userAction('Password reset email sent successfully', undefined, { email });
        toast({
          title: "Email enviado com sucesso!",
          description: "Verifique sua caixa de entrada (e spam) para recuperar sua senha.",
        });
        
        return { error: null };
      },
      {
        action: 'resetPassword',
        component: 'useAuth',
        metadata: { email }
      }
    );

    return result || { error: new Error('Failed to reset password') };
  };

  const updatePassword = async (password: string) => {
    logger.userAction('Password update initiated');

    const result = await handleAsyncError(
      async () => {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          throw error;
        }

        logger.userAction('Password updated successfully');
        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi alterada com sucesso.",
        });

        return { error: null };
      },
      {
        action: 'updatePassword',
        component: 'useAuth'
      }
    );

    return result || { error: new Error('Failed to update password') };
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