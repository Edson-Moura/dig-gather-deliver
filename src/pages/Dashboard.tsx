import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useProgress } from '@/hooks/useProgress';
import { useAchievements } from '@/hooks/useAchievements';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import { Navigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Badge as AchievementBadge } from '@/components/Badge';
import { LevelSystem } from '@/components/LevelSystem';
import { Celebration } from '@/components/Celebration';
import { PlanUpgradeCard } from '@/components/PlanUpgradeCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar,
  Play,
  Award,
  MessageCircle,
  Clock,
  Flame,
  Star,
  Trophy,
  Crown
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { todayActivity, getMasteredCount, getDailyGoalProgress, loading: progressLoading } = useProgress();
  const { 
    getUnlockedBadges, 
    newBadges, 
    dismissNewBadges,
    unlockedCount 
  } = useAchievements();
  const { currentPlan, hasReachedDailyLessonLimit, hasReachedSentenceLimit } = usePlanLimits();
  const { subscriptionData, checkSubscription, loading: subscriptionLoading } = useSubscription();
  
  // Initialize notification scheduler
  useNotificationScheduler();

  if (loading || profileLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/40 rounded-full animate-spin mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-primary font-semibold">Carregando painel...</p>
            <p className="text-muted-foreground text-sm">Preparando seu progresso de aprendizado</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Celebration 
        badges={newBadges} 
        onDismiss={dismissNewBadges}
        show={newBadges.length > 0}
      />
      
      <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Olá, {profile?.display_name || 'estudante'}! Bem-vindo ao seu painel 👋
            </h1>
            <p className="text-muted-foreground">
              Continue sua jornada de aprendizado em inglês
            </p>
          </div>
          
          {currentPlan === 'free' && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Plano Gratuito
              </Badge>
              <Button 
                variant="default" 
                size="sm" 
                asChild
              >
                <Link to="/pricing">
                  <Crown className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </Link>
              </Button>
            </div>
          )}
          
          {subscriptionData.subscribed && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {subscriptionData.subscription_tier}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={checkSubscription}
                disabled={subscriptionLoading}
                className="text-xs"
              >
                {subscriptionLoading ? 'Verificando...' : 'Atualizar'}
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in"
             style={{ animationDelay: '0.1s' }}>
          <Card className="shadow-card hover:shadow-elevated transition-smooth hover-scale group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência</CardTitle>
              <Flame className="h-4 w-4 text-orange group-hover:animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.streak_count || 0} dias</div>
              <p className="text-xs text-muted-foreground">
                {profile?.streak_count && profile.streak_count > 0 
                  ? "Continue estudando para manter sua sequência!" 
                  : "Comece hoje e inicie sua sequência!"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-smooth hover-scale group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
              <Award className="h-4 w-4 text-teal group-hover:animate-bounce" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unlockedCount}</div>
              <p className="text-xs text-muted-foreground">
                Troféus desbloqueados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-smooth hover-scale group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frases Aprendidas</CardTitle>
              <BookOpen className="h-4 w-4 text-primary group-hover:animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getMasteredCount()}</div>
              <p className="text-xs text-muted-foreground">
                Meta diária: {profile?.daily_goal || 5} frases
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-smooth hover-scale group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos</CardTitle>
              <Star className="h-4 w-4 text-green group-hover:animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.points || 0} XP</div>
              <p className="text-xs text-muted-foreground">
                {todayActivity?.points_earned 
                  ? `+${todayActivity.points_earned} XP hoje`
                  : "Ganhe pontos estudando"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Level System and Recent Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in"
             style={{ animationDelay: '0.2s' }}>
          <div className="lg:col-span-2">
            <LevelSystem />
          </div>
          
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange" />
                  Últimas Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getUnlockedBadges().slice(-3).reverse().map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3">
                      <AchievementBadge badge={badge} isUnlocked={true} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{badge.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                  
                  {getUnlockedBadges().length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma conquista ainda</p>
                      <p className="text-xs">Continue estudando!</p>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/achievements">
                        Ver Todas as Conquistas
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Plan Upgrade Card for Free Users */}
        {currentPlan === 'free' && (hasReachedDailyLessonLimit() || hasReachedSentenceLimit()) && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <PlanUpgradeCard feature="lessons" />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in"
             style={{ animationDelay: '0.3s' }}>
          {/* Daily Goal */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Meta Diária
                  {currentPlan === 'free' && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {3 - getDailyGoalProgress()}/3 restantes
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentPlan === 'free' 
                    ? "Complete até 3 lições por dia no plano gratuito"
                    : "Complete sua meta de hoje para manter a sequência"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso de hoje</span>
                    <span>{getDailyGoalProgress()}/{profile?.daily_goal || 5} frases</span>
                  </div>
                  <Progress 
                    value={((getDailyGoalProgress()) / (profile?.daily_goal || 5)) * 100} 
                    className="w-full h-2" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    className="h-12 hover-scale group" 
                    size="lg" 
                    asChild
                    disabled={currentPlan === 'free' && hasReachedDailyLessonLimit()}
                  >
                    <Link to="/lessons">
                      <Play className="w-5 h-5 group-hover:animate-pulse" />
                      {hasReachedDailyLessonLimit() ? 'Limite Atingido' : 'Começar Lição'}
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-12 hover-scale group" size="lg" asChild>
                    <Link to="/chat">
                      <MessageCircle className="w-5 h-5 group-hover:animate-bounce" />
                      Praticar Conversação
                    </Link>
                  </Button>
                </div>

                {currentPlan === 'free' && hasReachedDailyLessonLimit() && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Você atingiu o limite diário do plano gratuito.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link to="/pricing">
                        <Crown className="w-4 h-4 mr-2" />
                        Ver Planos Premium
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan Status / Activity Feed */}
          <div className="space-y-6">
            {/* Plan Status Card */}
            {currentPlan === 'free' && (
              <PlanUpgradeCard showUpgradeButton={false} />
            )}
            
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Atividades de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green" />
                      <span className="text-sm font-medium">Lições Concluídas</span>
                    </div>
                    <Badge variant="secondary">
                      {getDailyGoalProgress()}
                      {currentPlan === 'free' ? '/3' : ''}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange" />
                      <span className="text-sm font-medium">Pontos Ganhos</span>
                    </div>
                    <Badge variant="secondary">
                      {todayActivity?.points_earned || 0} XP
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-teal" />
                      <span className="text-sm font-medium">Frases Dominadas</span>
                    </div>
                    <Badge variant="secondary">
                      {getMasteredCount()}
                      {currentPlan === 'free' ? '/50' : ''}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Explore diferentes maneiras de aprender inglês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 hover-scale group" asChild>
                  <Link to="/lessons">
                    <BookOpen className="w-6 h-6 text-green group-hover:animate-pulse" />
                    <span className="text-sm">Lições</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 hover-scale group" asChild>
                  <Link to="/chat">
                    <MessageCircle className="w-6 h-6 text-primary group-hover:animate-bounce" />
                    <span className="text-sm">Chat IA</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 hover-scale group" asChild>
                  <Link to="/quiz">
                    <Trophy className="w-6 h-6 text-orange group-hover:animate-spin" />
                    <span className="text-sm">Quiz</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 hover-scale group" asChild>
                  <Link to="/achievements">
                    <TrendingUp className="w-6 h-6 text-teal group-hover:animate-pulse" />
                    <span className="text-sm">Conquistas</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </>
  );
};

export default Dashboard;