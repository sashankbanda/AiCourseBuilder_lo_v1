import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCourseLogic = () => {
  const [generatingCourse, setGeneratingCourse] = useState(false);
  const { toast } = useToast();

  const generateCourse = async (topic: string, courseId: string) => {
    setGeneratingCourse(true);
    try {
      // Call edge function to generate complete course
      const { data, error } = await supabase.functions.invoke('generate-course', {
        body: { topic, courseId }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Course generated!",
        description: "Your course is ready to explore.",
      });

      return data;
    } catch (error: any) {
      console.error('Error generating course:', error);
      toast({
        title: "Error generating course",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setGeneratingCourse(false);
    }
  };

  return {
    generatingCourse,
    generateCourse,
  };
};
