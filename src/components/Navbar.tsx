import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, LogIn, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-3xl">🦁</span>
          <span className="font-display text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Pop Academy
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          <Link
            to="/courses"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isActive('/courses') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Courses</span>
          </Link>
          
          <Link to="/login">
            <Button variant="default" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          </Link>
          
          <Link to="/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
