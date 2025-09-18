import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscriptionData, checkSubscription, loading } = useSubscription();
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const sessionId = searchParams.get('session_id');

  console.log('PaymentSuccess - sessionId:', sessionId);
  console.log('PaymentSuccess - user:', user?.id);
  console.log('PaymentSuccess - subscriptionData:', subscriptionData);

  useEffect(() => {
    console.log('PaymentSuccess - useEffect running');
    
    if (!sessionId) {
      console.log('PaymentSuccess - No sessionId, redirecting to home');
      navigate('/');
      return;
    }

    // If no user, wait a bit for auth to load, then redirect
    if (!user) {
      console.log('PaymentSuccess - No user, waiting for auth...');
      const authTimer = setTimeout(() => {
        if (!user) {
          console.log('PaymentSuccess - Still no user after wait, redirecting to auth');
          navigate('/auth');
        }
      }, 2000);
      return () => clearTimeout(authTimer);
    }

    // Check subscription status immediately and then retry if not updated
    const verifyPayment = async () => {
      console.log('PaymentSuccess - Starting payment verification');
      try {
        await checkSubscription();
        console.log('PaymentSuccess - Subscription check completed');
      } catch (error) {
        console.error('PaymentSuccess - Error checking subscription:', error);
      }
      
      // If still not subscribed after 3 seconds, try again (up to 3 times)
      if (!subscriptionData.subscribed && verificationAttempts < 3) {
        console.log(`PaymentSuccess - Retrying verification ${verificationAttempts + 1}/3`);
        setTimeout(() => {
          setVerificationAttempts(prev => prev + 1);
          checkSubscription();
        }, 3000);
      }
    };

    verifyPayment();
  }, [user?.id, sessionId, navigate, checkSubscription, subscriptionData.subscribed, verificationAttempts]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Processando...</h1>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
          <p>Aguarde enquanto verificamos sua autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-card">
            <CardHeader>
              <div className="mx-auto mb-4">
                {loading || verificationAttempts > 0 ? (
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                ) : (
                  <CheckCircle className="h-16 w-16 text-green" />
                )}
              </div>
              <CardTitle className="text-2xl text-green">
                {subscriptionData.subscribed ? 'Pagamento Confirmado!' : 'Processando Pagamento...'}
              </CardTitle>
              <CardDescription className="text-lg">
                {subscriptionData.subscribed 
                  ? `Seu plano ${subscriptionData.subscription_tier} foi ativado com sucesso.`
                  : 'Aguarde enquanto confirmamos seu pagamento...'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {subscriptionData.subscribed ? (
                <>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Detalhes da Assinatura:</h3>
                    <p><strong>Plano:</strong> {subscriptionData.subscription_tier}</p>
                    {subscriptionData.subscription_end && (
                      <p><strong>Próxima cobrança:</strong> {new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Agora você tem acesso completo a todos os recursos premium!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => navigate('/dashboard')} size="lg">
                        Ir para o Dashboard
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/lessons')} size="lg">
                        Começar a Estudar
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {verificationAttempts > 0 
                      ? `Tentativa ${verificationAttempts}/3 - Verificando status...`
                      : 'Confirmando seu pagamento com o Stripe...'
                    }
                  </p>
                  
                  {verificationAttempts >= 3 && (
                    <div className="space-y-3">
                      <p className="text-orange">
                        O pagamento pode levar alguns minutos para ser processado.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setVerificationAttempts(0);
                          checkSubscription();
                        }}
                      >
                        Verificar Novamente
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;