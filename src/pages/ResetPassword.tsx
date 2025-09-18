import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    
    try {
      await resetPassword(emailValue);
      setEmail(emailValue);
      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para recuperar sua senha.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o email. Tente novamente.",
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
            Recuperar Senha
          </h2>
          <p className="mt-2 text-muted-foreground">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        {emailSent ? (
          /* Success State */
          <Card className="shadow-elevated">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-700 dark:text-green-400">Email Enviado!</CardTitle>
              <CardDescription>
                Enviamos as instruções de recuperação para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Próximos passos:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Verifique sua caixa de entrada</li>
                  <li>2. Clique no link de recuperação</li>
                  <li>3. Defina uma nova senha</li>
                  <li>4. Faça login com a nova senha</li>
                </ul>
              </div>
              
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Tentar outro email
                  </Button>
                  <Button
                    onClick={() => navigate('/auth')}
                    className="w-full"
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Reset Form */
          <Card className="shadow-elevated">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Digite seu email</CardTitle>
              <CardDescription>
                Informe o email da sua conta para receber as instruções de recuperação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="w-full"
                    autoFocus
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enviar Link de Recuperação
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
            Lembrou da sua senha?{' '}
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </div>

        {/* Legal Links */}
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

export default ResetPassword;