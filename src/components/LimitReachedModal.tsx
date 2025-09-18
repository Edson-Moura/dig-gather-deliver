import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'lessons' | 'chat' | 'sentences';
  currentUsage?: number;
  limit?: number;
}

export const LimitReachedModal = ({ 
  isOpen, 
  onClose, 
  feature,
  currentUsage,
  limit 
}: LimitReachedModalProps) => {
  const { createCheckout, loading } = useSubscription();

  const getFeatureInfo = () => {
    switch (feature) {
      case 'lessons':
        return {
          title: 'Limite de Lições Atingido',
          description: 'Você completou suas lições gratuitas de hoje. Faça upgrade para continuar aprendendo sem limites!',
          icon: Lock,
        };
      case 'chat':
        return {
          title: 'Limite de Chat Atingido',
          description: 'Suas mensagens gratuitas do chat IA acabaram hoje. Upgrade para conversas ilimitadas!',
          icon: Lock,
        };
      case 'sentences':
        return {
          title: 'Limite de Frases Atingido',
          description: 'Você dominou o máximo de frases no plano gratuito. Upgrade para aprender milhares de frases!',
          icon: Lock,
        };
      default:
        return {
          title: 'Limite Atingido',
          description: 'Você atingiu o limite do plano gratuito.',
          icon: Lock,
        };
    }
  };

  const featureInfo = getFeatureInfo();
  const IconComponent = featureInfo.icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-xl">
            {featureInfo.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base mt-2">
            {featureInfo.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            Desbloqueie com Premium:
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span>Lições e frases ilimitadas</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span>Chat IA sem restrições</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span>Áudio nativo profissional</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span>Repetição espaçada avançada</span>
            </li>
          </ul>
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction asChild>
            <Button 
              className="w-full" 
              onClick={() => createCheckout('premium')}
              disabled={loading}
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade Agora - R$ 19,90/mês
            </Button>
          </AlertDialogAction>
          
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to="/pricing" onClick={onClose}>
                Ver Todos os Planos
              </Link>
            </Button>
            <AlertDialogCancel asChild>
              <Button variant="ghost" size="sm" className="flex-1">
                Continuar Grátis
              </Button>
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};