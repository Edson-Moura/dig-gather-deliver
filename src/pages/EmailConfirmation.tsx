import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmailConfirmation() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      console.log('EmailConfirmation: Starting email confirmation process');
      console.log('EmailConfirmation: Current URL:', window.location.href);
      console.log('EmailConfirmation: Hash:', window.location.hash);
      console.log('EmailConfirmation: Search:', window.location.search);
      
      // Check for tokens in URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      console.log('EmailConfirmation: Parsed tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

      // Check for error parameters
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      console.log('EmailConfirmation: Error params:', { error, errorDescription });

      if (error) {
        console.log('EmailConfirmation: Found error in URL params');
        setStatus('error');
        setMessage(errorDescription || 'Erro na confirmação do email.');
        return;
      }

      if (!accessToken || !refreshToken) {
        console.log('EmailConfirmation: Missing tokens, checking if user is already logged in');
        
        // Check if user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('EmailConfirmation: User already logged in, redirecting to dashboard');
          setStatus('success');
          setMessage('Email já confirmado! Redirecionando...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
          return;
        }
        
        console.log('EmailConfirmation: No tokens and no session found');
        setStatus('error');
        setMessage('Link de confirmação inválido ou expirado. Tente fazer login novamente.');
        return;
      }

      try {
        console.log('EmailConfirmation: Setting session with tokens');
        // Set the session with the tokens from URL
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.log('EmailConfirmation: Session error:', sessionError);
          throw sessionError;
        }

        if (data.session && data.user) {
          console.log('EmailConfirmation: Session set successfully, user confirmed');
          
          // Get user name from metadata or email
          const displayName = data.user.user_metadata?.name || 
                            data.user.user_metadata?.display_name || 
                            data.user.email?.split('@')[0] || 
                            'usuário';
          setUserName(displayName);
          
          if (type === 'signup') {
            setStatus('success');
            setMessage(`Bem-vindo, ${displayName}! Sua conta foi ativada com sucesso.`);
            
            toast({
              title: "Email confirmado!",
              description: "Sua conta foi ativada com sucesso.",
            });

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              console.log('EmailConfirmation: Redirecting to dashboard');
              navigate('/dashboard');
            }, 2000);
          } else {
            setStatus('success');
            setMessage(`Bem-vindo, ${displayName}! Email confirmado com sucesso.`);
            
            setTimeout(() => {
              console.log('EmailConfirmation: Redirecting to dashboard');
              navigate('/dashboard');
            }, 2000);
          }
        } else {
          console.log('EmailConfirmation: No session or user found after setting session');
          throw new Error('Falha ao confirmar email');
        }
      } catch (error: any) {
        console.error('Error confirming email:', error);
        setStatus('error');
        setMessage(error.message || 'Erro ao confirmar email. Tente novamente.');
        
        toast({
          title: "Erro na confirmação",
          description: "Não foi possível confirmar seu email. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        // Clean the URL hash
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams, toast]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirmando email...';
      case 'success':
        return userName ? `Bem-vindo, ${userName}!` : 'Bem-vindo!';
      case 'error':
        return 'Erro na confirmação';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              Você será redirecionado em alguns segundos...
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Voltar ao Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                Ir para Início
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}