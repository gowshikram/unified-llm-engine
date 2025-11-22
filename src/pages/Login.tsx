import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    localStorage.setItem('userType', 'student');
    localStorage.setItem('userName', studentName);
    localStorage.setItem('studentId', studentId);
    
    toast.success(`Welcome, ${studentName}!`);
    navigate('/profile');
  };
  
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '2004') {
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userName', 'Admin');
      
      toast.success('Admin access granted');
      navigate('/profile');
    } else {
      toast.error('Invalid admin password');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-5xl">🦁</span>
            <span className="font-display text-3xl font-bold text-white">Pop Academy</span>
          </div>
          <p className="text-white/90">Sign in to access your courses</p>
        </div>
        
        <Card className="shadow-2xl">
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="gap-2">
                <User className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <CardHeader>
                <CardTitle>Student Login</CardTitle>
                <CardDescription>Enter your name to access your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Name *</Label>
                    <Input
                      id="studentName"
                      placeholder="Enter your full name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID (Optional)</Label>
                    <Input
                      id="studentId"
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Login as Student
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="admin">
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Enter admin password to access management features</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Admin Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Default password: 2004</p>
                  </div>
                  
                  <Button type="submit" className="w-full" variant="secondary">
                    Login as Admin
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
