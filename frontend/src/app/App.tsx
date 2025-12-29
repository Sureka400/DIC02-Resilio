import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { StudentLogin } from './components/StudentLogin';
import { TeacherLogin } from './components/TeacherLogin';
import { AdminLogin } from './components/AdminLogin';
import { SignupPage } from './components/SignupPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ClassroomManagement } from './components/ClassroomManagement';
import { ClassroomView } from './components/ClassroomView';
import { StudentClasses } from './components/StudentClasses';
import { GlitterEffect } from './components/GlitterEffect';
import { clearAuthToken } from './api';

type View = 'landing' | 'login' | 'signup' | 'student-login' | 'teacher-login' | 'admin-login' | 'student' | 'teacher' | 'admin' | 'classroom-management' | 'classroom-view' | 'student-classes';
type Role = 'student' | 'teacher' | 'admin' | null;

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [userRole, setUserRole] = useState<Role>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const handleGetStarted = () => {
    setCurrentView('login');
  };

  const handleSignup = () => {
    setCurrentView('signup');
  };

  const handleRoleSelect = (role: Role) => {
    setUserRole(role);
    if (role === 'student') setCurrentView('student-login');
    if (role === 'teacher') setCurrentView('teacher-login');
    if (role === 'admin') setCurrentView('admin-login');
  };

  const handleLoginSuccess = () => {
    if (userRole === 'student') setCurrentView('student');
    if (userRole === 'teacher') setCurrentView('teacher');
    if (userRole === 'admin') setCurrentView('admin');
  };

  const handleSignupSuccess = (role: 'student' | 'teacher' | 'admin') => {
    setUserRole(role);
    if (role === 'student') setCurrentView('student');
    if (role === 'teacher') setCurrentView('teacher');
    if (role === 'admin') setCurrentView('admin');
  };

  const handleBackToRoleSelect = () => {
    setCurrentView('login');
    setUserRole(null);
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentView('landing');
    setUserRole(null);
  };

  const handleManageClass = (course: any) => {
    setSelectedCourse(course);
    setCurrentView('classroom-management');
  };

  const handleEnterClassroom = (course: any) => {
    setSelectedCourse(course);
    setCurrentView('classroom-view');
  };

  const handleGoToClasses = () => {
    setCurrentView('student-classes');
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
    if (userRole === 'student') setCurrentView('student');
    if (userRole === 'teacher') setCurrentView('teacher');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GlitterEffect />
      
      <AnimatePresence mode="wait">
        {currentView === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <LandingPage onGetStarted={handleGetStarted} onSignup={handleSignup} />
          </motion.div>
        )}

        {currentView === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <LoginPage onRoleSelect={handleRoleSelect} onSignup={handleSignup} />
          </motion.div>
        )}

        {currentView === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <SignupPage onSignupSuccess={handleSignupSuccess} onBack={() => setCurrentView('login')} />
          </motion.div>
        )}

        {currentView === 'student-login' && (
          <motion.div
            key="student-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <StudentLogin 
              onLogin={handleLoginSuccess} 
              onBack={handleBackToRoleSelect} 
              onSignup={handleSignup}
            />
          </motion.div>
        )}

        {currentView === 'teacher-login' && (
          <motion.div
            key="teacher-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <TeacherLogin 
              onLogin={handleLoginSuccess} 
              onBack={handleBackToRoleSelect} 
              onSignup={handleSignup}
            />
          </motion.div>
        )}

        {currentView === 'admin-login' && (
          <motion.div
            key="admin-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <AdminLogin 
              onLogin={handleLoginSuccess} 
              onBack={handleBackToRoleSelect} 
              onSignup={handleSignup}
            />
          </motion.div>
        )}

        {currentView === 'student' && (
          <motion.div
            key="student"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <StudentDashboard onLogout={handleLogout} onEnterClassroom={handleEnterClassroom} onGoToClasses={handleGoToClasses} />
          </motion.div>
        )}

        {currentView === 'teacher' && (
          <motion.div
            key="teacher"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <TeacherDashboard onLogout={handleLogout} onManageClass={handleManageClass} />
          </motion.div>
        )}

        {currentView === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <AdminDashboard onLogout={handleLogout} />
          </motion.div>
        )}

        {currentView === 'classroom-management' && selectedCourse && (
          <motion.div
            key="classroom-management"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <ClassroomManagement course={selectedCourse} onBack={handleBackToDashboard} onLogout={handleLogout} />
          </motion.div>
        )}

        {currentView === 'classroom-view' && selectedCourse && (
          <motion.div
            key="classroom-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <ClassroomView course={selectedCourse} onBack={handleBackToDashboard} onLogout={handleLogout} />
          </motion.div>
        )}

        {currentView === 'student-classes' && (
          <motion.div
            key="student-classes"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <StudentClasses onEnterClassroom={handleEnterClassroom} onBack={() => setCurrentView('student')} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
