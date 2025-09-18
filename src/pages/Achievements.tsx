import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { LevelSystem } from '@/components/LevelSystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target,
  Award,
  Lock,
  CheckCircle
} from 'lucide-react';

const Achievements = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    badges,
    getUnlockedBadges, 
    getLockedBadges, 
    getBadgeProgress,
    unlockedCount,
    totalBadges
  } = useAchievements();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const unlockedBadges = getUnlockedBadges();
  const lockedBadges = getLockedBadges();
  const completionPercentage = (unlockedCount / totalBadges) * 100;

  const badgesByRarity = {
    bronze: badges.filter(b => b.rarity === 'bronze'),
    silver: badges.filter(b => b.rarity === 'silver'),
    gold: badges.filter(b => b.rarity === 'gold'),
    platinum: badges.filter(b => b.rarity === 'platinum'),
    diamond: badges.filter(b => b.rarity === 'diamond')
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Conquistas e Progresso 🏆
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e desbloqueie novos troféus
          </p>
          
          {/* Overall Progress */}
          <div className="mt-6 p-4 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Progresso Geral</span>
              <span className="text-sm text-muted-foreground">
                {unlockedCount} de {totalBadges} conquistas
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="text-center mt-2 text-sm text-muted-foreground">
              {Math.round(completionPercentage)}% completo
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Level System */}
          <div className="lg:col-span-1">
            <LevelSystem />
          </div>

          {/* Achievements */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="unlocked">Desbloqueadas</TabsTrigger>
                <TabsTrigger value="locked">Bloqueadas</TabsTrigger>
                <TabsTrigger value="rarity">Por Raridade</TabsTrigger>
              </TabsList>
              
              {/* All Badges */}
              <TabsContent value="all" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Todas as Conquistas
                    </CardTitle>
                    <CardDescription>
                      Complete diferentes desafios para desbloquear troféus
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {badges.map((badge) => {
                        const isUnlocked = unlockedBadges.some(ub => ub.id === badge.id);
                        const progress = getBadgeProgress(badge);
                        
                        return (
                          <Badge
                            key={badge.id}
                            badge={badge}
                            isUnlocked={isUnlocked}
                            progress={progress}
                            showProgress={true}
                          />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Unlocked Badges */}
              <TabsContent value="unlocked" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Conquistas Desbloqueadas ({unlockedBadges.length})
                    </CardTitle>
                    <CardDescription>
                      Parabéns por essas conquistas!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {unlockedBadges.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {unlockedBadges.map((badge) => (
                          <Badge
                            key={badge.id}
                            badge={badge}
                            isUnlocked={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma conquista desbloqueada ainda.</p>
                        <p className="text-sm mt-1">Continue estudando para ganhar seus primeiros troféus!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Locked Badges */}
              <TabsContent value="locked" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      Conquistas Bloqueadas ({lockedBadges.length})
                    </CardTitle>
                    <CardDescription>
                      Trabalhe para desbloquear essas conquistas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {lockedBadges.map((badge) => {
                        const progress = getBadgeProgress(badge);
                        
                        return (
                          <Badge
                            key={badge.id}
                            badge={badge}
                            isUnlocked={false}
                            progress={progress}
                            showProgress={true}
                          />
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* By Rarity */}
              <TabsContent value="rarity" className="space-y-6">
                {Object.entries(badgesByRarity).map(([rarity, rarityBadges]) => {
                  if (rarityBadges.length === 0) return null;
                  
                  const unlockedInRarity = rarityBadges.filter(badge => 
                    unlockedBadges.some(ub => ub.id === badge.id)
                  ).length;
                  
                  return (
                    <Card key={rarity}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="capitalize flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            {rarity === 'bronze' && '🥉 Bronze'}
                            {rarity === 'silver' && '🥈 Prata'}
                            {rarity === 'gold' && '🥇 Ouro'}
                            {rarity === 'platinum' && '💎 Platina'}
                            {rarity === 'diamond' && '💠 Diamante'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {unlockedInRarity}/{rarityBadges.length}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {rarityBadges.map((badge) => {
                            const isUnlocked = unlockedBadges.some(ub => ub.id === badge.id);
                            const progress = getBadgeProgress(badge);
                            
                            return (
                              <Badge
                                key={badge.id}
                                badge={badge}
                                isUnlocked={isUnlocked}
                                progress={progress}
                                showProgress={!isUnlocked}
                              />
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Achievements;