import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Course, Lesson } from '@/types/course';
import { useToast } from '@/hooks/use-toast';

export const useCourseData = (userId: string | undefined) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all courses for the user
  const fetchCourses = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error loading courses",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Fetch lessons for a specific course
  const fetchLessons = async (courseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our Lesson type
      const transformedLessons: Lesson[] = (data || []).map(lesson => ({
        ...lesson,
        videos: (lesson.videos as any) || [],
        quiz_data: (lesson.quiz_data as any) || null,
      }));
      
      setLessons(transformedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Error loading lessons",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new course
  const createCourse = async (topic: string): Promise<string | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({ user_id: userId, topic })
        .select()
        .single();

      if (error) throw error;
      
      setCourses(prev => [data, ...prev]);
      setCurrentCourse(data);
      return data.id;
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error creating course",
        description: "Please try again later.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update lesson completion and quiz score
  const updateLessonProgress = async (
    lessonId: string,
    isCompleted: boolean,
    quizScore?: number
  ) => {
    try {
      const updates: any = { is_completed: isCompleted };
      if (quizScore !== undefined) {
        updates.quiz_score = quizScore;
      }

      const { error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', lessonId);

      if (error) throw error;

      // Update local state
      setLessons(prev =>
        prev.map(lesson =>
          lesson.id === lessonId ? { ...lesson, ...updates } : lesson
        )
      );

      // Recalculate course completion
      if (currentCourse) {
        await updateCourseCompletion(currentCourse.id);
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast({
        title: "Error updating progress",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Update course completion percentage
  const updateCourseCompletion = async (courseId: string) => {
    try {
      const { data: courseLessons, error } = await supabase
        .from('lessons')
        .select('is_completed')
        .eq('course_id', courseId);

      if (error) throw error;

      const total = courseLessons?.length || 0;
      const completed = courseLessons?.filter(l => l.is_completed).length || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      await supabase
        .from('courses')
        .update({ completion_percentage: percentage })
        .eq('id', courseId);

      if (currentCourse?.id === courseId) {
        setCurrentCourse(prev => prev ? { ...prev, completion_percentage: percentage } : null);
      }
    } catch (error) {
      console.error('Error updating course completion:', error);
    }
  };

  // Save generated lessons to database
  const saveLessons = async (courseId: string, lessonsData: any[]) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .insert(
          lessonsData.map((lesson, index) => ({
            course_id: courseId,
            title: lesson.title,
            order_index: index,
            notes: lesson.notes || null,
            videos: lesson.videos || [],
            quiz_data: lesson.quiz || null,
          }))
        );

      if (error) throw error;
      await fetchLessons(courseId);
    } catch (error) {
      console.error('Error saving lessons:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCourses();
    }
  }, [userId]);

  return {
    courses,
    currentCourse,
    setCurrentCourse,
    lessons,
    loading,
    fetchCourses,
    fetchLessons,
    createCourse,
    updateLessonProgress,
    saveLessons,
  };
};
