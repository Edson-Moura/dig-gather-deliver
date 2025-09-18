import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "How ___ you today?",
    options: ["are", "is", "am", "be"],
    correct: 0,
    level: "Básico"
  },
  {
    id: 2,
    question: "I ___ to the store yesterday.",
    options: ["go", "went", "going", "will go"],
    correct: 1,
    level: "Básico"
  },
  {
    id: 3,
    question: "She has been ___ here for three years.",
    options: ["work", "working", "worked", "works"],
    correct: 1,
    level: "Intermediário"
  },
  {
    id: 4,
    question: "If I ___ rich, I would travel the world.",
    options: ["am", "was", "were", "be"],
    correct: 2,
    level: "Intermediário"
  },
  {
    id: 5,
    question: "The project ___ by the end of next month.",
    options: ["will complete", "will be completed", "completes", "completing"],
    correct: 1,
    level: "Avançado"
  }
];

const levelDescriptions = {
  "Básico": {
    title: "Nível Básico",
    description: "Você tem conhecimentos fundamentais de inglês. Nosso curso básico é perfeito para você!",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200"
  },
  "Intermediário": {
    title: "Nível Intermediário", 
    description: "Você já tem uma boa base! Nosso curso intermediário vai elevar suas habilidades.",
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200"
  },
  "Avançado": {
    title: "Nível Avançado",
    description: "Excelente! Você tem conhecimento avançado. Nosso curso vai te levar à fluência.",
    color: "text-primary",
    bgColor: "bg-primary/5 border-primary/20"
  }
};

export const QuickAssessmentSection = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [started, setStarted] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers, answerIndex];
    setSelectedAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 500);
    } else {
      setTimeout(() => {
        setShowResults(true);
      }, 500);
    }
  };

  const calculateLevel = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correct++;
      }
    });

    if (correct <= 2) return "Básico";
    if (correct <= 4) return "Intermediário";
    return "Avançado";
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setStarted(false);
  };

  const progress = ((currentQuestion + (selectedAnswers.length > currentQuestion ? 1 : 0)) / questions.length) * 100;

  if (!started) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Descubra seu nível de inglês
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Faça nosso teste rápido de 5 perguntas e descubra qual curso é ideal para você. 
              Leva apenas 2 minutos!
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span>2 minutos</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="w-5 h-5 text-primary" />
                <span>+50.000 testes realizados</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Resultado personalizado</span>
              </div>
            </div>

            <Button 
              onClick={() => setStarted(true)}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white px-8"
            >
              Iniciar Teste de Nível
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (showResults) {
    const level = calculateLevel();
    const levelInfo = levelDescriptions[level as keyof typeof levelDescriptions];
    const correct = questions.filter((q, index) => selectedAnswers[index] === q.correct).length;

    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className={`${levelInfo.bgColor} border-2`}>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">
                  Parabéns! Teste concluído
                </CardTitle>
                <p className="text-muted-foreground">
                  Você acertou {correct} de {questions.length} perguntas
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className={`text-xl font-bold mb-2 ${levelInfo.color}`}>
                  {levelInfo.title}
                </div>
                <p className="text-muted-foreground mb-6">
                  {levelInfo.description}
                </p>
                
                <div className="space-y-3 mb-6">
                  <Button 
                    asChild
                    className="w-full bg-gradient-primary hover:opacity-90 text-white"
                  >
                    <a href="/auth">
                      Começar Agora - Grátis
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetQuiz}
                    className="w-full"
                  >
                    Refazer Teste
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Crie sua conta gratuita e comece a aprender no seu nível ideal
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const question = questions[currentQuestion];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Pergunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left justify-start p-4 h-auto hover:bg-primary/5 hover:border-primary transition-smooth"
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswers[currentQuestion] !== undefined}
                  >
                    <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center mr-3 text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};