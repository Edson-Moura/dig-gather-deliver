import { useProfile } from '@/hooks/useProfile';
import { useProgress } from '@/hooks/useProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Star, 
  Target, 
  Flame,
  Crown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelData {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: any;
  benefits: string[];
}

const LEVELS: LevelData[] = [
  {
    level: 1,
    name: "Iniciante",
    minXP: 0,
    maxXP: 100,
    color: "text-gray-600",
    icon: Star,
    benefits: ["Acesso às lições básicas"]
  },
  {
    level: 2,
    name: "Explorador",
    minXP: 100,
    maxXP: 250,
    color: "text-teal",
    icon: Target,
    benefits: ["Desbloqueou exercícios de escuta", "Meta diária aumentada"]
  },
  {
    level: 3,
    name: "Estudante",
    minXP: 250,
    maxXP: 500,
    color: "text-green-600",
    icon: TrendingUp,
    benefits: ["Acesso a lições intermediárias", "Bônus de XP +10%"]
  },
  {
    level: 4,
    name: "Dedicado",
    minXP: 500,
    maxXP: 1000,
    color: "text-purple-600",
    icon: Flame,
    benefits: ["Chat com IA liberado", "Bônus de XP +15%"]
  },
  {
    level: 5,
    name: "Experiente",
    minXP: 1000,
    maxXP: 2000,
    color: "text-orange-600",
    icon: Sparkles,
    benefits: ["Lições avançadas", "Streak freeze", "Bônus de XP +20%"]
  },
  {
    level: 6,
    name: "Mestre",
    minXP: 2000,
    maxXP: 5000,
    color: "text-yellow-600",
    icon: Crown,
    benefits: ["Acesso total", "Streak protection", "Bônus de XP +25%"]
  }
];

export const LevelSystem: React.FC = () => {
  const { profile } = useProfile();
  const currentXP = profile?.points || 0;
  
  // Find current level
  const currentLevelData = LEVELS.find(level => 
    currentXP >= level.minXP && currentXP < level.maxXP
  ) || LEVELS[LEVELS.length - 1];
  
  const nextLevelData = LEVELS.find(level => level.level === currentLevelData.level + 1);
  
  // Calculate progress to next level
  const progressInCurrentLevel = currentXP - currentLevelData.minXP;
  const xpNeededForNextLevel = nextLevelData ? nextLevelData.minXP - currentLevelData.minXP : 0;
  const progressPercentage = nextLevelData 
    ? (progressInCurrentLevel / xpNeededForNextLevel) * 100 
    : 100;

  const IconComponent = currentLevelData.icon;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Sistema de Níveis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Level Display */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
            currentLevelData.level <= 2 && "from-gray-400 to-gray-500",
            currentLevelData.level === 3 && "from-teal to-teal-light", 
            currentLevelData.level === 4 && "from-purple-400 to-purple-500",
            currentLevelData.level === 5 && "from-orange-400 to-orange-500",
            currentLevelData.level >= 6 && "from-yellow-400 to-yellow-500"
          )}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold">Nível {currentLevelData.level}</span>
              <Badge variant="secondary" className={currentLevelData.color}>
                {currentLevelData.name}
              </Badge>
            </div>
            <div className="text-muted-foreground">
              {currentXP} XP total
            </div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevelData && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para Nível {nextLevelData.level}</span>
              <span>
                {progressInCurrentLevel} / {xpNeededForNextLevel} XP
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-xs text-muted-foreground text-center">
              {nextLevelData.minXP - currentXP} XP para o próximo nível
            </div>
          </div>
        )}

        {/* Current Level Benefits */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Benefícios Atuais
          </h4>
          <ul className="space-y-1">
            {currentLevelData.benefits.map((benefit, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Next Level Preview */}
        {nextLevelData && (
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2 text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Próximo: {nextLevelData.name}
            </h4>
            <ul className="space-y-1">
              {nextLevelData.benefits.slice(0, 2).map((benefit, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2 opacity-70">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Level Timeline */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Progresso Geral</span>
            <span className="text-xs text-muted-foreground">
              Nível {currentLevelData.level} de {LEVELS.length}
            </span>
          </div>
          <div className="flex gap-1">
            {LEVELS.map((level, index) => (
              <div
                key={level.level}
                className={cn(
                  "flex-1 h-2 rounded-full",
                  currentLevelData.level > level.level 
                    ? "bg-primary" 
                    : currentLevelData.level === level.level
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};