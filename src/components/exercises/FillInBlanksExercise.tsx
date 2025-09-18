import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { Volume2, CheckCircle, Check, X } from 'lucide-react';

interface FillInBlanksExerciseProps {
  sentence: {
    id: string;
    english_text: string;
    portuguese_text: string;
    category?: string;
  };
  missingWord: string;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  showAnswer: boolean;
}

export const FillInBlanksExercise = ({
  sentence,
  missingWord,
  onAnswer,
  onNext,
  showAnswer
}: FillInBlanksExerciseProps) => {
  const [userInput, setUserInput] = useState('');
  
  // Clean the missing word from punctuation for better matching
  const cleanMissingWord = missingWord.replace(/[^\w]/g, '');
  
  // Create sentence with blank - remove punctuation from word for matching
  const sentenceWithBlank = sentence.english_text.replace(
    new RegExp(`\\b${cleanMissingWord}\\b`, 'gi'),
    '_____'
  );

  const handleSubmit = () => {
    if (userInput.trim() === '') return;
    
    const isCorrect = userInput.trim().toLowerCase() === cleanMissingWord.toLowerCase();
    onAnswer(isCorrect);
  };

  const playAudio = () => {
    // Audio functionality removed
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Complete a frase</span>
          <Button variant="ghost" size="sm" onClick={playAudio} disabled={true}>
            <Volume2 className="w-4 h-4 opacity-50" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center py-6">
          <p className="text-lg mb-4 text-muted-foreground">
            Complete a frase em inglês:
          </p>
          
          <div className="text-2xl font-semibold mb-4 p-4 bg-muted rounded-lg">
            {sentenceWithBlank}
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Tradução: <em>{sentence.portuguese_text}</em>
          </p>
          
          {sentence.category && (
            <Badge variant="secondary">{sentence.category}</Badge>
          )}
        </div>

        {!showAnswer ? (
          <div className="space-y-4">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Digite a palavra que falta..."
              className="text-lg p-4 h-14 text-center"
              onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && handleSubmit()}
            />
            <Button 
              onClick={handleSubmit} 
              disabled={!userInput.trim()}
              className="w-full h-12 text-lg"
            >
              Verificar Resposta
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              userInput.trim().toLowerCase() === cleanMissingWord.toLowerCase()
                ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                : 'border-red-500 bg-red-50 dark:bg-red-950'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {userInput.trim().toLowerCase() === cleanMissingWord.toLowerCase() ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {userInput.trim().toLowerCase() === cleanMissingWord.toLowerCase() ? 'Correto!' : 'Palavra correta:'}
                </span>
              </div>
              <p className="text-lg font-semibold">{cleanMissingWord}</p>
              <p className="text-sm mt-2">Frase completa: <em>{sentence.english_text}</em></p>
              {userInput.trim().toLowerCase() !== cleanMissingWord.toLowerCase() && (
                <p className="text-sm text-muted-foreground mt-2">
                  Sua resposta: {userInput}
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