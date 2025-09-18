
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useNvidiaTTS } from '@/hooks/useNvidiaTTS';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LimitReachedModal } from '@/components/LimitReachedModal';
import { PlanUpgradeCard } from '@/components/PlanUpgradeCard';
import { useToast } from '@/hooks/use-toast';

import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  Send, 
  Volume2, 
  VolumeX,
  Loader2,
  Bot,
  User,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Crown,
  Lock,
  Mic,
  MicOff,
  Settings
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasReachedChatLimit, getRemainingUsage, getUsagePercentage, incrementChatMessages, currentPlan } = usePlanLimits();
  const { toast } = useToast();
  const { 
    isSupported, 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    clearTranscript 
  } = useVoiceRecognition();
  const { speak, stop, isPlaying, voices } = useNvidiaTTS();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('en-US-AriaNeural');
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  // Removed AI selection - now using only Nvidia
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  // Welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `Hello! I'm your AI English conversation partner powered by Nvidia. Let's practice together! You can ask me anything or just start a casual conversation. How are you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check chat limits for free users
    if (currentPlan === 'free' && hasReachedChatLimit()) {
      setShowLimitModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Increment chat message count for free users
    if (currentPlan === 'free') {
      incrementChatMessages();
    }

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('nvidia-chat', {
        body: {
          message: inputMessage,
          conversationHistory
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI response failed');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the AI response
      speakText(data.response);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Erro no chat",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const clearChat = () => {
    setMessages([]);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
    }
  };

  const speakText = (text: string) => {
    speak(text, { voice: selectedVoice });
  };

  const suggestions = [
    "Tell me about your hobbies",
    "What's your favorite food?",
    "How do you usually spend weekends?",
    "Describe your hometown",
    "What are you learning today?"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        feature="chat"
        currentUsage={10 - getRemainingUsage('chat')}
        limit={10}
      />
      
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-primary" />
                  Chat IA Nvidia - Prática de Conversação
                  {currentPlan === 'free' && (
                    <Badge variant="outline" className="flex items-center gap-1 ml-2">
                      <Crown className="w-3 h-3" />
                      Plano Gratuito
                    </Badge>
                  )}
                </h1>
                <p className="text-muted-foreground">
                  Pratique inglês conversando com nossa IA powered by Nvidia!
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearChat} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Nova Conversa
                </Button>
              </div>
            </div>
            
            {/* Chat Usage Progress for Free Users */}
            {currentPlan === 'free' && (
              <div className="mt-4">
                <Card className="border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Mensagens utilizadas hoje</span>
                      <span className="text-sm text-muted-foreground">
                        {10 - getRemainingUsage('chat')}/10
                      </span>
                    </div>
                    <Progress value={getUsagePercentage('chat')} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {getRemainingUsage('chat')} mensagens restantes no plano gratuito
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Plan Upgrade Card for Free Users who reached limit */}
          {currentPlan === 'free' && getRemainingUsage('chat') <= 2 && (
            <div className="mb-6">
              <PlanUpgradeCard feature="chat" />
            </div>
          )}

          {/* Voice Settings */}
          <div className="mb-6">
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5 text-primary" />
                  Configurações de Voz Nvidia TTS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Escolha a voz</label>
                    <select 
                      value={selectedVoice} 
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="px-3 py-2 border rounded-lg bg-background text-foreground"
                    >
                      {voices.map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} - {voice.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium">Síntese de Voz Nvidia</label>
                      <p className="text-xs text-muted-foreground">Usando TTS avançado da Nvidia</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speakText("Teste de áudio com Nvidia TTS")}
                      className="gap-2"
                      disabled={isPlaying}
                    >
                      <Volume2 className="w-4 h-4" />
                      Testar Voz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Conversation suggestions */}
        {messages.length <= 1 && (
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-accent" />
                Sugestões para começar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">{message.content}</p>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakText(message.content)}
                          disabled={isPlaying}
                          className="opacity-70 hover:opacity-100 p-1 h-auto"
                        >
                          {isPlaying ? (
                            <VolumeX className="w-3 h-3" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {message.role === 'user' ? 'Você' : 'Nvidia IA'}
                    </Badge>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted px-4 py-2 rounded-lg flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Nvidia IA está digitando...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    currentPlan === 'free' && hasReachedChatLimit()
                      ? "Limite de mensagens atingido - Faça upgrade para continuar"
                      : isListening 
                        ? "Ouvindo... Fale agora!"
                        : "Digite sua mensagem ou use o microfone..."
                  }
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading || (currentPlan === 'free' && hasReachedChatLimit())}
                  className="flex-1"
                />
                {isSupported && (
                  <Button
                    variant="outline"
                    onClick={handleVoiceToggle}
                    disabled={isLoading || (currentPlan === 'free' && hasReachedChatLimit())}
                    className={`gap-2 ${isListening ? 'bg-red-500/10 text-red-600 border-red-200' : ''}`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        Parar
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Falar
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading || (currentPlan === 'free' && hasReachedChatLimit())}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentPlan === 'free' && hasReachedChatLimit() ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {currentPlan === 'free' && hasReachedChatLimit() ? 'Bloqueado' : 'Enviar'}
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                 {currentPlan === 'free' && hasReachedChatLimit()
                   ? '🔒 Faça upgrade para Premium e tenha mensagens ilimitadas!'
                   : isListening
                     ? '🎤 Falando... Clique em "Parar" quando terminar'
                     : '💡 Dica: Use texto, voz ou clique no 🔊 para ouvir as respostas!'
                 }
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
    </>
  );
};

export default Chat;
