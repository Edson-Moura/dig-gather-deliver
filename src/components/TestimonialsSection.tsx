import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Maria Silva",
    location: "São Paulo, SP",
    level: "Intermediário",
    rating: 5,
    text: "O MyEnglishOne transformou minha forma de aprender inglês. Em apenas 3 meses consegui melhorar significativamente minha conversação!",
    progress: "Avançou 2 níveis em 3 meses"
  },
  {
    id: 2,
    name: "João Santos",
    location: "Rio de Janeiro, RJ",
    level: "Avançado",
    rating: 5,
    text: "As lições diárias são perfeitas para minha rotina. Consigo praticar no metrô, no almoço... em qualquer lugar!",
    progress: "Mantém streak de 120 dias"
  },
  {
    id: 3,
    name: "Ana Costa",
    location: "Belo Horizonte, MG",
    level: "Básico",
    rating: 5,
    text: "Nunca pensei que aprender inglês pudesse ser tão divertido. Os exercícios são envolventes e o progresso é visível.",
    progress: "De iniciante a básico em 2 meses"
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    location: "Porto Alegre, RS",
    level: "Intermediário",
    rating: 5,
    text: "O sistema de conquistas me motiva todos os dias. É como um jogo onde você aprende inglês de verdade!",
    progress: "15 conquistas desbloqueadas"
  }
];

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < rating ? "fill-orange text-orange" : "text-muted-foreground"
      }`}
    />
  ));
};

export const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos alunos dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Milhares de estudantes já transformaram seu inglês com o MyEnglishOne. 
            Veja alguns depoimentos reais de quem conquistou a fluência.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative overflow-hidden hover-scale">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                    <p className="text-xs text-primary font-medium mt-1">
                      {testimonial.progress}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {testimonial.level}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-8 text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10.000+</div>
              <div className="text-sm">Alunos ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4.9/5</div>
              <div className="text-sm">Avaliação média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">95%</div>
              <div className="text-sm">Taxa de satisfação</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};