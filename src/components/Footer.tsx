import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
// import fluentTalkLogo from "@/assets/fluenttalk-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/lovable-uploads/e26470cf-d11b-4647-83f6-c61857d5de8d.png"
                alt="MyEnglishOne Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                MyEnglishOne
              </span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Aprenda inglês de forma inteligente e divertida com nossa plataforma 
              inovadora que combina IA, gamificação e metodologias pedagógicas avançadas.
            </p>
          </div>

          {/* Links úteis */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link 
                  to="/pricing" 
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Preços
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Links legais */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Política de privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MyEnglishOne. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Feito com ❤️ para estudantes de inglês
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};