import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, BookOpen, Trophy } from 'lucide-react';
import { Lesson, Course } from '@/types/course';
import { Button } from '@/components/ui/button';

interface LessonDashboardProps {
  course: Course;
  lessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

export const LessonDashboard = ({ course, lessons, onLessonClick }: LessonDashboardProps) => {
  const completedCount = lessons.filter(l => l.is_completed).length;
  const totalCount = lessons.length;

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {course.topic}
            </h1>
            <p className="text-muted-foreground">
              {completedCount} of {totalCount} lessons completed
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Trophy className="w-4 h-4 mr-2" />
            {course.completion_percentage}%
          </Badge>
        </div>
        
        <Progress value={course.completion_percentage} className="h-3" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson, index) => (
          <Card
            key={lesson.id}
            className="p-6 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm group"
            onClick={() => onLessonClick(lesson)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="text-xs">
                  Lesson {index + 1}
                </Badge>
                {lesson.is_completed ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                {lesson.title}
              </h3>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{lesson.videos.length} videos</span>
                </div>
                {lesson.quiz_score !== null && (
                  <Badge variant="secondary" className="text-xs">
                    Score: {lesson.quiz_score}/5
                  </Badge>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                {lesson.is_completed ? 'Review Lesson' : 'Start Lesson'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
