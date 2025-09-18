import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNvidiaTTS } from '@/hooks/useNvidiaTTS';
import { Volume2, CheckCircle, Check, X, VolumeX } from 'lucide-react';

interface ListeningExerciseProps {
  sentence: {
    id: string;
    english_text: string;
    portuguese_text: string;
    category?: string;
  };
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  showAnswer: boolean;
}

export const ListeningExercise = ({
  sentence,
  onAnswer,
  onNext,
  showAnswer
}: ListeningExerciseProps) => {
  const [userInput, setUserInput] = useState('');
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const { speak, isPlaying } = useNvidiaTTS();

  const handleSubmit = () => {
    if (userInput.trim() === '') return;
    
    const isCorrect = userInput.trim().toLowerCase() === sentence.english_text.toLowerCase();
    onAnswer(isCorrect);
  };

  const playAudio = async () => {
    try {
      await speak(sentence.english_text, { voice: 'en-US-AriaNeural' });
      setHasPlayedAudio(true);
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
    }
  };

  const isCorrect = userInput.trim().toLowerCase() === sentence.english_text.toLowerCase();

  return (
    <Card className="max-w-2xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Exercício de Escuta</span>
          <Button variant="ghost" size="sm" onClick={playAudio} disabled={isPlaying}>
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center py-6">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              {hasPlayedAudio ? (
                <Volume2 className="w-10 h-10 text-primary" />
              ) : (
                <VolumeX className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Clique no ícone de áudio acima e digite o que você ouvir
            </p>
            <Button 
              onClick={playAudio}
              variant="outline"
              size="lg"
              className="w-full h-16 text-lg hover-scale"
              disabled={isPlaying}
            >
              <Volume2 className={`w-6 h-6 mr-2 ${isPlaying ? 'animate-pulse text-primary' : ''}`} />
              {isPlaying ? 'Reproduzindo...' : 'Reproduzir Áudio'}
            </Button>
          </div>
          
          {sentence.category && (
            <Badge variant="secondary">{sentence.category}</Badge>
          )}
        </div>

        {!showAnswer ? (
          <div className="space-y-4">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Digite o que você ouviu..."
              className="text-lg p-4 h-14"
              onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && handleSubmit()}
              disabled={!hasPlayedAudio}
            />
            <Button 
              onClick={handleSubmit} 
              disabled={!userInput.trim() || !hasPlayedAudio}
              className="w-full h-12 text-lg"
            >
              Verificar Resposta
            </Button>
            {!hasPlayedAudio && (
              <p className="text-sm text-muted-foreground text-center">
                Primeiro reproduza o áudio para poder responder
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              isCorrect 
                ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                : 'border-red-500 bg-red-50 dark:bg-red-950'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {isCorrect ? 'Correto!' : 'Resposta correta:'}
                </span>
              </div>
              <p className="text-lg">{sentence.english_text}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tradução: {sentence.portuguese_text}
              </p>
              {!isCorrect && (
                <p className="text-sm text-muted-foreground mt-2">
                  Sua resposta: {userInput}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={playAudio} className="flex-1" disabled={isPlaying}>
                <Volume2 className={`w-4 h-4 mr-2 ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying ? 'Reproduzindo...' : 'Reproduzir Novamente'}
              </Button>
              <Button onClick={onNext} className="flex-2">
                Próxima Frase
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};