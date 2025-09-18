import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface TTSOptions {
  voice?: string;
}

export const useNvidiaTTS = () => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const speak = async (text: string, options: TTSOptions = {}) => {
    if (isPlaying) {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
        setIsPlaying(false);
      }
      return;
    }

    setIsPlaying(true);

    try {
      const { data, error } = await supabase.functions.invoke('nvidia-tts', {
        body: {
          text,
          voice: options.voice || 'en-US-AriaNeural'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        // Fallback to browser TTS
        useBrowserTTS(text, options.voice);
        return;
      }

      if (!data.success) {
        console.log('TTS service unavailable, using browser fallback');
        // Fallback to browser TTS
        useBrowserTTS(text, options.voice);
        return;
      }

      // If the service indicates to use browser TTS
      if (data.useBrowserTTS) {
        useBrowserTTS(text, data.voice || options.voice);
        return;
      }

      // If we have actual audio content (for future Nvidia TTS implementation)
      if (data.audioContent) {
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
          // Fallback to browser TTS on audio error
          useBrowserTTS(text, options.voice);
        };

        await audio.play();
      }

    } catch (error) {
      console.error('Nvidia TTS error:', error);
      // Fallback to browser TTS
      useBrowserTTS(text, options.voice);
    }
  };

  const useBrowserTTS = (text: string, voiceId?: string) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      
      // Function to set voice when voices are loaded
      const setVoice = () => {
        const browserVoices = speechSynthesis.getVoices();
        
        if (browserVoices.length === 0) {
          // If voices aren't loaded yet, wait for them
          speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
          return;
        }
        
        // Map Nvidia voice IDs to browser voices
        if (voiceId) {
          let selectedVoice = null;
          
          // Voice mapping based on Nvidia voice IDs
          if (voiceId.includes('Jenny') || voiceId.includes('Jane') || voiceId.includes('Aria')) {
            // Try to find a female voice
            selectedVoice = browserVoices.find(voice => 
              voice.lang.startsWith('en') && 
              (voice.name.toLowerCase().includes('female') || 
               voice.name.toLowerCase().includes('samantha') ||
               voice.name.toLowerCase().includes('susan') ||
               voice.name.toLowerCase().includes('karen') ||
               voice.name.toLowerCase().includes('tessa') ||
               voice.name.toLowerCase().includes('moira') ||
               voice.name.toLowerCase().includes('zira') ||
               voice.name.toLowerCase().includes('hazel'))
            );
          } else if (voiceId.includes('Guy') || voiceId.includes('Davis')) {
            // Try to find a male voice
            selectedVoice = browserVoices.find(voice => 
              voice.lang.startsWith('en') && 
              (voice.name.toLowerCase().includes('male') || 
               voice.name.toLowerCase().includes('alex') ||
               voice.name.toLowerCase().includes('daniel') ||
               voice.name.toLowerCase().includes('fred') ||
               voice.name.toLowerCase().includes('david') ||
               voice.name.toLowerCase().includes('mark'))
            );
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log('Selected browser voice:', selectedVoice.name, 'for Nvidia voice:', voiceId);
          } else {
            console.log('No matching browser voice found for:', voiceId, 'using default');
            // Try to set a default female voice if we wanted female
            if (voiceId.includes('Jenny') || voiceId.includes('Jane') || voiceId.includes('Aria')) {
              const femaleVoice = browserVoices.find(voice => 
                voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
              );
              if (femaleVoice) {
                utterance.voice = femaleVoice;
                console.log('Using default female voice:', femaleVoice.name);
              }
            }
          }
        }
        
        // Start speaking after setting voice
        speechSynthesis.speak(utterance);
      };
      
      utterance.onstart = () => {
        setIsPlaying(true);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Erro no áudio",
          description: "Não foi possível reproduzir o áudio.",
          variant: "destructive",
        });
      };
      
      // Set voice and start speaking
      setVoice();
    } else {
      setIsPlaying(false);
      toast({
        title: "Erro no áudio",
        description: "Síntese de voz não suportada neste navegador.",
        variant: "destructive",
      });
    }
  };

  const stop = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setIsPlaying(false);
    }
    
    // Also stop speech synthesis if it's being used
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Available voices for Nvidia TTS
  const voices = [
    { name: 'Aria (EN-US)', id: 'en-US-AriaNeural', description: 'Feminina, clara' },
    { name: 'Jenny (EN-US)', id: 'en-US-JennyNeural', description: 'Feminina, amigável' },
    { name: 'Guy (EN-US)', id: 'en-US-GuyNeural', description: 'Masculina' },
    { name: 'Davis (EN-US)', id: 'en-US-DavisNeural', description: 'Masculina, profunda' },
    { name: 'Jane (EN-US)', id: 'en-US-JaneNeural', description: 'Feminina, natural' }
  ];

  return {
    speak,
    stop,
    isPlaying,
    voices
  };
};