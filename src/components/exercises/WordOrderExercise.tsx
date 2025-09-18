import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Volume2, CheckCircle, Shuffle, Check, X, RotateCcw } from 'lucide-react';

interface WordOrderExerciseProps {
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

export const WordOrderExercise = ({
  sentence,
  onAnswer,
  onNext,
  showAnswer
}: WordOrderExerciseProps) => {
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  
  
  const correctWords = sentence.english_text.split(' ');

  useEffect(() => {
    // Shuffle words when component mounts or sentence changes
    const words = [...correctWords];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    setShuffledWords(words);
    setSelectedWords([]);
  }, [sentence.id]);

  const handleWordClick = (word: string, index: number) => {
    if (showAnswer) return;
    
    setSelectedWords([...selectedWords, word]);
    setShuffledWords(shuffledWords.filter((_, i) => i !== index));
  };

  const handleSelectedWordClick = (index: number) => {
    if (showAnswer) return;
    
    const word = selectedWords[index];
    setShuffledWords([...shuffledWords, word]);
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedWords.length !== correctWords.length) return;
    
    const userSentence = selectedWords.join(' ');
    const isCorrect = userSentence.toLowerCase() === sentence.english_text.toLowerCase();
    onAnswer(isCorrect);
  };

  const handleReset = () => {
    setShuffledWords([...correctWords].sort(() => Math.random() - 0.5));
    setSelectedWords([]);
  };

  const playAudio = () => {
    // Audio functionality removed
  };

  const userSentence = selectedWords.join(' ');
  const isCorrect = userSentence.toLowerCase() === sentence.english_text.toLowerCase();

  return (
    <Card className="max-w-2xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Organize as palavras</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={playAudio} disabled={true}>
              <Volume2 className="w-4 h-4 opacity-50" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center py-6">
          <p className="text-lg mb-4 text-muted-foreground">
            Traduza: <strong>{sentence.portuguese_text}</strong>
          </p>
          
          {sentence.category && (
            <Badge variant="secondary">{sentence.category}</Badge>
          )}
        </div>

        {/* Selected words area */}
        <div className="min-h-[60px] p-4 border-2 border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Sua frase:</p>
          <div className="flex flex-wrap gap-2">
            {selectedWords.map((word, index) => (
              <button
                key={`selected-${index}`}
                onClick={() => handleSelectedWordClick(index)}
                disabled={showAnswer}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Available words */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Palavras disponíveis:</p>
          <div className="flex flex-wrap gap-2">
            {shuffledWords.map((word, index) => (
              <button
                key={`shuffled-${index}`}
                onClick={() => handleWordClick(word, index)}
                disabled={showAnswer}
                className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {!showAnswer ? (
          <Button 
            onClick={handleSubmit} 
            disabled={selectedWords.length !== correctWords.length}
            className="w-full h-12 text-lg"
          >
            Verificar Resposta
          </Button>
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
              {!isCorrect && (
                <p className="text-sm text-muted-foreground mt-2">
                  Sua resposta: {userSentence}
                </p>
              )}
            </div>

            <Button onClick={onNext} className="w-full h-12 text-lg">
              Próxima Frase
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};