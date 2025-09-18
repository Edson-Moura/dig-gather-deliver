import { useEffect, useState } from 'react';
import { Badge as BadgeType } from '@/hooks/useAchievements';
import { Badge } from './Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelebrationProps {
  badges: BadgeType[];
  onDismiss: () => void;
  show: boolean;
}

export const Celebration: React.FC<CelebrationProps> = ({ badges, onDismiss, show }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (show && badges.length > 0) {
      setIsVisible(true);
      
      // Generate confetti
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        color: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'][Math.floor(Math.random() * 5)]
      }));
      setConfetti(newConfetti);
      
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, badges]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
      setConfetti([]);
    }, 300);
  };

  if (!show || badges.length === 0) return null;

  return (
    <>
      {/* Overlay */}
      <div className={cn(
        "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="fixed w-2 h-2 z-50 animate-[fade-in_0.3s_ease-out,_slide-in-right_3s_ease-out_infinite] pointer-events-none"
          style={{
            left: `${piece.x}%`,
            top: '-10px',
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            transform: 'rotate(45deg)'
          }}
        />
      ))}
      
      {/* Celebration Modal */}
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
        isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}>
        <Card className="max-w-md w-full shadow-2xl border-2 border-primary animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                  Parabéns! 🎉
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </CardTitle>
                <p className="text-muted-foreground">
                  {badges.length === 1 
                    ? 'Você desbloqueou uma nova conquista!'
                    : `Você desbloqueou ${badges.length} novas conquistas!`
                  }
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Badge Display */}
            <div className="flex justify-center gap-4">
              {badges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="animate-fade-in">
                  <Badge 
                    badge={badge} 
                    isUnlocked={true}
                    size="lg"
                    className="animate-[scale-in_0.5s_ease-out]"
                  />
                </div>
              ))}
            </div>
            
            {/* Badge Details */}
            <div className="space-y-3">
              {badges.slice(0, 2).map((badge, index) => (
                <div 
                  key={badge.id}
                  className="text-center p-3 bg-muted rounded-lg animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="font-semibold text-foreground">{badge.name}</div>
                  <div className="text-sm text-muted-foreground">{badge.description}</div>
                </div>
              ))}
              
              {badges.length > 2 && (
                <div className="text-center text-sm text-muted-foreground">
                  E mais {badges.length - 2} conquista{badges.length - 2 > 1 ? 's' : ''}!
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <div className="text-center">
              <Button 
                onClick={handleDismiss}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8"
              >
                Continuar Aprendendo! 🚀
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};