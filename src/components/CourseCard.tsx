import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Course } from '@/data/courses';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in">
      <div className={cn("h-2 bg-gradient-to-r", course.color)} />
      
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <span className="text-5xl">{course.icon}</span>
          <Badge variant="secondary">{course.level}</Badge>
        </div>
        
        <div>
          <h3 className="font-display text-2xl font-bold group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {course.exercises.length} Exercises
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">
          {course.description}
        </p>
      </CardContent>
      
      <CardFooter>
        <Link to={`/courses/${course.id}`} className="w-full">
          <Button className="w-full gap-2 group/btn">
            Explore Course
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
