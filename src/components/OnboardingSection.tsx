import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, User, GraduationCap, Target as TargetIcon, CheckCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const levels = [
  { value: "beginner", label: "Iniciante", description: "Palavras básicas e frases simples" },
  { value: "intermediate", label: "Intermediário", description: "Conversas cotidianas e gramática" },
  { value: "advanced", label: "Avançado", description: "Fluência e expressões complexas" }
];

const objectives = [
  { value: "travel", label: "Viagem", description: "Comunicação em hotéis, restaurantes e turismo" },
  { value: "work", label: "Trabalho", description: "Reuniões, apresentações e e-mails profissionais" },
  { value: "conversation", label: "Conversação", description: "Falar naturalmente no dia a dia" },
  { value: "interview", label: "Entrevista", description: "Preparação para entrevistas de emprego" }
];

export const OnboardingSection = () => {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    objective: ""
  });

  // Atualiza o progresso quando o passo muda
  useEffect(() => {
    const newProgress = ((step - 1) / 2) * 100;
    setProgressValue(newProgress);
  }, [step]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      // Se não está logado, redireciona para página de auth
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Salva os dados do onboarding no perfil do usuário
      await updateProfile({
        display_name: formData.name,
        level: formData.level,
        // Adiciona o objetivo como um campo customizado por enquanto
      });

      // Mostra celebração
      setShowCelebration(true);
      
      setTimeout(() => {
        toast({
          title: "🎉 Onboarding concluído!",
          description: "Seus dados foram salvos. Bem-vindo ao seu curso personalizado!",
        });

        // Redireciona para o dashboard
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Simple Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 z-50 flex items-center justify-center animate-fade-in">
          <div className="text-center space-y-4 animate-scale-in">
            <div className="text-8xl animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg animate-fade-in">
              Parabéns!
            </h2>
            <p className="text-xl text-white/90 drop-shadow animate-fade-in">
              Sua jornada de aprendizado está começando!
            </p>
          </div>
          {/* Simple confetti effect */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}
      
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center space-y-4 mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold">
              Vamos{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Personalizar
              </span>{" "}
              sua Jornada
            </h2>
            <p className="text-xl text-muted-foreground">
              Em apenas 3 passos, vamos criar um plano de estudos perfeito para você.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Progresso
              </span>
              <span className="text-sm font-medium text-primary">
                {step}/3 passos
              </span>
            </div>
            <Progress value={progressValue} className="h-3" />
          </div>

          <Card className={`shadow-elevated border-2 transition-all duration-500 ${
            step === 1 ? 'border-blue-200 bg-blue-50/50' :
            step === 2 ? 'border-green-200 bg-green-50/50' :
            'border-purple-200 bg-purple-50/50'
          } animate-scale-in`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 animate-fade-in">
                  <div className="relative">
                    {step === 1 && <User className="w-6 h-6 text-blue-600" />}
                    {step === 2 && <GraduationCap className="w-6 h-6 text-green-600" />}
                    {step === 3 && <TargetIcon className="w-6 h-6 text-purple-600" />}
                    {step > 1 && (
                      <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-500 animate-scale-in" />
                    )}
                  </div>
                  
                  <div>
                    {step === 1 && "Qual é o seu nome?"}
                    {step === 2 && "Qual é o seu nível atual?"}
                    {step === 3 && "Qual é o seu objetivo?"}
                  </div>
                </CardTitle>
                <Badge variant="outline" className="animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Passo {step}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <Label htmlFor="name" className="text-base flex items-center gap-2">
                    <span>Como devemos te chamar?</span>
                    <span className="text-blue-600">✨</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="Digite seu nome aqui..."
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="text-lg p-4 h-14 border-2 focus:border-blue-400 transition-all duration-300"
                    />
                    {formData.name && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500 animate-scale-in" />
                    )}
                  </div>
                  {formData.name && (
                    <p className="text-sm text-green-600 animate-fade-in">
                      Perfeito, {formData.name}! 🎉
                    </p>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <Label className="text-base flex items-center gap-2">
                    <span>Selecione seu nível atual de inglês:</span>
                    <span className="text-green-600">📚</span>
                  </Label>
                  <RadioGroup
                    value={formData.level}
                    onValueChange={(value) => setFormData({...formData, level: value})}
                    className="space-y-3"
                  >
                    {levels.map((level, index) => (
                      <Card 
                        key={level.value} 
                        className={`hover:border-green-400 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                          formData.level === level.value ? 'border-green-500 bg-green-50/50 shadow-md' : ''
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={level.value} id={level.value} />
                            <div className="flex-1">
                              <Label htmlFor={level.value} className="text-base font-semibold cursor-pointer flex items-center gap-2">
                                {level.label}
                                {formData.level === level.value && <CheckCircle className="w-4 h-4 text-green-500" />}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {level.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <Label className="text-base flex items-center gap-2">
                    <span>Qual é seu principal objetivo com o inglês?</span>
                    <span className="text-purple-600">🎯</span>
                  </Label>
                  <RadioGroup
                    value={formData.objective}
                    onValueChange={(value) => setFormData({...formData, objective: value})}
                    className="space-y-3"
                  >
                    {objectives.map((objective, index) => (
                      <Card 
                        key={objective.value} 
                        className={`hover:border-purple-400 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                          formData.objective === objective.value ? 'border-purple-500 bg-purple-50/50 shadow-md' : ''
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={objective.value} id={objective.value} />
                            <div className="flex-1">
                              <Label htmlFor={objective.value} className="text-base font-semibold cursor-pointer flex items-center gap-2">
                                {objective.label}
                                {formData.objective === objective.value && <CheckCircle className="w-4 h-4 text-purple-500" />}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {objective.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                  {formData.objective && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200 animate-fade-in">
                      <p className="text-sm text-purple-800">
                        🚀 Excelente escolha! Vamos criar um plano personalizado para {objectives.find(obj => obj.value === formData.objective)?.label.toLowerCase()}.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Voltar
                  </Button>
                )}
                
                <div className="ml-auto">
                  {step < 3 ? (
                    <Button 
                      variant="hero" 
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !formData.name) ||
                        (step === 2 && !formData.level)
                      }
                      className="hover:scale-105 transition-all duration-200 disabled:hover:scale-100"
                    >
                      Próximo
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      variant="hero" 
                      onClick={handleSubmit}
                      disabled={!formData.objective || loading}
                      className="hover:scale-105 transition-all duration-200 disabled:hover:scale-100 relative overflow-hidden"
                    >
                      <span className={loading ? "animate-pulse" : ""}>
                        {loading ? "✨ Criando sua jornada..." : "🚀 Começar Jornada"}
                      </span>
                      {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                    </Button>
                  )}
                </div>
              </div>

              {/* Preview do próximo passo */}
              {step < 3 && (
                <div className="mt-6 p-3 bg-muted/30 rounded-lg text-center animate-fade-in">
                  <p className="text-xs text-muted-foreground">
                    Próximo: {step === 1 ? "📚 Seu nível de inglês" : "🎯 Seu objetivo de aprendizado"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};