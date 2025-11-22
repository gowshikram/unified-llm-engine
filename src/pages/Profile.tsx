import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  LogOut, 
  Award, 
  TrendingUp, 
  Clock,
  BookOpen,
  Target,
  Sparkles,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { courses } from '@/data/courses';

const Profile = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [userName, setUserName] = useState('');
  const [studentId, setStudentId] = useState('');
  
  useEffect(() => {
    const type = localStorage.getItem('userType');
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('studentId');
    
    if (!type || !name) {
      navigate('/login');
      return;
    }
    
    setUserType(type);
    setUserName(name);
    setStudentId(id || '');
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('studentId');
    toast.success('Logged out successfully');
    navigate('/');
  };
  
  const isAdmin = userType === 'admin';
  
  // Mock progress data
  const enrolledCourses = courses.slice(0, 3);
  const stats = {
    coursesEnrolled: 3,
    coursesCompleted: 1,
    exercisesCompleted: 24,
    totalHours: 42,
    streak: 7
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container py-12">
        {/* Profile Header */}
        <div className="bg-gradient-primary rounded-2xl p-8 mb-12 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl">
                {isAdmin ? '👨‍💼' : '👨‍🎓'}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold">{userName}</h1>
                  <Badge variant="secondary" className="gap-1">
                    {isAdmin ? <><Shield className="h-3 w-3" /> Admin</> : <><User className="h-3 w-3" /> Student</>}
                  </Badge>
                </div>
                {studentId && (
                  <p className="text-white/80">Student ID: {studentId}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    {stats.streak} day streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {stats.totalHours}h learning time
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              onClick={handleLogout}
              className="gap-2 self-start md:self-center"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: BookOpen, label: 'Courses Enrolled', value: stats.coursesEnrolled, color: 'text-primary' },
            { icon: Award, label: 'Completed', value: stats.coursesCompleted, color: 'text-success' },
            { icon: Target, label: 'Exercises Done', value: stats.exercisesCompleted, color: 'text-secondary' },
            { icon: TrendingUp, label: 'Progress Rate', value: '78%', color: 'text-accent' }
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {enrolledCourses.map((course, i) => {
              const progress = [65, 40, 15][i]; // Mock progress
              return (
                <div key={course.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{course.icon}</span>
                      <div>
                        <h4 className="font-semibold">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.exercises.length} exercises • {course.duration}
                        </p>
                      </div>
                    </div>
                    <Badge variant={progress === 100 ? 'default' : 'outline'}>
                      {progress}%
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
        
        {/* Admin Panel */}
        {isAdmin && (
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start gap-2">
                <User className="h-4 w-4" />
                Manage Students
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                Manage Courses
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
