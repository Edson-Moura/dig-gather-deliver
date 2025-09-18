import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Bug, Lightbulb, Star, Send } from "lucide-react";
import { Feedback } from "@/components/ui/feedback";

interface FeedbackWidgetProps {
  trigger?: React.ReactNode;
  defaultType?: string;
  className?: string;
}

const FeedbackWidget = ({ 
  trigger, 
  defaultType = "general",
  className = ""
}: FeedbackWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: defaultType,
    message: "",
    email: "",
    rating: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: "" });
  const { toast } = useToast();

  const feedbackTypes = [
    { value: "general", label: "Feedback Geral", icon: MessageSquare },
    { value: "bug", label: "Reportar Bug", icon: Bug },
    { value: "feature", label: "Sugerir Funcionalidade", icon: Lightbulb },
    { value: "rating", label: "Avaliação", icon: Star }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const subject = `${feedbackTypes.find(t => t.value === formData.type)?.label || 'Feedback'}: ${formData.type === 'rating' ? `Avaliação ${formData.rating}/5` : 'Mensagem do usuário'}`;
      
      const message = formData.type === 'rating' 
        ? `Avaliação: ${formData.rating}/5 estrelas\n\nComentário: ${formData.message || 'Nenhum comentário adicional'}`
        : formData.message;

      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.email ? 'Usuário' : 'Usuário Anônimo',
          email: formData.email || 'feedback@myenglishone.com',
          subject: subject,
          message: message,
          feedback_type: formData.type
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSubmitStatus({
        type: 'success',
        message: 'Feedback enviado com sucesso! Obrigado pela sua contribuição.'
      });
      
      toast({
        title: "Feedback enviado!",
        description: "Obrigado pelo seu feedback. Sua opinião é muito importante para nós!",
      });
      
      setFormData({ type: defaultType, message: "", email: "", rating: "" });
      
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus({ type: null, message: "" });
      }, 2000);

    } catch (error: any) {
      console.error("Error sending feedback:", error);
      setSubmitStatus({
        type: 'error',
        message: error.message || "Erro ao enviar feedback. Tente novamente."
      });
      
      toast({
        title: "Erro ao enviar feedback",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={className}>
      <MessageSquare className="w-4 h-4 mr-2" />
      Feedback
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Compartilhe sua experiência, reporte bugs ou sugira melhorias.
          </DialogDescription>
        </DialogHeader>

        {submitStatus.type && (
          <Feedback
            type={submitStatus.type}
            message={submitStatus.message}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Tipo de feedback</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'rating' && (
            <div className="space-y-2">
              <Label htmlFor="rating">Avaliação</Label>
              <Select
                value={formData.rating}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma nota de 1 a 5" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                        <span>{rating} estrela{rating > 1 ? 's' : ''}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">
              {formData.type === 'rating' ? 'Comentário (opcional)' : 'Mensagem'}
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={
                formData.type === 'bug' 
                  ? "Descreva o problema que encontrou..."
                  : formData.type === 'feature'
                  ? "Descreva a funcionalidade que gostaria de ver..."
                  : formData.type === 'rating'
                  ? "Deixe um comentário sobre sua experiência..."
                  : "Compartilhe seu feedback..."
              }
              className="min-h-[100px]"
              required={formData.type !== 'rating'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="seu@email.com"
            />
            <p className="text-xs text-muted-foreground">
              Deixe seu email se quiser receber uma resposta
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (formData.type !== 'rating' && !formData.message.trim()) || (formData.type === 'rating' && !formData.rating)}
              className="flex-1"
            >
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { FeedbackWidget };