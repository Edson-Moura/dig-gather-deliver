import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { Feedback } from '@/components/ui/feedback';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminEbookUpload from '@/components/AdminEbookUpload';

const EbookLeadSection = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
const { toast } = useToast();
  const isAdmin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('admin') === '1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    let duplicate = false;
    
    try {
      // Save lead to database
      const { error: leadError } = await supabase
        .from('ebook_leads')
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
        });

      if (leadError) {
        // Tratar qualquer erro de conflito como duplicado e prosseguir com reenvio
        const msg = `${leadError.code || ''} ${leadError.message || ''} ${leadError.details || ''}`.toLowerCase();
        const isConflict = leadError.code === '23505' || msg.includes('duplicate') || msg.includes('already exists') || msg.includes('conflict') || leadError.code === '409';
        if (isConflict) {
          duplicate = true;
          console.log('Lead já existente, reenviando ebook. Erro:', leadError);
        } else {
          throw leadError;
        }
      }

      // Call edge function to send ebook
      console.log('Calling send-ebook function with:', { email: email.trim(), name: name.trim() });
      const { data, error: emailError } = await supabase.functions.invoke('send-ebook', {
        body: { email: email.trim(), name: name.trim() }
      });

      console.log('Send-ebook response:', { data, error: emailError });

      if (emailError) {
        console.error('Error sending ebook:', emailError);
        toast({
          title: "Erro no envio",
          description: "Houve um problema ao enviar o ebook. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: duplicate ? "Ebook reenviado" : "Sucesso!",
        description: duplicate
          ? "Reenviamos o ebook para seu email."
          : "Ebook enviado para seu email. Verifique sua caixa de entrada.",
      });
      
      // Reset form
      setEmail('');
      setName('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="py-16 px-4 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="shadow-elegant border-primary/20">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Ebook Enviado com Sucesso!</h3>
              <p className="text-muted-foreground mb-6">
                Verifique sua caixa de entrada (e spam) para baixar seu guia gratuito de inglês.
              </p>
              <Button 
                onClick={() => setIsSuccess(false)}
                variant="outline"
              >
                Cadastrar outro email
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-section-neutral" id="ebook">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            10 Erros Comuns de Aprendizado de Inglês e Como Evitá-los
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Melhore seu inglês de forma rápida e eficiente ao evitar esses erros comuns.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary-foreground font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Não Praticar a Pronúncia Correta</h3>
                <p className="text-muted-foreground">
                  Muitos estudantes ignoram a pronúncia ao aprenderem novas palavras
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary-foreground font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Focar Apenas em Gramática</h3>
                <p className="text-muted-foreground">
                  Balanceie o estudo da gramática com atividades práticas de conversação
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary-foreground font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Traduzir Diretamente do Português</h3>
                <p className="text-muted-foreground">
                  Traduzir palavra por palavra pode levar a construções gramaticais incorretas
                </p>
              </div>
            </div>
          </div>

          <Card className="shadow-elegant border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Baixe Gratuitamente</CardTitle>
              <CardDescription>
                Digite seus dados para receber o ebook instantaneamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome (opcional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Como você gostaria de ser chamado?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Ebook Gratuito
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Seus dados estão protegidos. Não enviamos spam.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green" />
              Mais de 10.000 downloads
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green" />
              Conteúdo atualizado 2024
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green" />
              100% gratuito
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EbookLeadSection;