import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthForm } from '@/components/auth/AuthForm';
import { TopicInputForm } from '@/components/course/TopicInputForm';
import { LessonDashboard } from '@/components/course/LessonDashboard';
import { LessonView } from '@/components/course/LessonView';
import { useCourseData } from '@/hooks/useCourseData';
import { useCourseLogic } from '@/hooks/useCourseLogic';
import { Lesson } from '@/types/course';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  const {
    currentCourse,
    setCurrentCourse,
    lessons,
    loading: lessonsLoading,
    fetchLessons,
    createCourse,
    updateLessonProgress,
    saveLessons,
  } = useCourseData(user?.id);

  const { generatingCourse, generateCourse } = useCourseLogic();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentCourse) {
      fetchLessons(currentCourse.id);
    }
  }, [currentCourse]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentCourse(null);
    setSelectedLesson(null);
  };

  const handleTopicSubmit = async (topic: string) => {
    const courseId = await createCourse(topic);
    if (courseId) {
      try {
        const data = await generateCourse(topic, courseId);
        await saveLessons(courseId, data.lessons);
      } catch (error) {
        console.error('Failed to generate course:', error);
      }
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleBack = () => {
    setSelectedLesson(null);
  };

  const handleQuizComplete = async (score: number) => {
    if (selectedLesson) {
      await updateLessonProgress(selectedLesson.id, true, score);
    }
  };

  const handleNewCourse = () => {
    setCurrentCourse(null);
    setSelectedLesson(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Course Builder
          </h1>
          <div className="flex items-center gap-2">
            {currentCourse && !selectedLesson && (
              <Button variant="outline" onClick={handleNewCourse} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Course
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut} size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {selectedLesson ? (
          <LessonView
            lesson={selectedLesson}
            onBack={handleBack}
            onQuizComplete={handleQuizComplete}
          />
        ) : currentCourse && lessons.length > 0 ? (
          <LessonDashboard
            course={currentCourse}
            lessons={lessons}
            onLessonClick={handleLessonClick}
          />
        ) : (
          <TopicInputForm
            onSubmit={handleTopicSubmit}
            loading={generatingCourse || lessonsLoading}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
