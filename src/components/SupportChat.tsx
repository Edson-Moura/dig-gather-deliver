import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, Bot, User, Clock } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface SupportChatProps {
  trigger?: React.ReactNode;
  className?: string;
}

const SupportChat = ({ trigger, className = "" }: SupportChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! 👋 Bem-vindo ao suporte do MyEnglishOne. Como posso ajudá-lo hoje?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const commonQuestions = [
    "Como funciona o sistema de lições?",
    "Como posso acompanhar meu progresso?",
    "Problemas com áudio",
    "Como cancelar assinatura?",
    "Suporte técnico"
  ];

  const autoResponses: { [key: string]: string } = {
    "Como funciona o sistema de lições?": "O sistema de lições é progressivo - você desbloqueia novas lições conforme completa as anteriores. Complete pelo menos 3 lições de um nível para desbloquear o próximo!",
    "Como posso acompanhar meu progresso?": "Você pode ver seu progresso na página Dashboard, onde mostra suas estatísticas, streak e conquistas alcançadas.",
    "Problemas com áudio": "Se está tendo problemas com áudio, verifique se o microfone está permitido no navegador e se o volume está adequado. Tente recarregar a página se o problema persistir.",
    "Como cancelar assinatura?": "Para cancelar sua assinatura, vá em Configurações > Assinatura e clique em 'Gerenciar Assinatura'. Você será redirecionado para o portal do cliente.",
    "Suporte técnico": "Para problemas técnicos específicos, por favor use o formulário de feedback para descrever detalhadamente o problema. Nossa equipe responderá em até 24 horas."
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = autoResponses[content] || 
        "Obrigado pela sua mensagem! Para um atendimento mais personalizado, por favor use nosso formulário de contato e nossa equipe responderá em breve.";
      
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const defaultTrigger = (
    <Button
      variant="secondary"
      size="sm"
      className={`fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 shadow-lg ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md sm:max-h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Chat de Suporte
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green rounded-full"></div>
              <span>Suporte automático ativo</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={message.sender === 'user' ? 'bg-primary/10' : 'bg-secondary/10'}>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[80%] ${message.sender === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-secondary/10">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Perguntas frequentes:</p>
              <div className="flex flex-wrap gap-2">
                {commonQuestions.map((question) => (
                  <Badge
                    key={question}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted text-xs"
                    onClick={() => handleSendMessage(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(newMessage);
                  }
                }}
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSendMessage(newMessage)}
                disabled={!newMessage.trim() || isTyping}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { SupportChat };