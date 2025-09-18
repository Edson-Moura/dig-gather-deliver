import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, Phone, User, LogOut, Settings, BookOpen, Home, BarChart3, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Link } from "react-router-dom";
import { FeedbackWidget } from "@/components/FeedbackWidget";
// import fluentTalkLogo from "@/assets/fluenttalk-logo.png";

export const Header = () => {
  const { user, signOut, loading } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-3 md:px-4 lg:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
          <img 
            src="/lovable-uploads/e26470cf-d11b-4647-83f6-c61857d5de8d.png"
            alt="MyEnglishOne Logo" 
            className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0"
          />
          <span className="text-sm md:text-lg lg:text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            <span className="hidden lg:inline">MyEnglishOne</span>
            <span className="lg:hidden">MyEnglish</span>
          </span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-smooth">
                Dashboard
              </Link>
              <Link to="/lessons" className="text-muted-foreground hover:text-foreground transition-smooth">
                Lições
              </Link>
              <Link to="/chat" className="text-muted-foreground hover:text-foreground transition-smooth">
                Chat IA
              </Link>
              <Link to="/quiz" className="text-muted-foreground hover:text-foreground transition-smooth">
                Quiz
              </Link>
            </>
          ) : (
            <>
              <Link to="/?scrollTo=features" className="text-muted-foreground hover:text-foreground transition-smooth">
                Funcionalidades
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-smooth">
                Preços
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-smooth">
                Sobre
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
          {/* Tablet Navigation */}
          <nav className="hidden md:flex lg:hidden items-center gap-3">
            {!user && (
              <>
                <Link to="/?scrollTo=features" className="text-xs text-muted-foreground hover:text-foreground transition-smooth">
                  Funcionalidades
                </Link>
                <Link to="/pricing" className="text-xs text-muted-foreground hover:text-foreground transition-smooth">
                  Preços
                </Link>
              </>
            )}
          </nav>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2 md:px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
            asChild
          >
            <a 
              href="https://w.app/myenglishone" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 md:gap-2"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden md:inline text-sm">WhatsApp</span>
            </a>
          </Button>
          
          <FeedbackWidget 
            trigger={
              <Button variant="ghost" size="sm" className="px-2 md:px-3">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Feedback</span>
              </Button>
            }
          />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} alt="Avatar do usuário" />
                    <AvatarFallback className="bg-gradient-primary text-white text-sm">
                      {profile?.display_name ? profile.display_name[0].toUpperCase() : getUserInitials(user.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {profile?.display_name || user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Estudante MyEnglishOne
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/lessons">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Lições</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/achievements">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Conquistas</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/quiz">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Quiz</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                  disabled={loading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-xs md:text-sm px-2 md:px-3" asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button variant="hero" size="sm" className="text-xs md:text-sm px-2 md:px-3" asChild>
                <Link to="/auth">
                  <span className="hidden sm:inline">Começar Grátis</span>
                  <span className="sm:hidden">Grátis</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};