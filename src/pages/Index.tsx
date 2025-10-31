import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthForm } from '@/components/auth/AuthForm';
import { TopicInputForm } from '@/components/course/TopicInputForm';
import { LessonDashboard } from '@/components/course/LessonDashboard';
import { LessonView } from '@/components/course/LessonView';
import { CoursesList } from '@/components/course/CoursesList';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { useCourseData } from '@/hooks/useCourseData';
import { useCourseLogic } from '@/hooks/useCourseLogic';
import { useAllLessons } from '@/hooks/useAllLessons';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Lesson, Course } from '@/types/course';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft, BarChart3 } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const {
    courses,
    currentCourse,
    setCurrentCourse,
    lessons,
    loading: lessonsLoading,
    fetchLessons,
    createCourse,
    updateLessonProgress,
    saveLessons,
    deleteCourse,
  } = useCourseData(user?.id);

  const { generatingCourse, generateCourse } = useCourseLogic();

  const { lessonsMap } = useAllLessons(courses.map(c => c.id));
  const analytics = useAnalytics(courses, lessonsMap);

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
    setShowNewCourseForm(false);
    setShowAnalytics(false);
  };

  const handleTopicSubmit = async (topic: string) => {
    const courseId = await createCourse(topic);
    if (courseId) {
      try {
        const data = await generateCourse(topic, courseId);
        await saveLessons(courseId, data.lessons);
        setShowNewCourseForm(false);
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
    setShowNewCourseForm(true);
  };

  const handleCourseSelect = (course: Course) => {
    setCurrentCourse(course);
    setShowNewCourseForm(false);
  };

  const handleBackToCourses = () => {
    setCurrentCourse(null);
    setSelectedLesson(null);
    setShowNewCourseForm(false);
    setShowAnalytics(false);
  };

  const handleShowAnalytics = () => {
    setShowAnalytics(true);
    setCurrentCourse(null);
    setSelectedLesson(null);
    setShowNewCourseForm(false);
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
            {(currentCourse || showNewCourseForm || showAnalytics) && (
              <Button variant="outline" onClick={handleBackToCourses} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                My Courses
              </Button>
            )}
            {!showAnalytics && !currentCourse && (
              <Button variant="outline" onClick={handleShowAnalytics} size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
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
        {showAnalytics ? (
          <AnalyticsDashboard analytics={analytics} onBack={handleBackToCourses} />
        ) : selectedLesson ? (
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
        ) : showNewCourseForm ? (
          <TopicInputForm
            onSubmit={handleTopicSubmit}
            loading={generatingCourse || lessonsLoading}
          />
        ) : (
          <CoursesList
            courses={courses}
            onCourseSelect={handleCourseSelect}
            onNewCourse={handleNewCourse}
            onCourseDelete={deleteCourse}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
