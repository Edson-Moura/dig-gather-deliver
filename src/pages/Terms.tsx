import { Header } from "@/components/Header";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-4xl font-bold text-foreground mb-8">Termos de Uso</h1>
          
          <p className="text-sm text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e usar a plataforma MyEnglishOne, você concorda em cumprir e estar 
              sujeito aos seguintes termos e condições de uso. Se você não concordar com 
              qualquer parte destes termos, não deve usar nosso serviço.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              A MyEnglishOne é uma plataforma online de ensino de inglês que oferece:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Lições interativas de inglês</li>
              <li>Exercícios de pronúncia e compreensão</li>
              <li>Chat com inteligência artificial</li>
              <li>Quizzes e avaliações</li>
              <li>Sistema de progresso e conquistas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Cadastro e Conta do Usuário</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para usar alguns recursos da plataforma, você deve criar uma conta fornecendo 
              informações precisas e atualizadas. Você é responsável por manter a 
              confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Uso Permitido</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você pode usar a MyEnglishOne apenas para fins legais e de acordo com estes 
              termos. É proibido:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Usar o serviço para qualquer finalidade ilegal ou não autorizada</li>
              <li>Interferir ou interromper o serviço ou servidores</li>
              <li>Tentar obter acesso não autorizado a qualquer parte do serviço</li>
              <li>Reproduzir, duplicar ou copiar qualquer parte do serviço sem autorização</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo da MyEnglishOne, incluindo textos, gráficos, logos, ícones,
              imagens, clipes de áudio e software, é propriedade da MyEnglishOne ou de seus
              licenciadores e está protegido por leis de direitos autorais.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Assinaturas e Pagamentos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Alguns recursos da plataforma podem exigir assinatura paga. Os preços e 
              termos de pagamento são apresentados claramente antes da compra. As assinaturas 
              são renovadas automaticamente, salvo cancelamento prévio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              A MyEnglishOne não será responsável por quaisquer danos diretos, indiretos, 
              incidentais, especiais ou consequenciais resultantes do uso ou incapacidade 
              de usar o serviço.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Modificações dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. 
              As alterações entrarão em vigor imediatamente após a publicação. 
              O uso continuado do serviço após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões sobre estes termos, entre em contato conosco através do email 
              <a href="mailto:legal@inglesnow.com" className="text-primary hover:underline">
              legal@inglesnow.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;