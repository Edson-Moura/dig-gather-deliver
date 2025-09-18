import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UpdatePassword = () => {
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Check if we have the required parameters from the email link
    // First check URL hash (where Supabase typically sends auth tokens)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    let accessToken = hashParams.get('access_token');
    let refreshToken = hashParams.get('refresh_token');
    let type = hashParams.get('type');
    let error = hashParams.get('error');
    let errorCode = hashParams.get('error_code');
    let errorDescription = hashParams.get('error_description');
    
    // Fallback to search params if not found in hash
    if (!accessToken) {
      accessToken = searchParams.get('access_token');
      refreshToken = searchParams.get('refresh_token');
      type = searchParams.get('type');
      error = searchParams.get('error');
      errorCode = searchParams.get('error_code');
      errorDescription = searchParams.get('error_description');
    }
    
    // Handle errors from the URL
    if (error) {
      let errorMessage = "Erro desconhecido.";
      
      if (error === 'access_denied') {
        if (errorCode === 'otp_expired') {
          errorMessage = "O link de recuperação expirou. Solicite um novo link.";
        } else {
          errorMessage = "Link de recuperação inválido ou expirado.";
        }
      } else if (error === 'invalid_request') {
        errorMessage = "Solicitação inválida.";
      } else if (errorDescription) {
        if (errorDescription.includes('expired')) {
          errorMessage = "O link de recuperação expirou. Solicite um novo link.";
        } else if (errorDescription.includes('invalid')) {
          errorMessage = "Link de recuperação inválido. Solicite um novo link.";
        }
      }
      
      toast({
        title: "Link Expirado",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Redirect to reset password page after a delay
      setTimeout(() => {
        navigate('/reset-password');
      }, 3000);
      return;
    }
    
    // Check if this is a recovery type link
    if (type !== 'recovery') {
      toast({
        title: "Link inválido",
        description: "Este não é um link de recuperação de senha válido.",
        variant: "destructive",
      });
      navigate('/reset-password');
      return;
    }
    
    // Check if we have the required tokens
    if (!accessToken || !refreshToken) {
      toast({
        title: "Link inválido",
        description: "Este link de recuperação de senha é inválido ou expirou.",
        variant: "destructive",
      });
      navigate('/reset-password');
      return;
    }
    
    // Clean the URL hash after processing
    setTimeout(() => {
      window.history.replaceState(null, '', window.location.pathname);
    }, 100);
  }, [searchParams, navigate, toast]);

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Set session with tokens from URL before updating password
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
      }
      
      const { error } = await updatePassword(password);
      
      if (!error) {
        setPasswordUpdated(true);
        // Clean URL hash after successful password update
        window.history.replaceState(null, '', window.location.pathname);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/e26470cf-d11b-4647-83f6-c61857d5de8d.png"
              alt="MyEnglishOne Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              MyEnglishOne
            </span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Nova Senha
          </h2>
          <p className="mt-2 text-muted-foreground">
            Digite sua nova senha abaixo
          </p>
        </div>

        {passwordUpdated ? (
          /* Success State */
          <Card className="shadow-elevated">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-700 dark:text-green-400">Senha Atualizada!</CardTitle>
              <CardDescription>
                Sua senha foi alterada com sucesso. Você será redirecionado automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Ir para Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Update Password Form */
          <Card className="shadow-elevated">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Definir Nova Senha</CardTitle>
              <CardDescription>
                Escolha uma senha segura com pelo menos 6 caracteres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua nova senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pr-10"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Atualizar Senha
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-center">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda?{' '}
            <Link to="/contact" className="text-primary hover:underline">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;