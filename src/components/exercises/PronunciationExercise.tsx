import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import VoiceRecorder from '@/components/VoiceRecorder';

import { 
  Volume2, 
  ArrowRight,
  Trophy,
  Target,
  BookOpen
} from 'lucide-react';

interface PronunciationExerciseProps {
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

const PronunciationExercise: React.FC<PronunciationExerciseProps> = ({
  sentence,
  onAnswer,
  onNext,
  showAnswer
}) => {
  
  const [userPronunciation, setUserPronunciation] = useState('');
  const [similarity, setSimilarity] = useState(0);
  const [hasAttempted, setHasAttempted] = useState(false);

  const handlePlayAudio = () => {
    // Audio functionality removed
  };

  const handlePronunciationResult = (isCorrect: boolean, similarityScore: number) => {
    setHasAttempted(true);
    setSimilarity(similarityScore);
    onAnswer(isCorrect);
  };

  const getSimilarityFeedback = (score: number): { message: string; color: string; icon: React.ReactNode } => {
    if (score >= 0.9) {
      return {
        message: "Perfeito! Sua pronúncia está excelente!",
        color: "text-green-600",
        icon: <Trophy className="w-4 h-4" />
      };
    } else if (score >= 0.7) {
      return {
        message: "Muito bom! Sua pronúncia está boa!",
        color: "text-blue-600",
        icon: <Target className="w-4 h-4" />
      };
    } else if (score >= 0.5) {
      return {
        message: "Continue praticando! Você está no caminho certo.",
        color: "text-yellow-600",
        icon: <BookOpen className="w-4 h-4" />
      };
    } else {
      return {
        message: "Tente novamente. Ouça com atenção e repita.",
        color: "text-red-600",
        icon: <BookOpen className="w-4 h-4" />
      };
    }
  };

  const feedback = hasAttempted ? getSimilarityFeedback(similarity) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              Exercício de Pronúncia
            </h3>
            {sentence.category && (
              <Badge variant="secondary">{sentence.category}</Badge>
            )}
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Tradução para contexto:
            </p>
            <p className="text-lg text-muted-foreground">
              {sentence.portuguese_text}
            </p>
            
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Pronuncie esta frase em inglês:
              </p>
              <p className="text-2xl font-semibold text-foreground mb-4">
                {sentence.english_text}
              </p>
              
              <Button
                variant="outline"
                onClick={handlePlayAudio}
                disabled={true}
                className="gap-2"
              >
                <Volume2 className="w-4 h-4 opacity-50" />
                Áudio não disponível
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Recorder */}
      {!showAnswer && (
        <VoiceRecorder
          expectedText={sentence.english_text}
          onComplete={handlePronunciationResult}
          onResult={(transcript) => setUserPronunciation(transcript)}
          placeholder="Clique no microfone e pronuncie a frase em inglês"
          showComparison={true}
        />
      )}

      {/* Feedback */}
      {hasAttempted && feedback && (
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className={`flex items-center gap-2 ${feedback.color}`}>
              {feedback.icon}
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
            
            {userPronunciation && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Você disse:</p>
                <p className="text-sm">{userPronunciation}</p>
              </div>
            )}
            
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Pontuação: {Math.round(similarity * 100)}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {showAnswer && (
        <div className="text-center">
          <Button onClick={onNext} className="w-full h-12 text-lg gap-2">
            Próximo exercício
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PronunciationExercise;