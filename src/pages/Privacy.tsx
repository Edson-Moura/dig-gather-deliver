import { Header } from "@/components/Header";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidade</h1>
          
          <p className="text-sm text-muted-foreground mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              A MyEnglishOne valoriza sua privacidade e está comprometida em proteger suas 
              informações pessoais. Esta política explica como coletamos, usamos e 
              protegemos seus dados quando você usa nossa plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Informações que Coletamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coletamos as seguintes informações:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li><strong>Informações de cadastro:</strong> Nome, email, senha</li>
              <li><strong>Dados de progresso:</strong> Lições completadas, pontuações, conquistas</li>
              <li><strong>Informações de uso:</strong> Páginas visitadas, tempo de uso, preferências</li>
              <li><strong>Dados de áudio:</strong> Gravações de voz para exercícios de pronúncia</li>
              <li><strong>Informações técnicas:</strong> Endereço IP, tipo de navegador, dispositivo usado</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Como Usamos suas Informações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usamos suas informações para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Fornecer e personalizar nossos serviços educacionais</li>
              <li>Acompanhar seu progresso e fornecer feedback</li>
              <li>Melhorar nossa plataforma e desenvolver novos recursos</li>
              <li>Comunicar atualizações e ofertas relevantes</li>
              <li>Processar pagamentos e gerenciar assinaturas</li>
              <li>Fornecer suporte ao cliente</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Compartilhamento de Informações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros, 
              exceto:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Com provedores de serviços confiáveis que nos ajudam a operar a plataforma</li>
              <li>Quando exigido por lei ou processo legal</li>
              <li>Para proteger nossos direitos, propriedade ou segurança</li>
              <li>Com seu consentimento explícito</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Segurança dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais apropriadas 
              para proteger suas informações contra acesso não autorizado, alteração, 
              divulgação ou destruição. Isso inclui:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso rigorosos</li>
              <li>Monitoramento regular de segurança</li>
              <li>Backups seguros e regulares</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você tem o direito de:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir dados imprecisos ou incompletos</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Retirar o consentimento para processamento</li>
              <li>Portabilidade de dados</li>
              <li>Apresentar reclamações às autoridades competentes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies e Tecnologias Similares</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usamos cookies e tecnologias similares para melhorar sua experiência, 
              analisar o uso da plataforma e personalizar conteúdo. Você pode controlar 
              o uso de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantemos suas informações pessoais apenas pelo tempo necessário para 
              cumprir os propósitos descritos nesta política, salvo quando um período 
              de retenção mais longo for exigido por lei.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta política periodicamente. Notificaremos sobre 
              mudanças significativas através da plataforma ou por email. O uso 
              continuado após as alterações constitui aceitação da nova política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões sobre privacidade ou para exercer seus direitos, entre em 
              contato conosco através do email{" "}
              <a href="mailto:privacidade@inglesnow.com" className="text-primary hover:underline">
                privacidade@inglesnow.com
              </a>{" "}
              ou pelo endereço: Rua das Tecnologias, 123 - São Paulo, SP - CEP: 01234-567.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;