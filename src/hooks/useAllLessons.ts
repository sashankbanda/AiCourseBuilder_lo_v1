import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lesson } from '@/types/course';

export const useAllLessons = (courseIds: string[]) => {
  const [lessonsMap, setLessonsMap] = useState<Map<string, Lesson[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllLessons = async () => {
      if (courseIds.length === 0) {
        setLessonsMap(new Map());
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await (supabase as any)
          .from('lessons')
          .select('*')
          .in('course_id', courseIds)
          .order('order_index');

        if (error) throw error;

        const map = new Map<string, Lesson[]>();
        data?.forEach((lesson: any) => {
          const courseId = lesson.course_id;
          if (!map.has(courseId)) {
            map.set(courseId, []);
          }
          map.get(courseId)?.push(lesson as Lesson);
        });

        setLessonsMap(map);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllLessons();
  }, [courseIds]);

  return { lessonsMap, loading };
};
