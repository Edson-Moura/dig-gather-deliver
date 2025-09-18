import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { 
  Mic, 
  MicOff, 
  Volume2,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface VoiceRecorderProps {
  expectedText?: string;
  onResult?: (transcript: string, confidence: number) => void;
  onComplete?: (isCorrect: boolean, similarity: number) => void;
  placeholder?: string;
  showComparison?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  expectedText,
  onResult,
  onComplete,
  placeholder = "Clique no microfone e fale em inglês...",
  showComparison = true
}) => {
  const {
    isSupported,
    isListening,
    transcript,
    results,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoiceRecognition();

  const calculateSimilarity = (text1: string, text2: string): number => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const normalizedText1 = normalize(text1);
    const normalizedText2 = normalize(text2);
    
    if (normalizedText1 === normalizedText2) return 1;
    
    const words1 = normalizedText1.split(/\s+/);
    const words2 = normalizedText2.split(/\s+/);
    
    const matchingWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return matchingWords.length / totalWords;
  };

  const handleComplete = () => {
    if (transcript && expectedText) {
      const similarity = calculateSimilarity(transcript, expectedText);
      const isCorrect = similarity >= 0.7; // 70% similarity threshold
      onComplete?.(isCorrect, similarity);
    }
    onResult?.(transcript, results[results.length - 1]?.confidence || 0);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 0.8) return 'text-green-600';
    if (similarity >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isSupported) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Reconhecimento de voz não é suportado neste navegador.
          </p>
        </CardContent>
      </Card>
    );
  }

  const latestResult = results[results.length - 1];
  const similarity = expectedText && transcript ? calculateSimilarity(transcript, expectedText) : 0;

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Expected text */}
          {expectedText && showComparison && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Texto esperado:</h4>
              <p className="text-foreground font-medium p-3 bg-muted rounded-lg">
                {expectedText}
              </p>
            </div>
          )}

          {/* Voice input area */}
          <div className="text-center">
            <div className="mb-4">
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                onClick={isListening ? stopListening : startListening}
                className={`w-20 h-20 rounded-full ${isListening ? 'animate-pulse' : ''}`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {isListening ? 'Falando... Clique para parar' : placeholder}
            </p>
          </div>

          {/* Transcript display */}
          {transcript && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Você disse:</h4>
              <div className="p-3 bg-background border rounded-lg">
                <p className="text-foreground">{transcript}</p>
                
                {/* Confidence and similarity indicators */}
                <div className="flex gap-4 mt-2">
                  {latestResult && (
                    <Badge variant="outline" className="text-xs">
                      Confiança: 
                      <span className={`ml-1 ${getConfidenceColor(latestResult.confidence)}`}>
                        {Math.round(latestResult.confidence * 100)}%
                      </span>
                    </Badge>
                  )}
                  
                  {expectedText && showComparison && (
                    <Badge variant="outline" className="text-xs">
                      Similaridade: 
                      <span className={`ml-1 ${getSimilarityColor(similarity)}`}>
                        {Math.round(similarity * 100)}%
                      </span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={clearTranscript}
              disabled={!transcript}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            
            {expectedText && transcript && (
              <Button 
                onClick={handleComplete}
                className="flex-1"
                variant={similarity >= 0.7 ? "default" : "secondary"}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verificar
              </Button>
            )}
          </div>

          {/* Pronunciation tips */}
          {expectedText && transcript && similarity < 0.7 && similarity > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 Dica: Tente pronunciar mais claramente. Foque na entonação e velocidade da fala.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;