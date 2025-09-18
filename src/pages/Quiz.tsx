import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSentences } from '@/hooks/useSentences';
import { Navigate, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Quiz } from '@/components/Quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy,
  Target,
  BookOpen,
  Zap,
  PlayCircle,
  Clock
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'translation' | 'audio';
  question: string;
  portuguese_text?: string;
  english_text?: string;
  options?: string[];
  correct_answer: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QuizPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { sentences, loading: sentencesLoading } = useSentences();
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizType, setQuizType] = useState<'practice' | 'timed' | 'challenge' | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateQuizQuestions = (level: string, count: number = 10): QuizQuestion[] => {
    const levelSentences = sentences.filter(s => s.level === level);
    if (levelSentences.length === 0) return [];

    const shuffled = [...levelSentences].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    return selected.map((sentence, index) => {
      const questionTypes = ['multiple-choice', 'translation'];
      const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)] as 'multiple-choice' | 'translation';

      if (randomType === 'multiple-choice') {
        // Generate wrong options
        const otherSentences = levelSentences.filter(s => s.id !== sentence.id);
        const wrongOptions = otherSentences
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(s => s.english_text);
        
        const allOptions = [sentence.english_text, ...wrongOptions]
          .sort(() => Math.random() - 0.5);

        return {
          id: sentence.id,
          type: 'multiple-choice' as const,
          question: `Como você traduz "${sentence.portuguese_text}" para o inglês?`,
          portuguese_text: sentence.portuguese_text,
          english_text: sentence.english_text,
          options: allOptions,
          correct_answer: sentence.english_text,
          category: sentence.category || undefined,
          difficulty: getDifficultyFromScore(sentence.difficulty_score)
        };
      } else {
        return {
          id: sentence.id,
          type: 'translation' as const,
          question: `Traduza para o inglês: "${sentence.portuguese_text}"`,
          portuguese_text: sentence.portuguese_text,
          english_text: sentence.english_text,
          options: [], // No options for translation - user types the answer
          correct_answer: sentence.english_text,
          category: sentence.category || undefined,
          difficulty: getDifficultyFromScore(sentence.difficulty_score)
        };
      }
    });
  };

  const getDifficultyFromScore = (score: number): 'easy' | 'medium' | 'hard' => {
    if (score <= 3) return 'easy';
    if (score <= 6) return 'medium';
    return 'hard';
  };

  const startQuiz = (type: 'practice' | 'timed' | 'challenge') => {
    setQuizType(type);
    
    let questions: QuizQuestion[] = [];
    
    switch (type) {
      case 'practice':
        questions = generateQuizQuestions('beginner', 10);
        break;
      case 'timed':
        questions = generateQuizQuestions('intermediate', 15);
        break;
      case 'challenge':
        // Mix of all levels
        const beginnerQuestions = generateQuizQuestions('beginner', 5);
        const intermediateQuestions = generateQuizQuestions('intermediate', 5);
        const advancedQuestions = generateQuizQuestions('advanced', 5);
        questions = [...beginnerQuestions, ...intermediateQuestions, ...advancedQuestions]
          .sort(() => Math.random() - 0.5);
        break;
    }

    if (questions.length === 0) {
      toast({
        title: "Erro",
        description: "Não há perguntas suficientes para este quiz. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return;
    }

    setCurrentQuiz(questions);
  };

  const handleQuizComplete = (score: number, correctAnswers: number) => {
    toast({
      title: "Quiz Concluído! 🎉",
      description: `Você acertou ${correctAnswers} perguntas e fez ${score} pontos!`,
    });
    
    setCurrentQuiz(null);
    setQuizType(null);
  };

  if (authLoading || sentencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/40 rounded-full animate-spin mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-primary font-semibold">Carregando quiz...</p>
            <p className="text-muted-foreground text-sm">Preparando perguntas desafiadoras</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If quiz is active, show the quiz component
  if (currentQuiz && quizType) {
    const getTimeLimit = () => {
      switch (quizType) {
        case 'timed': return 30; // 30 seconds per question
        case 'challenge': return 20; // 20 seconds per question
        default: return undefined; // No time limit for practice
      }
    };

    const getQuizTitle = () => {
      switch (quizType) {
        case 'practice': return 'Quiz Prática';
        case 'timed': return 'Quiz Cronometrado';
        case 'challenge': return 'Quiz Desafio';
        default: return 'Quiz';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Quiz 
            questions={currentQuiz}
            onComplete={handleQuizComplete}
            title={getQuizTitle()}
            timeLimit={getTimeLimit()}
          />
        </main>
      </div>
    );
  }

  // Quiz selection screen
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            Quiz Interativo de Inglês
          </h1>
          <p className="text-muted-foreground">
            Teste seus conhecimentos e melhore suas habilidades em inglês
          </p>
        </div>

        {/* Quiz Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in"
             style={{ animationDelay: '0.1s' }}>
          {/* Practice Quiz */}
          <Card className="shadow-card hover:shadow-elevated transition-smooth cursor-pointer hover-scale group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Quiz Prática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>10 perguntas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Sem limite de tempo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span>Nível iniciante</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="secondary">Perfeito para começar</Badge>
                <p className="text-sm text-muted-foreground">
                  Quiz tranquilo para praticar o básico sem pressão
                </p>
              </div>
              
              <Button 
                onClick={() => startQuiz('practice')} 
                className="w-full gap-2 hover-scale"
                disabled={sentences.length === 0}
              >
                <PlayCircle className="w-4 h-4" />
                Começar Prática
              </Button>
            </CardContent>
          </Card>

          {/* Timed Quiz */}
          <Card className="shadow-card hover:shadow-elevated transition-smooth cursor-pointer hover-scale group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-accent" />
                Quiz Cronometrado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>15 perguntas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>30 segundos por pergunta</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span>Nível intermediário</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="secondary">Teste sua velocidade</Badge>
                <p className="text-sm text-muted-foreground">
                  Desafie-se com tempo limitado para cada pergunta
                </p>
              </div>
              
              <Button 
                onClick={() => startQuiz('timed')} 
                className="w-full gap-2 hover-scale"
                disabled={sentences.length === 0}
              >
                <PlayCircle className="w-4 h-4" />
                Começar Cronometrado
              </Button>
            </CardContent>
          </Card>

          {/* Challenge Quiz */}
          <Card className="shadow-card hover:shadow-elevated transition-smooth cursor-pointer border-primary/50 hover-scale group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-accent" />
                Quiz Desafio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>15 perguntas mistas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>20 segundos por pergunta</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span>Todos os níveis</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge className="bg-gradient-primary text-white">Desafio máximo</Badge>
                <p className="text-sm text-muted-foreground">
                  O quiz mais difícil com perguntas de todos os níveis
                </p>
              </div>
              
              <Button 
                onClick={() => startQuiz('challenge')} 
                className="w-full gap-2 bg-gradient-primary hover:opacity-90 hover-scale"
                disabled={sentences.length === 0}
              >
                <PlayCircle className="w-4 h-4" />
                Aceitar Desafio
              </Button>
            </CardContent>
          </Card>
        </div>

        {sentences.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Não há perguntas disponíveis no momento. Volte mais tarde!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;