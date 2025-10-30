import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Trash2 } from 'lucide-react';
import { Course } from '@/types/course';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CoursesListProps {
  courses: Course[];
  onCourseSelect: (course: Course) => void;
  onNewCourse: () => void;
  onCourseDelete: (courseId: string) => void;
}

export const CoursesList = ({ courses, onCourseSelect, onNewCourse, onCourseDelete }: CoursesListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Courses
          </h1>
          <p className="text-muted-foreground">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} in your library
          </p>
        </div>
        <Button onClick={onNewCourse} size="lg">
          Create New Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="space-y-4">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No courses yet</h3>
              <p className="text-muted-foreground">
                Create your first AI-generated course to get started
              </p>
            </div>
            <Button onClick={onNewCourse} className="mt-4">
              Create Your First Course
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="p-6 hover:shadow-lg hover:shadow-primary/10 transition-all border-border/50 bg-card/50 backdrop-blur-sm group relative"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-xs">
                    Course
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={course.completion_percentage === 100 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {course.completion_percentage}%
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{course.topic}" and all its lessons. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onCourseDelete(course.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div onClick={() => onCourseSelect(course)} className="cursor-pointer">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {course.topic}
                  </h3>
                </div>

                <Progress value={course.completion_percentage} className="h-2" />

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(course.created_at)}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => onCourseSelect(course)}
                >
                  {course.completion_percentage === 100 ? 'Review Course' : 'Continue Learning'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
