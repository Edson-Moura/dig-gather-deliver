import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Sentence {
  id: string;
  english_text: string;
  portuguese_text: string;
  level: string;
  category: string | null;
  difficulty_score: number;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  level: string;
  order_index: number;
  is_active: boolean;
  sentences?: Sentence[];
}

export const useSentences = () => {
  const { toast } = useToast();
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentences();
    fetchLessons();
  }, []);

  const fetchSentences = async () => {
    try {
      const { data, error } = await supabase
        .from('sentences')
        .select('*')
        .order('difficulty_score', { ascending: true });

      if (error) {
        console.error('Error fetching sentences:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as frases.",
          variant: "destructive",
        });
      } else {
        setSentences(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          lesson_sentences!lesson_sentences_lesson_id_fkey (
            order_index,
            sentences!lesson_sentences_sentence_id_fkey (*)
          )
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching lessons:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as lições.",
          variant: "destructive",
        });
      } else {
        const lessonsWithSentences = data?.map(lesson => ({
          ...lesson,
          sentences: lesson.lesson_sentences
            ?.sort((a, b) => a.order_index - b.order_index)
            ?.map(ls => ls.sentences)
            ?.filter(sentence => sentence != null) || []
        })) || [];
        
        setLessons(lessonsWithSentences);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentencesByLevel = (level: string) => {
    return sentences.filter(sentence => sentence.level === level);
  };

  const getSentencesByCategory = (category: string) => {
    return sentences.filter(sentence => sentence.category === category);
  };

  return {
    sentences,
    lessons,
    loading,
    getSentencesByLevel,
    getSentencesByCategory,
    refetch: () => {
      fetchSentences();
      fetchLessons();
    },
  };
};