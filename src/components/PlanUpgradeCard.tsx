import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Lock, ArrowRight } from 'lucide-react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface PlanUpgradeCardProps {
  feature?: 'lessons' | 'chat' | 'sentences';
  showUpgradeButton?: boolean;
}

export const PlanUpgradeCard = ({ feature, showUpgradeButton = true }: PlanUpgradeCardProps) => {
  const { currentPlan, getRemainingUsage, getUsagePercentage } = usePlanLimits();
  const { createCheckout, loading } = useSubscription();

  if (currentPlan !== 'free') {
    return null;
  }

  const getFeatureTitle = () => {
    switch (feature) {
      case 'lessons':
        return 'Lições Diárias';
      case 'chat':
        return 'Mensagens no Chat';
      case 'sentences':
        return 'Frases Totais';
      default:
        return 'Plano Gratuito';
    }
  };

  const getFeatureDescription = () => {
    if (!feature) {
      return 'Desbloqueie todo o potencial do seu aprendizado!';
    }
    
    const remaining = getRemainingUsage(feature);
    if (remaining === 0) {
      return `Você atingiu o limite do plano gratuito para ${getFeatureTitle().toLowerCase()}.`;
    }
    
    return `${remaining} ${feature === 'lessons' ? 'lições' : feature === 'chat' ? 'mensagens' : 'frases'} restantes hoje.`;
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="w-5 h-5 text-primary" />
          {getFeatureTitle()}
          <Badge variant="outline" className="ml-auto">
            Grátis
          </Badge>
        </CardTitle>
        <CardDescription>
          {getFeatureDescription()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {feature && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uso atual</span>
              <span>{Math.round(getUsagePercentage(feature))}%</span>
            </div>
            <Progress 
              value={getUsagePercentage(feature)} 
              className="h-2"
            />
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Desbloqueie com o Premium:
          </p>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Lições ilimitadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Chat IA sem limites</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Áudio nativo profissional</span>
            </div>
          </div>
        </div>

        {showUpgradeButton && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1" 
              onClick={() => createCheckout('premium')}
              disabled={loading}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Premium
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link to="/pricing">
                Ver Planos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};