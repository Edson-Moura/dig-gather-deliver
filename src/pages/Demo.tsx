import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, MessageCircle, BookOpen, Target, Award, Volume2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Demo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const demoSteps = [
    {
      title: "Lições Diárias Personalizadas",
      description: "Aprenda 5 frases úteis todos os dias com conteúdo adaptado ao seu nível",
      icon: BookOpen,
      demo: (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Frase do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="font-medium">"How are you doing today?"</p>
              <p className="text-sm text-muted-foreground mt-2">Como você está hoje?</p>
            </div>
            <Button className="w-full" variant="outline">
              <Volume2 className="w-4 h-4 mr-2" />
              Ouvir Pronúncia
            </Button>
          </CardContent>
        </Card>
      )
    },
    {
      title: "Chat Inteligente com IA",
      description: "Pratique conversação natural com nossa IA especializada em ensino de inglês",
      icon: MessageCircle,
      demo: (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-secondary" />
              Assistente IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">Hello! How can I help you practice English today?</p>
              </div>
              <div className="bg-primary p-3 rounded-lg ml-8">
                <p className="text-sm text-white">I want to practice ordering food</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">Great! Let's practice. I'll be the waiter. What would you like to order?</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      title: "Sistema de Gamificação",
      description: "Mantenha sua motivação alta com conquistas, níveis e recompensas",
      icon: Award,
      demo: (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Suas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-medium">Primeira Semana</p>
                <p className="text-sm text-muted-foreground">Completou 7 dias consecutivos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Target className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-muted-foreground">Conversador</p>
                <p className="text-sm text-muted-foreground">Tenha 50 conversas com IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold">
            Veja Como{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Funciona
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra como nossa plataforma revoluciona o aprendizado de inglês através de tecnologia avançada e gamificação.
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
            {/* Demo Navigation */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Principais Funcionalidades</h2>
              {demoSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-card ${
                      currentStep === index 
                        ? 'border-primary shadow-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-primary" />
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Demo Display */}
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-fade-in">
                {demoSteps[currentStep].demo}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">5.000+</div>
              <div className="text-muted-foreground">Estudantes Ativos</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-secondary mb-2">94%</div>
              <div className="text-muted-foreground">Taxa de Sucesso</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-accent mb-2">30 dias</div>
              <div className="text-muted-foreground">Fluência Média</div>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-6 py-12">
            <h2 className="text-3xl font-bold">
              Pronto para Começar sua{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Jornada?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Junte-se a milhares de estudantes que já estão transformando seu inglês com nossa plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8" asChild>
                <Link to="/auth">
                  <Play className="w-5 h-5 mr-2" />
                  Começar Agora - Grátis
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                <Link to="/pricing">
                  Ver Planos
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;