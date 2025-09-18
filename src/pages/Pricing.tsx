import { Header } from "@/components/Header";
import { PricingSection } from "@/components/PricingSection";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-6xl font-bold">
            Escolha Seu{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Plano
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Desbloqueie todo o potencial do seu aprendizado de inglês com nossos planos premium.
          </p>
        </div>
        <PricingSection />
      </main>
    </div>
  );
};

export default Pricing;