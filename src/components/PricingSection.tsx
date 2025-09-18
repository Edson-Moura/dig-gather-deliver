import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Settings } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para começar sua jornada",
    badge: null,
    features: [
      "3 frases por dia",
      "Quiz básico",
      "Progresso simples",
      "Acesso limitado ao chatbot",
      "Comunidade"
    ],
    limitations: [
      "Sem áudio nativo",
      "Sem repetição espaçada",
      "Relatórios limitados"
    ],
    buttonText: "Começar Grátis",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Premium",
    price: "R$ 19,90",
    period: "/mês",
    description: "Para estudantes sérios que querem resultados",
    badge: "Mais Popular",
    features: [
      "10 frases personalizadas por dia",
      "Quizzes avançados com repetição espaçada",
      "Chatbot IA ilimitado com feedback",
      "Áudio nativo profissional",
      "Relatórios detalhados de progresso",
      "Conteúdo personalizado por IA",
      "Suporte prioritário"
    ],
    limitations: [],
    buttonText: "Começar Premium",
    buttonVariant: "hero" as const,
    popular: true
  },
  {
    name: "Pro",
    price: "R$ 35,90",
    period: "/mês",
    description: "Para profissionais que precisam de fluência rápida",
    badge: "Máximo Resultado",
    features: [
      "Tudo do Premium",
      "Frases ilimitadas",
      "Sessões 1:1 com tutores nativos",
      "Simulações de entrevista",
      "Planos de estudo personalizados",
      "Análise avançada de pronúncia",
      "Certificados de conclusão"
    ],
    limitations: [],
    buttonText: "Começar Pro",
    buttonVariant: "accent" as const,
    popular: false
  },
  {
    name: "Anual",
    price: "R$ 215,40",
    originalPrice: "R$ 430,80",
    period: "/ano",
    description: "Máxima economia com todos os recursos Pro",
    badge: "50% OFF",
    features: [
      "Frases ilimitadas",
      "Quizzes avançados com repetição espaçada",
      "Chatbot IA ilimitado com feedback",
      "Áudio nativo profissional",
      "Sessões 1:1 com tutores nativos",
      "Simulações de entrevista",
      "Planos de estudo personalizados",
      "Análise avançada de pronúncia",
      "Certificados de conclusão",
      "Relatórios detalhados de progresso",
      "Conteúdo personalizado por IA",
      "Suporte prioritário"
    ],
    limitations: [],
    buttonText: "Começar Anual",
    buttonVariant: "accent" as const,
    popular: false
  }
];

export const PricingSection = () => {
  const { user } = useAuth();
  const { subscriptionData, loading, createCheckout, openCustomerPortal } = useSubscription();

  const handlePlanSelect = (plan: any) => {
    if (!user) {
      // Redirect to auth page if not logged in
      window.location.href = '/auth';
      return;
    }

    if (plan.name === 'Grátis') {
      // Free plan - no action needed
      return;
    }

    const planKey = plan.name.toLowerCase();
    createCheckout(planKey);
  };

  const isCurrentPlan = (planName: string) => {
    if (planName === 'Grátis' && !subscriptionData.subscribed) return true;
    return subscriptionData.subscription_tier === planName;
  };

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">
            Escolha o{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Plano Perfeito
            </span>{" "}
            para Você
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Todos os planos incluem acesso aos recursos fundamentais. 
            Upgrade quando precisar de mais funcionalidades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative hover:shadow-elevated transition-smooth ${
                plan.popular 
                  ? 'border-2 border-primary shadow-primary scale-105' 
                  : isCurrentPlan(plan.name)
                  ? 'border-2 border-secondary shadow-secondary'
                  : 'border border-border hover:border-primary/50'
              }`}
            >
              {plan.badge && !isCurrentPlan(plan.name) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-hero text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan(plan.name) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-secondary text-white px-4 py-1">
                    <Check className="w-3 h-3 mr-1" />
                    Seu Plano
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4 pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-1">
                    {(plan as any).originalPrice && (
                      <span className="text-lg text-muted-foreground line-through mr-2">
                        {(plan as any).originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-gradient-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-start gap-3 opacity-50">
                      <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-muted-foreground">✕</span>
                      </div>
                      <span className="text-sm text-muted-foreground line-through">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>

                {isCurrentPlan(plan.name) && subscriptionData.subscribed ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    size="lg"
                    onClick={openCustomerPortal}
                    disabled={loading}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                ) : (
                  <Button 
                    variant={plan.buttonVariant} 
                    className="w-full"
                    size="lg"
                    onClick={() => handlePlanSelect(plan)}
                    disabled={loading || isCurrentPlan(plan.name)}
                  >
                    {plan.popular && <Zap className="w-4 h-4 mr-2" />}
                    {isCurrentPlan(plan.name) ? 'Plano Atual' : plan.buttonText}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-muted-foreground">
            ✨ Todos os planos incluem 7 dias de teste grátis • Cancele a qualquer momento
          </p>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <span>🔒 Pagamento seguro</span>
            <span>📱 Acesso mobile</span>
            <span>🌍 Disponível 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
};