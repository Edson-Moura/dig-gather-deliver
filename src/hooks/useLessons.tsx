import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  level: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LessonWithSentences extends Lesson {
  sentences: {
    id: string;
    english_text: string;
    portuguese_text: string;
    level: string;
    category: string | null;
    difficulty_score: number;
    audio_url: string | null;
    order_index: number;
  }[];
}

export const useLessons = () => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('is_active', true)
        .order('level, order_index');

      if (error) {
        console.error('Error fetching lessons:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as lições",
          variant: "destructive",
        });
      } else {
        // Remove duplicates based on title and level
        const uniqueLessons = data?.filter((lesson, index, arr) => 
          index === arr.findIndex(l => l.title === lesson.title && l.level === lesson.level)
        ) || [];
        setLessons(uniqueLessons);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonWithSentences = async (lessonId: string): Promise<LessonWithSentences | null> => {
    console.log('🔄 Fetching lesson with sentences:', lessonId);
    try {
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) {
        console.error('❌ Error fetching lesson:', lessonError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lição",
          variant: "destructive",
        });
        return null;
      }

      console.log('✅ Lesson loaded:', lesson);

      // First get lesson_sentences to get the sentence IDs and order
      const { data: lessonSentences, error: lessonSentencesError } = await supabase
        .from('lesson_sentences')
        .select('sentence_id, order_index')
        .eq('lesson_id', lessonId)
        .order('order_index');

      if (lessonSentencesError) {
        console.error('❌ Error fetching lesson sentences:', lessonSentencesError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as frases da lição",
          variant: "destructive",
        });
        return null;
      }

      if (!lessonSentences || lessonSentences.length === 0) {
        console.log('⚠️ No sentences found for lesson');
        toast({
          title: "Erro",
          description: "Esta lição não possui exercícios disponíveis",
          variant: "destructive",
        });
        return null;
      }

      console.log('📝 Lesson sentences:', lessonSentences);

      // Get sentence IDs array
      const sentenceIds = lessonSentences.map(ls => ls.sentence_id);

      // Then fetch the actual sentence data
      const { data: sentencesData, error: sentencesError } = await supabase
        .from('sentences')
        .select('id, english_text, portuguese_text, level, category, difficulty_score, audio_url')
        .in('id', sentenceIds);

      if (sentencesError) {
        console.error('❌ Error fetching sentences data:', sentencesError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados das frases",
          variant: "destructive",
        });
        return null;
      }

      console.log('📝 Sentences data:', sentencesData);

      // Create a map for easier lookup
      const sentencesMap = new Map(sentencesData?.map(s => [s.id, s]) || []);

      // Combine lesson sentences with sentence data, maintaining order
      const formattedSentences = lessonSentences
        .map(ls => {
          const sentenceData = sentencesMap.get(ls.sentence_id);
          if (!sentenceData) {
            console.log('❌ Sentence data not found for ID:', ls.sentence_id);
            return null;
          }
          return {
            ...sentenceData,
            order_index: ls.order_index
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      console.log('✅ Formatted sentences:', formattedSentences);

      const result = {
        ...lesson,
        sentences: formattedSentences
      };

      console.log('✅ Final lesson with sentences:', result);

      return result;
    } catch (error) {
      console.error('❌ Error in fetchLessonWithSentences:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao carregar a lição",
        variant: "destructive",
      });
      return null;
    }
  };

  const getLessonsByLevel = (level: string) => {
    return lessons.filter(lesson => lesson.level === level);
  };

  return {
    lessons,
    loading,
    fetchLessonWithSentences,
    getLessonsByLevel,
    refetch: fetchLessons,
  };
};