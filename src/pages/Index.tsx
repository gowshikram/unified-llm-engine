import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { CourseCard } from '@/components/CourseCard';
import { courses } from '@/data/courses';
import { ArrowRight, Brain, Sparkles, Target, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">35-Day Intensive Programs</span>
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Unlock Your Child's
              <span className="block bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                Right Brain Potential
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
              Transform learning through proven right-brain development techniques. 
              Memory training, visual math, phonics, handwriting, and creativity courses designed for exceptional results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
                  Explore All Courses
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              
              <Link to="/login">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated decorative elements */}
        <div className="absolute top-20 left-10 text-6xl animate-float opacity-20">🧠</div>
        <div className="absolute bottom-20 right-10 text-6xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🎨</div>
        <div className="absolute top-40 right-20 text-5xl animate-float opacity-20" style={{ animationDelay: '4s' }}>📚</div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Brain, title: 'Right-Brain Focus', desc: 'Scientifically-proven methods for enhanced learning' },
              { icon: Target, title: '35-Day Programs', desc: 'Intensive courses with measurable results' },
              { icon: Users, title: 'Expert Guidance', desc: 'Comprehensive manuals and video tutorials' },
              { icon: Sparkles, title: '30+ Exercises', desc: 'Interactive activities and games for every course' }
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-lg">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Courses Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">Featured Courses</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Six comprehensive programs designed to develop your child's full cognitive potential
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/courses">
              <Button size="lg" className="gap-2">
                View All Courses
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="font-display text-4xl font-bold mb-4">
              Ready to Transform Learning?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Join thousands of families who have unlocked their children's right-brain potential
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦁</span>
              <span className="font-display font-bold text-lg">Pop Academy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Pop Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
