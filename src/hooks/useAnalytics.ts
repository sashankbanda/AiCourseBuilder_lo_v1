import { useMemo } from 'react';
import { Course, Lesson } from '@/types/course';

export interface AnalyticsData {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  averageQuizScore: number;
  overallProgress: number;
  recentActivity: Array<{
    courseTitle: string;
    lessonTitle: string;
    quizScore: number | null;
    completedAt: string;
  }>;
}

export const useAnalytics = (courses: Course[], allLessons: Map<string, Lesson[]>) => {
  return useMemo(() => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.completion_percentage === 100).length;
    
    let totalLessons = 0;
    let completedLessons = 0;
    let totalQuizScore = 0;
    let quizCount = 0;
    const recentActivity: AnalyticsData['recentActivity'] = [];

    courses.forEach(course => {
      const lessons = allLessons.get(course.id) || [];
      totalLessons += lessons.length;
      
      lessons.forEach(lesson => {
        if (lesson.is_completed) {
          completedLessons++;
          if (lesson.quiz_score !== null) {
            totalQuizScore += lesson.quiz_score;
            quizCount++;
          }
          recentActivity.push({
            courseTitle: course.topic,
            lessonTitle: lesson.title,
            quizScore: lesson.quiz_score,
            completedAt: lesson.updated_at
          });
        }
      });
    });

    // Sort by most recent
    recentActivity.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const averageQuizScore = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0;
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalCourses,
      completedCourses,
      totalLessons,
      completedLessons,
      averageQuizScore,
      overallProgress,
      recentActivity: recentActivity.slice(0, 5)
    };
  }, [courses, allLessons]);
};
