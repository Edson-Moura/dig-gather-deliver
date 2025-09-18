import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { useProgress } from '@/hooks/useProgress';
import { useToast } from '@/hooks/use-toast';
import { 
  Volume2, 
  CheckCircle, 
  X, 
  Trophy, 
  Target,
  Clock,
  Zap,
  RefreshCw
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

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number, correctAnswers: number) => void;
  title?: string;
  timeLimit?: number; // em segundos
}

export const Quiz = ({ questions, onComplete, title = "Quiz Interativo", timeLimit }: QuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: string; correct: boolean }>>([]);
  
  
  const { updateProgress } = useProgress();
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (timeLimit && quizStarted && timeLeft > 0 && currentQuestionIndex < questions.length) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && timeLimit && quizStarted) {
      handleTimeUp();
    }
  }, [timeLeft, quizStarted, timeLimit, currentQuestionIndex]);

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(timeLimit || 0);
  };

  const handleTimeUp = () => {
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    } else {
      finishQuiz();
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;

    let isCorrect = false;
    
    if (currentQuestion.type === 'translation') {
      // For translation questions, be more flexible with the answer
      const userAnswer = selectedAnswer.toLowerCase().trim();
      const correctAnswer = currentQuestion.correct_answer.toLowerCase().trim();
      isCorrect = userAnswer === correctAnswer;
    } else {
      // For multiple choice, exact match
      isCorrect = selectedAnswer === currentQuestion.correct_answer;
    }
    
    const newAnswers = [...answers, {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      correct: isCorrect
    }];
    
    setAnswers(newAnswers);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + getDifficultyPoints(currentQuestion.difficulty));
    }

    // Update progress for sentence-based questions
    if (currentQuestion.english_text) {
      updateProgress(currentQuestion.id, isCorrect ? 'mastered' : 'learning', isCorrect);
    }

    setShowResult(true);

    // Show feedback
    toast({
      title: isCorrect ? "Correto! 🎉" : "Quase lá! 💪",
      description: isCorrect ? "Excelente resposta!" : `Resposta correta: ${currentQuestion.correct_answer}`,
      variant: isCorrect ? "default" : "destructive",
    });

    // Auto advance after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
      if (timeLimit) {
        setTimeLeft(timeLimit);
      }
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    onComplete(score, correctAnswers);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setCorrectAnswers(0);
    setAnswers([]);
    setQuizStarted(false);
    setTimeLeft(timeLimit || 0);
  };

  const getDifficultyPoints = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 10;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playAudio = () => {
    // Audio functionality removed
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option 
        ? 'border-primary bg-primary/10 text-primary' 
        : 'border-border hover:border-primary/50 hover:bg-accent/50';
    }

    if (option === currentQuestion.correct_answer) {
      return 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
    }
    
    if (option === selectedAnswer && option !== currentQuestion.correct_answer) {
      return 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
    }
    
    return 'border-border opacity-60';
  };

  // Start screen
  if (!quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-center gap-2 p-4 bg-accent/20 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
                <div className="text-center">
                  <p className="font-semibold">{questions.length}</p>
                  <p className="text-sm text-muted-foreground">Perguntas</p>
                </div>
              </div>
              
              {timeLimit && (
                <div className="flex items-center justify-center gap-2 p-4 bg-accent/20 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold">{formatTime(timeLimit)}</p>
                    <p className="text-sm text-muted-foreground">Por pergunta</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 p-4 bg-accent/20 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
                <div className="text-center">
                  <p className="font-semibold">Pontos</p>
                  <p className="text-sm text-muted-foreground">Baseado na dificuldade</p>
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground">
              Teste seus conhecimentos de inglês com este quiz interativo!
            </p>
          </div>
          
          <Button onClick={startQuiz} className="w-full h-12 text-lg">
            Começar Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Quiz completed screen
  if (currentQuestionIndex >= questions.length) {
    const scorePercentage = (correctAnswers / questions.length) * 100;
    
    return (
      <Card className="max-w-2xl mx-auto shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-primary" />
            Quiz Concluído!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="p-6 bg-gradient-primary rounded-lg text-white">
              <h3 className="text-3xl font-bold">{scorePercentage.toFixed(0)}%</h3>
              <p className="text-lg opacity-90">
                {correctAnswers} de {questions.length} corretas
              </p>
              <p className="text-sm opacity-75">
                {score} pontos totais
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-800 dark:text-green-200">Acertos</p>
                <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
              </div>
              
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <X className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="font-semibold text-red-800 dark:text-red-200">Erros</p>
                <p className="text-2xl font-bold text-red-600">{questions.length - correctAnswers}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={restartQuiz} variant="outline" className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              Refazer Quiz
            </Button>
            <Button onClick={() => finishQuiz()} className="flex-1">
              Finalizar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>Pergunta {currentQuestionIndex + 1} de {questions.length}</span>
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {currentQuestion.difficulty === 'easy' ? 'Fácil' : 
               currentQuestion.difficulty === 'medium' ? 'Médio' : 'Difícil'}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-4">
            {timeLimit && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={timeLeft <= 10 ? 'text-red-500 font-bold' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            
            {currentQuestion.english_text && (
              <Button variant="ghost" size="sm" onClick={playAudio} disabled={true}>
                <Volume2 className="w-4 h-4 opacity-50" />
              </Button>
            )}
          </div>
        </div>
        
        <Progress value={progress} className="w-full h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center py-4">
          <h3 className="text-xl font-semibold mb-2">{currentQuestion.question}</h3>
          {currentQuestion.portuguese_text && (
            <p className="text-muted-foreground mb-2">Traduza: "{currentQuestion.portuguese_text}"</p>
          )}
          {currentQuestion.category && (
            <Badge variant="secondary">{currentQuestion.category}</Badge>
          )}
        </div>

        <div className="space-y-3">
          {currentQuestion.type === 'translation' ? (
            <div className="space-y-4">
              <div className="w-full">
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={showResult}
                  placeholder="Digite sua resposta em inglês..."
                  className="w-full p-4 text-lg border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>
          ) : (
            currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${getOptionStyle(option)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{option}</span>
                  {showResult && option === currentQuestion.correct_answer && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {showResult && option === selectedAnswer && option !== currentQuestion.correct_answer && (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {!showResult && (
          <Button 
            onClick={submitAnswer} 
            disabled={!selectedAnswer}
            className="w-full h-12 text-lg"
          >
            Confirmar Resposta
          </Button>
        )}

        {showResult && (
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              {selectedAnswer === currentQuestion.correct_answer 
                ? "🎉 Parabéns! Resposta correta!" 
                : `❌ Resposta correta: ${currentQuestion.correct_answer}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};