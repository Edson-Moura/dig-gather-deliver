import { Header } from "@/components/Header";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-4xl font-bold text-foreground mb-8">Sobre Nós</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Nossa Missão</h2>
            <p className="text-muted-foreground leading-relaxed">
              Na MyEnglishOne, nossa missão é tornar o aprendizado de inglês acessível, 
              eficiente e divertido para todos. Acreditamos que dominar um novo idioma 
              não deve ser uma tarefa árdua, mas sim uma jornada prazerosa e recompensadora.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Nossa História</h2>
            <p className="text-muted-foreground leading-relaxed">
              Fundada por educadores apaixonados por tecnologia, a MyEnglishOne nasceu da 
              necessidade de revolucionar o ensino de idiomas. Combinamos metodologias 
              pedagógicas comprovadas com tecnologia de ponta, incluindo inteligência 
              artificial, para criar uma experiência de aprendizado única e personalizada.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Nossa Abordagem</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos uma abordagem inovadora que combina:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Lições interativas adaptadas ao seu nível</li>
              <li>Inteligência artificial para feedback personalizado</li>
              <li>Exercícios de pronúncia com reconhecimento de voz</li>
              <li>Chat inteligente para prática conversacional</li>
              <li>Sistema de gamificação para manter você motivado</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Nossos Valores</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Excelência</h3>
                <p className="text-muted-foreground">
                  Comprometemo-nos a fornecer conteúdo de alta qualidade e uma 
                  experiência de aprendizado excepcional.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Inovação</h3>
                <p className="text-muted-foreground">
                  Sempre buscamos as mais recentes tecnologias para melhorar 
                  o processo de aprendizagem.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Inclusão</h3>
                <p className="text-muted-foreground">
                  Acreditamos que todos devem ter acesso a educação de qualidade, 
                  independentemente de sua origem ou situação.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Transparência</h3>
                <p className="text-muted-foreground">
                  Mantemos comunicação clara e honesta com nossos usuários 
                  sobre nossos métodos e progresso.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Entre em Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tem alguma dúvida ou sugestão? Entre em contato conosco através do 
              email <a href="mailto:contato@myenglishone.com" className="text-primary hover:underline">
              contato@myenglishone.com</a> ou através de nossas redes sociais.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;