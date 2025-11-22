import { Navbar } from '@/components/Navbar';
import { CourseCard } from '@/components/CourseCard';
import { courses } from '@/data/courses';
import { BookOpen, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Courses = () => {
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Intensive'];
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">6 Complete Programs</span>
          </div>
          
          <h1 className="font-display text-5xl font-bold mb-4">
            Right-Brain Development Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive programs with proven techniques, expert guidance, and interactive exercises
          </p>
        </div>
        
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by level:</span>
          </div>
          {levels.map((level) => (
            <Button
              key={level}
              variant={level === 'All' ? 'default' : 'outline'}
              size="sm"
            >
              {level}
            </Button>
          ))}
        </div>
        
        {/* Course Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Courses', value: '6' },
            { label: 'Total Exercises', value: '30+' },
            { label: 'Video Tutorials', value: '15+' },
            { label: 'PDF Resources', value: '20+' }
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl p-6 border shadow-sm text-center">
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        
        {/* Learning Path */}
        <div className="mt-16 bg-gradient-primary rounded-2xl p-8 md:p-12 text-white">
          <h2 className="font-display text-3xl font-bold mb-4">Recommended Learning Path</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">Week 1-2</Badge>
              <h3 className="font-semibold text-lg">Foundation</h3>
              <p className="text-white/80 text-sm">Start with Right Brain Development to build core visual memory skills</p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">Week 3-6</Badge>
              <h3 className="font-semibold text-lg">Core Skills</h3>
              <p className="text-white/80 text-sm">Add Phonics, Handwriting, and Visual Math for fundamental learning</p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">Week 7+</Badge>
              <h3 className="font-semibold text-lg">Advanced</h3>
              <p className="text-white/80 text-sm">Master Memory Training and Art & Creativity for complete development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
