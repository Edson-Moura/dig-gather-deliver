import { Badge as BadgeType } from '@/hooks/useAchievements';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BadgeProps {
  badge: BadgeType;
  isUnlocked: boolean;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

const rarityColors = {
  bronze: 'from-orange to-orange-light',
  silver: 'from-muted-foreground/60 to-muted-foreground/80',
  gold: 'from-yellow-400 to-yellow-500',
  platinum: 'from-primary to-accent',
  diamond: 'from-teal to-green'
};

const rarityGlow = {
  bronze: 'shadow-orange/30',
  silver: 'shadow-muted-foreground/20',
  gold: 'shadow-yellow-500/30',
  platinum: 'shadow-primary/30',
  diamond: 'shadow-teal/40'
};

export const Badge: React.FC<BadgeProps> = ({ 
  badge, 
  isUnlocked, 
  progress = 0, 
  size = 'md',
  showProgress = false,
  className 
}) => {
  const IconComponent = badge.icon;
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20', 
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={cn("relative group", className)}>
      <Card className={cn(
        "transition-all duration-300 hover:scale-105",
        sizeClasses[size],
        isUnlocked 
          ? `bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-lg ${rarityGlow[badge.rarity]} hover:shadow-elevated` 
          : "bg-muted border-2 border-dashed opacity-60"
      )}>
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="relative">
            <IconComponent 
              className={cn(
                iconSizes[size],
                isUnlocked ? badge.color : "text-muted-foreground"
              )}
            />
            {isUnlocked && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Tooltip/Details */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="bg-popover border rounded-lg p-3 shadow-lg min-w-48 max-w-64">
          <div className="text-sm font-semibold text-foreground">{badge.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
          
          {showProgress && !isUnlocked && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
          
          <div className="mt-2 flex items-center justify-between">
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium capitalize",
              badge.rarity === 'bronze' && "bg-orange/20 text-orange dark:bg-orange/20 dark:text-orange-light",
              badge.rarity === 'silver' && "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
              badge.rarity === 'gold' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
              badge.rarity === 'platinum' && "bg-primary/20 text-primary dark:bg-primary/20 dark:text-primary-light",
              badge.rarity === 'diamond' && "bg-teal/20 text-teal dark:bg-teal/20 dark:text-teal-light"
            )}>
              {badge.rarity}
            </div>
            {isUnlocked && (
              <div className="text-xs text-green font-medium">✓ Desbloqueado</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};