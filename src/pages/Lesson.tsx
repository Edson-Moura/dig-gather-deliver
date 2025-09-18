import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLessons } from '@/hooks/useLessons';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useProgress } from '@/hooks/useProgress';
import { useAchievements } from '@/hooks/useAchievements';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { Header } from '@/components/Header';
import { Celebration } from '@/components/Celebration';
import { LimitReachedModal } from '@/components/LimitReachedModal';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MultipleChoiceExercise } from '@/components/exercises/MultipleChoiceExercise';
import { FillInBlanksExercise } from '@/components/exercises/FillInBlanksExercise';
import { WordOrderExercise } from '@/components/exercises/WordOrderExercise';
import { ListeningExercise } from '@/components/exercises/ListeningExercise';
import PronunciationExercise from '@/components/exercises/PronunciationExercise';
import { 
  ArrowLeft,
  Shuffle,
  Target,
  BookOpen,
  Crown
} from 'lucide-react';
import { DailySituationsCard } from '@/components/DailySituationsCard';

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  level: string;
  sentences: {
    id: string;
    english_text: string;
    portuguese_text: string;
    level: string;
    category: string | null;
    difficulty_score: number;
    audio_url: string | null;
    order_index: number;
  }[];
}

type ExerciseType = 'translate' | 'multiple-choice' | 'fill-blanks' | 'word-order' | 'listening' | 'pronunciation';

const Lesson = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { fetchLessonWithSentences } = useLessons();
  const { updateProgress, getProgressForSentence } = useProgress();
  const { completLesson } = useLessonProgress();
  const { newBadges, dismissNewBadges } = useAchievements();
  const { hasReachedDailyLessonLimit, hasReachedSentenceLimit, currentPlan } = usePlanLimits();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentExerciseType, setCurrentExerciseType] = useState<ExerciseType>('translate');
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Function to calculate text similarity (Levenshtein distance)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  };

  useEffect(() => {
    if (lessonId) {
      // Only check limits for free plan users
      if (currentPlan === 'free' && (hasReachedDailyLessonLimit() || hasReachedSentenceLimit())) {
        setShowLimitModal(true);
        return;
      }
      loadLesson();
    }
  }, [lessonId, currentPlan]);

  const loadLesson = async () => {
    if (!lessonId) return;
    
    setLoading(true);
    const lessonData = await fetchLessonWithSentences(lessonId);
    
    if (lessonData) {
      // Remove duplicated sentences (by id) and keep proper order
      const uniqueMap = new Map<string, LessonData['sentences'][number]>();
      lessonData.sentences
        .sort((a, b) => a.order_index - b.order_index)
        .forEach((s) => {
          if (!uniqueMap.has(s.id)) uniqueMap.set(s.id, s);
        });

      setLesson({
        ...lessonData,
        sentences: Array.from(uniqueMap.values()),
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lição",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const currentSentence = lesson?.sentences[currentSentenceIndex];
  const progress = lesson ? ((currentSentenceIndex + (showAnswer ? 1 : 0)) / lesson.sentences.length) * 100 : 0;

  // Generate exercise types based on sentence properties
  const getRandomExerciseType = (): ExerciseType => {
    const types: ExerciseType[] = ['translate', 'multiple-choice', 'fill-blanks', 'word-order', 'listening', 'pronunciation'];
    return types[Math.floor(Math.random() * types.length)];
  };

  // Generate multiple choice options
  const getMultipleChoiceOptions = (correctAnswer: string, allSentences: typeof lesson.sentences): string[] => {
    const options = [correctAnswer];
    const otherSentences = allSentences.filter(s => s.english_text !== correctAnswer);
    
    while (options.length < 4 && otherSentences.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherSentences.length);
      const randomSentence = otherSentences[randomIndex];
      options.push(randomSentence.english_text);
      otherSentences.splice(randomIndex, 1);
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return options;
  };

  // Get random word for fill-in-blanks
  const getRandomWord = (sentence: string): string => {
    // Remove punctuation and split into words
    const words = sentence.replace(/[^\w\s]/g, '').split(' ').filter(word => word.length > 2);
    
    // Prioritize common words that students should practice
    const commonWords = words.filter(word => 
      ['am', 'is', 'are', 'was', 'were', 'not', 'and', 'the', 'a', 'an', 'to', 'in', 'on', 'at', 'for', 'with'].includes(word.toLowerCase())
    );
    
    // Use common words if available, otherwise use any word longer than 2 characters
    const targetWords = commonWords.length > 0 ? commonWords : words;
    
    return targetWords[Math.floor(Math.random() * targetWords.length)] || sentence.split(' ')[0];
  };

  const handleExerciseAnswer = (isCorrect: boolean) => {
    // Only check limits for free plan users - check at exercise time, not on load
    if (currentPlan === 'free' && (hasReachedDailyLessonLimit() || hasReachedSentenceLimit())) {
      setShowLimitModal(true);
      return;
    }
    
    setShowAnswer(true);
    
    // Update progress
    const status = isCorrect ? 'mastered' : 'learning';
    if (currentSentence) {
      updateProgress(currentSentence.id, status, isCorrect);
    }

    if (isCorrect) {
      toast({
        title: "Correto! 🎉",
        description: "Você acertou!",
      });
    } else {
      toast({
        title: "Quase lá! 💪",
        description: "Continue praticando!",
        variant: "destructive",
      });
    }
  };

  const nextSentence = () => {
    if (!lesson) return;

    if (currentSentenceIndex < lesson.sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setShowAnswer(false);
      setCurrentExerciseType(getRandomExerciseType());
    } else {
      // Lesson completed - marcar como concluída
      if (lessonId) {
        completLesson(lessonId);
      }
      
      toast({
        title: "Lição concluída! 🎉",
        description: "Parabéns! Você terminou esta lição e a próxima foi desbloqueada.",
      });
      navigate('/lessons');
    }
  };

  const handleTranslationSubmit = (userAnswer: string) => {
    if (!currentSentence) return;
    
    const userAnswerLower = userAnswer.toLowerCase();
    const correctAnswer = currentSentence.english_text.toLowerCase();
    
    // Normalize answers by removing punctuation and extra spaces
    const normalizeText = (text: string) => {
      return text
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')    // Normalize spaces
        .trim();
    };
    
    const normalizedUser = normalizeText(userAnswerLower);
    const normalizedCorrect = normalizeText(correctAnswer);
    
    // Check for exact match or very close match (80% similarity)
    const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);
    const isCorrect = similarity >= 0.8;
    
    handleExerciseAnswer(isCorrect);
  };

  const changeExerciseType = () => {
    const types: ExerciseType[] = ['translate', 'multiple-choice', 'fill-blanks', 'word-order', 'listening', 'pronunciation'];
    const currentIndex = types.indexOf(currentExerciseType);
    const nextIndex = (currentIndex + 1) % types.length;
    setCurrentExerciseType(types[nextIndex]);
    setShowAnswer(false);
  };

  const getExerciseTypeLabel = (type: ExerciseType): string => {
    const labels = {
      'translate': 'Tradução',
      'multiple-choice': 'Múltipla Escolha',
      'fill-blanks': 'Completar',
      'word-order': 'Ordenar',
      'listening': 'Escuta',
      'pronunciation': 'Pronúncia'
    };
    return labels[type];
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/40 rounded-full animate-spin mx-auto animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-primary font-semibold">Carregando lição...</p>
            <p className="text-muted-foreground text-sm">Preparando exercícios interativos</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!lesson) {
    return (
      <>
        <Celebration 
          badges={newBadges} 
          onDismiss={dismissNewBadges}
          show={newBadges.length > 0}
        />
        
        <div className="min-h-screen bg-gradient-subtle">
          <Header />
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Lição não encontrada</h1>
            <Button onClick={() => navigate('/lessons')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar às lições
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        feature="lessons"
      />
      
      <Celebration 
        badges={newBadges} 
        onDismiss={dismissNewBadges}
        show={newBadges.length > 0}
      />
      
      <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/lessons')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{lesson.title}</h1>
                {currentPlan === 'free' && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Plano Gratuito
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {currentSentenceIndex + 1} de {lesson.sentences.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {getExerciseTypeLabel(currentExerciseType)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={changeExerciseType}
              className="hover-scale group"
            >
              <Shuffle className="w-4 h-4 mr-2 group-hover:animate-spin" />
              Trocar tipo
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Progress value={progress} className="w-full h-2 transition-smooth" />
        </div>

        {/* Daily Situations Visual Context */}
        {currentSentence?.category === 'daily_situations' && (
          <div className="mb-6 animate-fade-in">
            <DailySituationsCard sentence={currentSentence} exerciseType={currentExerciseType} />
          </div>
        )}

        {/* Dynamic Exercise Component */}
        {currentSentence && (
          <>
            {currentExerciseType === 'multiple-choice' && (
              <MultipleChoiceExercise
                sentence={currentSentence}
                options={getMultipleChoiceOptions(currentSentence.english_text, lesson.sentences)}
                correctAnswer={currentSentence.english_text}
                onAnswer={handleExerciseAnswer}
                onNext={nextSentence}
                showAnswer={showAnswer}
              />
            )}
            
            {currentExerciseType === 'fill-blanks' && (
              <FillInBlanksExercise
                sentence={currentSentence}
                missingWord={getRandomWord(currentSentence.english_text)}
                onAnswer={handleExerciseAnswer}
                onNext={nextSentence}
                showAnswer={showAnswer}
              />
            )}
            
            {currentExerciseType === 'word-order' && (
              <WordOrderExercise
                sentence={currentSentence}
                onAnswer={handleExerciseAnswer}
                onNext={nextSentence}
                showAnswer={showAnswer}
              />
            )}
            
            {currentExerciseType === 'listening' && (
              <ListeningExercise
                sentence={currentSentence}
                onAnswer={handleExerciseAnswer}
                onNext={nextSentence}
                showAnswer={showAnswer}
              />
            )}
            
            {currentExerciseType === 'translate' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-lg shadow-card p-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Tradução Livre</h3>
                  </div>
                  
                  <div className="text-center py-6">
                    <p className="text-lg mb-4 text-muted-foreground">
                      Traduza: <strong>{currentSentence.portuguese_text}</strong>
                    </p>
                    {currentSentence.category && (
                      <Badge variant="secondary">{currentSentence.category}</Badge>
                    )}
                  </div>
                  
                  {!showAnswer ? (
                    <div className="space-y-4 animate-fade-in">
                      <input
                        type="text"
                        id="translation-input"
                        placeholder="Digite a tradução em inglês..."
                        className="w-full text-lg p-4 h-14 rounded-lg border border-border bg-background transition-smooth focus:ring-2 focus:ring-primary/20 focus:border-primary text-center"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            if (target.value.trim()) {
                              handleTranslationSubmit(target.value.trim());
                            }
                          }
                        }}
                      />
                      <Button 
                        onClick={() => {
                          const input = document.getElementById('translation-input') as HTMLInputElement;
                          if (input?.value.trim()) {
                            handleTranslationSubmit(input.value.trim());
                          }
                        }}
                        className="w-full h-12 text-lg"
                        disabled={false}
                      >
                        Verificar Resposta
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border-2 ${
                        showAnswer ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">Resposta correta:</span>
                        </div>
                        <p className="text-lg font-semibold">{currentSentence.english_text}</p>
                      </div>
                      
                      <Button onClick={nextSentence} className="w-full h-12 text-lg hover-scale" 
                              style={{ animationDelay: '0.2s' }}>
                        {currentSentenceIndex === lesson.sentences.length - 1 ? 'Finalizar Lição' : 'Próxima Frase'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {currentExerciseType === 'pronunciation' && (
              <PronunciationExercise
                sentence={currentSentence}
                onAnswer={handleExerciseAnswer}
                onNext={nextSentence}
                showAnswer={showAnswer}
              />
            )}
          </>
        )}
      </main>
    </div>
    </>
  );
};

export default Lesson;