import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useLessons } from '@/hooks/useLessons';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useSubscription } from '@/hooks/useSubscription';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play,
  Lock,
  CheckCircle,
  Star,
  Clock
} from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const Lessons = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { lessons, loading: lessonsLoading } = useLessons();
  const { progress, getMasteredCount } = useProgress();
  const { 
    lessonProgress, 
    isLessonUnlocked, 
    isLessonCompleted, 
    getLessonProgress: getLessonProgressValue,
    getCompletedLessonsCount,
    loading: progressLoading 
  } = useLessonProgress();
  const { checkSubscription } = useSubscription();

  // Refresh subscription status when page loads
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  if (authLoading || profileLoading || lessonsLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userLevel = profile?.level || 'beginner';
  const levelTranslation = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário', 
    advanced: 'Avançado'
  };

  const lessonsByLevel = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.level]) {
      acc[lesson.level] = [];
    }
    acc[lesson.level].push(lesson);
    return acc;
  }, {} as Record<string, typeof lessons>);

  const getLessonProgressPercentage = (lessonId: string) => {
    return getLessonProgressValue(lessonId);
  };

  // Calculate completion percentage for a specific level
  const getLevelCompletionPercentage = (level: string) => {
    const levelLessons = lessonsByLevel[level] || [];
    if (levelLessons.length === 0) return 0;
    
    // For now, use a simple heuristic based on mastered count
    // In a real implementation, this would track actual lesson completion
    const masteredCount = getMasteredCount();
    const requiredForLevel = {
      'beginner': 15,    // 15 sentences to complete beginner
      'intermediate': 35, // 35 sentences to complete intermediate  
      'advanced': 60     // 60 sentences to complete advanced
    };
    
    const required = requiredForLevel[level as keyof typeof requiredForLevel] || 10;
    return Math.min(100, (masteredCount / required) * 100);
  };

  // Check if a level should be accessible
  const isLevelUnlocked = (level: string) => {
    const currentLevel = profile?.level || 'beginner';
    
    if (level === 'beginner') return true;
    
    if (level === 'intermediate') {
      // Unlock intermediate when beginner is at least 80% complete OR user is intermediate+
      return getLevelCompletionPercentage('beginner') >= 80 || 
             ['intermediate', 'advanced'].includes(currentLevel);
    }
    
    if (level === 'advanced') {
      // Unlock advanced when intermediate is at least 80% complete OR user is advanced
      return getLevelCompletionPercentage('intermediate') >= 80 || 
             currentLevel === 'advanced';
    }
    
    return false;
  };

  // Check if a specific lesson should be unlocked
  const isLessonUnlockedForUser = (lesson: any, index: number, level: string) => {
    // Para lições de iniciante, usar o sistema de progresso real
    if (level === 'beginner') {
      return isLessonUnlocked(lesson.id);
    }
    
    // Para outros níveis, manter lógica anterior
    if (!isLevelUnlocked(level)) return false;
    if (index === 0) return true;
    
    const masteredCount = getMasteredCount();
    const requiredMastery = Math.max(1, index * 2);
    
    return masteredCount >= requiredMastery;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Lições de Inglês 📚
          </h1>
          <p className="text-muted-foreground">
            Aprenda inglês passo a passo com nossas lições estruturadas
          </p>
          
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary">
              Nível: {levelTranslation[userLevel as keyof typeof levelTranslation]}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4" />
              {getCompletedLessonsCount()} lições concluídas
            </div>
          </div>
        </div>

        {/* Level Sections */}
        {['beginner', 'intermediate', 'advanced'].map((level) => {
          const levelLessons = lessonsByLevel[level] || [];
          if (levelLessons.length === 0) return null;
          
          return (
          <div key={level} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold">
                  {levelTranslation[level as keyof typeof levelTranslation]}
                </h2>
                <Badge variant={level === userLevel ? "default" : "outline"}>
                  {levelLessons.length} lições
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levelLessons.map((lesson, index) => {
                const progress = getLessonProgressPercentage(lesson.id);
                const isUnlocked = isLessonUnlockedForUser(lesson, index, level);
                const isCompleted = isLessonCompleted(lesson.id);
                
                return (
                  <Card 
                    key={lesson.id} 
                    className={`shadow-card hover:shadow-elevated transition-smooth ${
                      !isUnlocked ? 'opacity-60' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green" />
                            ) : isUnlocked ? (
                              <BookOpen className="w-5 h-5 text-primary" />
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            )}
                            <span className="text-lg">{lesson.title}</span>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {lesson.description || "Aprenda novas frases e vocabulário"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>~15 min</span>
                        </div>
                        
                        {isUnlocked ? (
                          <Link to={`/lesson/${lesson.id}`}>
                            <Button size="sm" className="gap-2">
                              <Play className="w-4 h-4" />
                              {isCompleted ? 'Revisar' : 'Iniciar'}
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" disabled className="gap-2">
                            <Lock className="w-4 h-4" />
                            Bloqueado
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          );
        })}

        {lessons.length === 0 && (
          <Card className="shadow-card text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma lição disponível</h3>
              <p className="text-muted-foreground">
                As lições estão sendo preparadas. Volte em breve!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Lessons;