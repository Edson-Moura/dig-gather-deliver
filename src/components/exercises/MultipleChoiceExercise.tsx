import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Volume2, CheckCircle, Check, X } from 'lucide-react';

interface MultipleChoiceExerciseProps {
  sentence: {
    id: string;
    english_text: string;
    portuguese_text: string;
    category?: string;
  };
  options: string[];
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  showAnswer: boolean;
}

export const MultipleChoiceExercise = ({
  sentence,
  options,
  correctAnswer,
  onAnswer,
  onNext,
  showAnswer
}: MultipleChoiceExerciseProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  

  const handleOptionSelect = (option: string) => {
    if (showAnswer) return;
    
    setSelectedOption(option);
    const isCorrect = option === correctAnswer;
    onAnswer(isCorrect);
  };

  const playAudio = () => {
    // Audio functionality removed
  };

  const getOptionStyle = (option: string) => {
    if (!showAnswer) {
      return selectedOption === option 
        ? 'border-primary bg-primary/10' 
        : 'border-border hover:border-primary/50';
    }

    if (option === correctAnswer) {
      return 'border-green-500 bg-green-50 dark:bg-green-950';
    }
    
    if (option === selectedOption && option !== correctAnswer) {
      return 'border-red-500 bg-red-50 dark:bg-red-950';
    }
    
    return 'border-border opacity-60';
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Escolha a tradução correta</span>
          <Button variant="ghost" size="sm" onClick={playAudio} disabled={true}>
            <Volume2 className="w-4 h-4 opacity-50" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center py-6">
          <p className="text-2xl font-semibold mb-4">{sentence.portuguese_text}</p>
          {sentence.category && (
            <Badge variant="secondary">{sentence.category}</Badge>
          )}
        </div>

        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              disabled={showAnswer}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${getOptionStyle(option)}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{option}</span>
                {showAnswer && option === correctAnswer && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {showAnswer && option === selectedOption && option !== correctAnswer && (
                  <X className="w-5 h-5 text-red-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {showAnswer && (
          <Button onClick={onNext} className="w-full h-12 text-lg">
            Próxima Frase
          </Button>
        )}
      </CardContent>
    </Card>
  );
};