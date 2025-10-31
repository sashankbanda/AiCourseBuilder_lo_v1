import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AnalyticsData } from '@/hooks/useAnalytics';
import { BookOpen, CheckCircle, Trophy, TrendingUp, ArrowLeft } from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
  onBack: () => void;
}

export const AnalyticsDashboard = ({ analytics, onBack }: AnalyticsDashboardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Your Learning Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{analytics.totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Lessons</p>
              <p className="text-2xl font-bold">{analytics.completedLessons}/{analytics.totalLessons}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
              <p className="text-2xl font-bold">{analytics.averageQuizScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold">{analytics.overallProgress}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Overall Progress</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Courses Completed</span>
            <span>{analytics.completedCourses}/{analytics.totalCourses}</span>
          </div>
          <Progress value={(analytics.completedCourses / Math.max(analytics.totalCourses, 1)) * 100} />
          
          <div className="flex justify-between text-sm mt-4">
            <span>Lessons Completed</span>
            <span>{analytics.completedLessons}/{analytics.totalLessons}</span>
          </div>
          <Progress value={(analytics.completedLessons / Math.max(analytics.totalLessons, 1)) * 100} />
        </div>
      </Card>

      {analytics.recentActivity.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{activity.lessonTitle}</p>
                  <p className="text-sm text-muted-foreground">{activity.courseTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.completedAt)}</p>
                </div>
                {activity.quizScore !== null && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Quiz Score</p>
                    <p className="text-lg font-bold text-primary">{activity.quizScore}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
