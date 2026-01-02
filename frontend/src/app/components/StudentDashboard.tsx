import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Bot, 
  TrendingUp, 
  Calendar, 
  User,
  LogOut,
  Clock,
  Award,
  Heart,
  Brain,
  Trophy,
  Star,
  Plus,
  CheckCircle,
  Send,
  X,
  AlertCircle,
  Eye,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { TabNavigation } from './TabNavigation';
import { ChartCard } from './ChartCard';
import { ChatComponent } from './ChatComponent';
import { AiInsights } from './AiInsights';
import { AiSchedule } from './AiSchedule';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { studentAPI, courseAPI } from '../api';

interface StudentDashboardProps {
  onLogout: () => void;
  onEnterClassroom: (course: any) => void;
  onGoToClasses?: () => void;
}

export function StudentDashboard({ onLogout, onEnterClassroom, onGoToClasses }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classCode, setClassCode] = useState('');
  const [joinStatus, setJoinStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [behavior, setBehavior] = useState<any>(null);
  const [psychoProfile, setPsychoProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [aiAssistantMessage, setAiAssistantMessage] = useState<string | undefined>(undefined);
  
  // Account settings states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const enrolledCourses = await studentAPI.getCourses();
      setCourses(enrolledCourses);
      
      const userProfile = await studentAPI.getProfile();
      setProfile(userProfile.user || userProfile);
      setEditedProfile(userProfile.user || userProfile);
      
      const allAssignments = await studentAPI.getAssignments();
      setAssignments(allAssignments);

      try {
        const behaviorData = await studentAPI.getBehavior();
        setBehavior(behaviorData);
      } catch (err) {
        console.error('Behavior data not found');
      }

      try {
        const psychoData = await studentAPI.getPsychoProfile();
        setPsychoProfile(psychoData);
      } catch (err) {
        console.error('Psycho-educational profile not found');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await studentAPI.updateProfile({
        name: editedProfile.name,
        profile: editedProfile.profile,
        academicInfo: editedProfile.academicInfo
      });
      setProfile(updated.user || (typeof updated.user === 'object' ? { ...profile, ...updated.user } : profile));
      setIsEditingProfile(false);
      fetchData(); // Refresh to get all stats
      alert('✅ Profile updated successfully!');
    } catch (error: any) {
      alert(`❌ Error updating profile: ${error.message}`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordStatus(null);
      }, 2000);
    } catch (error: any) {
      setPasswordStatus({ type: 'error', message: error.message || 'Failed to change password' });
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode) return;
    
    try {
      await courseAPI.join(classCode);
      setJoinStatus({ type: 'success', message: 'Successfully joined the class!' });
      setClassCode('');
      fetchData(); // Refresh data
    } catch (error: any) {
      setJoinStatus({ type: 'error', message: error.message || 'Failed to join class' });
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    
    setSubmissionError('');
    if (!submissionContent.trim()) {
      setSubmissionError('Please enter your submission content');
      return;
    }

    setSubmissionLoading(true);
    try {
      await studentAPI.submitAssignment(selectedAssignment._id, {
        content: submissionContent.trim(),
        attachments: []
      });
      
      setSubmissionContent('');
      setIsSubmissionModalOpen(false);
      setSelectedAssignment(null);
      
      const updated = assignments.map(a => 
        a._id === selectedAssignment._id 
          ? { ...a, submission: { student: profile?.id, content: submissionContent, submittedAt: new Date() } }
          : a
      );
      setAssignments(updated);
      
      alert('✅ Assignment submitted successfully!');
    } catch (error: any) {
      setSubmissionError(error.message || 'Failed to submit assignment');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classroom', label: 'Classroom', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'insights', label: 'AI Insights', icon: BarChart3 },
    { id: 'progress', label: 'Progress & Well-Being', icon: TrendingUp },
    { id: 'ai-schedule', label: 'AI Schedule', icon: Sparkles },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Chart Data
  const studyConsistencyData = behavior ? [
    { day: 'Mon', hours: Math.round((behavior.timeSpentOnMaterials / 60 / 5) * 0.8 * 10) / 10 },
    { day: 'Tue', hours: Math.round((behavior.timeSpentOnMaterials / 60 / 5) * 1.2 * 10) / 10 },
    { day: 'Wed', hours: Math.round((behavior.timeSpentOnMaterials / 60 / 5) * 1.0 * 10) / 10 },
    { day: 'Thu', hours: Math.round((behavior.timeSpentOnMaterials / 60 / 5) * 0.9 * 10) / 10 },
    { day: 'Fri', hours: Math.round((behavior.timeSpentOnMaterials / 60 / 5) * 1.1 * 10) / 10 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 },
  ] : [];

  const assignmentProgressData = courses.map(course => {
    const courseAssignments = assignments.filter(a => a.course?._id === course._id || a.course === course._id);
    const completed = courseAssignments.filter(a => a.submission).length;
    const total = courseAssignments.length;
    return {
      subject: course.subject || course.title,
      completed: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });

  const skillsData = behavior ? [
    { skill: 'Consistency', value: behavior.timetableAdherence || 0 },
    { skill: 'Engagement', value: psychoProfile?.engagementLevel === 'high' ? 95 : psychoProfile?.engagementLevel === 'medium' ? 70 : 40 },
    { skill: 'Punctuality', value: behavior.assignmentSubmission === 'onTime' ? 90 : behavior.assignmentSubmission === 'late' ? 60 : 30 },
    { skill: 'Self-Learning', value: Math.min(100, (behavior.aiChatUsageCount || 0) * 10 + 50) },
    { skill: 'Time Mgmt', value: Math.max(0, 100 - (behavior.missedDeadlinesCount || 0) * 20) },
  ] : [];

  const moodTrendData = psychoProfile ? [
    { week: 'Week 1', mood: 7 },
    { week: 'Week 2', mood: 8 },
    { week: 'Week 3', mood: psychoProfile.stressRisk === 'high' ? 4 : psychoProfile.stressRisk === 'medium' ? 6 : 7 },
    { week: 'Week 4', mood: psychoProfile.stressRisk === 'high' ? 3 : psychoProfile.stressRisk === 'medium' ? 5 : 9 },
  ] : [];

  return (
    <div className="relative min-h-screen px-6 py-8">
      <div className="gradient-overlay" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#FFD600' }}>
              Student Portal
            </h1>
            <p className="text-[#a8a6a1]">Welcome back, let&apos;s continue learning</p>
          </div>

          <button
            onClick={onLogout}
            className="btn-3d flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-[#e8e6e1] rounded-xl hover:bg-[#2a2a2a] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </motion.div>

        {/* Tab Navigation */}
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Courses Enrolled', value: courses.length.toString(), icon: BookOpen },
                  { label: 'Pending Assignments', value: assignments.filter(a => !a.submission).length.toString(), icon: Clock },
                  { label: 'Completed', value: assignments.filter(a => a.submission).length.toString(), icon: Award },
                  { label: 'Join New Class', value: 'Join', icon: Plus, isAction: true },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <GlassCard enableParallax={false}>
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-[#FFD600]/10">
                            <Icon className="w-6 h-6 text-[#FFD600]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#a8a6a1] mb-1" style={{ fontSize: '0.875rem' }}>{stat.label}</p>
                            {stat.isAction ? (
                              <button 
                                onClick={() => setActiveTab('classroom')}
                                className="text-[#FFD600] font-bold hover:underline"
                              >
                                Join Now
                              </button>
                            ) : (
                              <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFD600' }}>
                                {stat.value}
                              </p>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Study Consistency" description="Hours spent learning this week">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={studyConsistencyData}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD600" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FFD600" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                      <XAxis dataKey="day" stroke="#a8a6a1" />
                      <YAxis stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="hours"
                        stroke="#FFD600"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorHours)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Assignment Completion" description="Progress across subjects">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={assignmentProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                      <XAxis dataKey="subject" stroke="#a8a6a1" />
                      <YAxis stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Bar
                        dataKey="completed"
                        fill="#FFD600"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Today's Tasks */}
              <ChartCard title="Today's Tasks" description="Your upcoming classes and deadlines">
                <div className="space-y-3">
                  {courses.length > 0 || assignments.filter(a => !a.submission).length > 0 ? (
                    <>
                      {courses.slice(0, 2).map((course, idx) => (
                        <div key={`c-${idx}`} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#FFD600] animate-pulse" />
                            <span className="text-[#e8e6e1]">{course.title} Class</span>
                          </div>
                          <span className="text-[#a8a6a1]" style={{ fontSize: '0.875rem' }}>{course.schedule?.startTime || 'Today'}</span>
                        </div>
                      ))}
                      {assignments.filter(a => !a.submission).slice(0, 2).map((assignment, idx) => (
                        <div key={`a-${idx}`} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-[#e8e6e1]">{assignment.title} Due</span>
                          </div>
                          <span className="text-[#a8a6a1]" style={{ fontSize: '0.875rem' }}>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8 text-[#a8a6a1]">
                      No tasks for today. Enjoy your free time!
                    </div>
                  )}
                </div>
              </ChartCard>
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Skills Development" description="Your learning strengths">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={skillsData}>
                      <PolarGrid stroke="rgba(255, 214, 0, 0.2)" />
                      <PolarAngleAxis dataKey="skill" stroke="#a8a6a1" />
                      <Radar
                        name="Skills"
                        dataKey="value"
                        stroke="#FFD600"
                        fill="#FFD600"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        animationDuration={1500}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Well-Being Trend" description="Your energy and mood patterns">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={moodTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                      <XAxis dataKey="week" stroke="#a8a6a1" />
                      <YAxis domain={[0, 10]} stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#FFD600"
                        strokeWidth={3}
                        dot={{ fill: '#FFD600', r: 6 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { 
                    label: 'Timetable Adherence', 
                    value: behavior ? `${behavior.timetableAdherence}%` : 'N/A', 
                    icon: Heart, 
                    color: '#FFD600' 
                  },
                  { 
                    label: 'Learning Engagement', 
                    value: psychoProfile ? psychoProfile.engagementLevel.charAt(0).toUpperCase() + psychoProfile.engagementLevel.slice(1) : 'N/A', 
                    icon: Brain, 
                    color: '#FFD600' 
                  },
                  { 
                    label: 'Stress Risk', 
                    value: psychoProfile ? psychoProfile.stressRisk.charAt(0).toUpperCase() + psychoProfile.stressRisk.slice(1) : 'N/A', 
                    icon: TrendingUp, 
                    color: '#FFD600' 
                  },
                ].map((metric, idx) => {
                  const Icon = metric.icon;
                  return (
                    <GlassCard key={idx} enableParallax={false}>
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-[#FFD600]/10">
                          <Icon className="w-8 h-8 text-[#FFD600]" />
                        </div>
                        <h3 className="mb-2" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFD600' }}>
                          {metric.value}
                        </h3>
                        <p className="text-[#a8a6a1]">{metric.label}</p>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div
              key="assignments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="space-y-6">
                {assignments.length === 0 ? (
                  <GlassCard>
                    <div className="p-12 text-center">
                      <FileText className="w-16 h-16 text-[#FFD600]/30 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-[#e8e6e1] mb-3">No Assignments Yet</h3>
                      <p className="text-[#a8a6a1]">Check back soon for assignments from your teachers</p>
                    </div>
                  </GlassCard>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {assignments.map((assignment, index) => {
                      const isOverdue = new Date(assignment.dueDate) < new Date();
                      const isSubmitted = !!assignment.submission;
                      const isGraded = isSubmitted && assignment.submission.grade;
                      
                      return (
                        <motion.div
                          key={assignment._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <GlassCard>
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="text-[#e8e6e1] font-semibold mb-2">{assignment.title}</h3>
                                  <p className="text-[#a8a6a1] text-sm mb-3">{assignment.description}</p>
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    <span className="px-2 py-1 bg-[#FFD600]/10 text-[#FFD600] text-xs rounded-full">
                                      {assignment.course?.title || 'Course'}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      assignment.type === 'homework' ? 'bg-blue-500/20 text-blue-400' :
                                      assignment.type === 'quiz' ? 'bg-purple-500/20 text-purple-400' :
                                      assignment.type === 'project' ? 'bg-green-500/20 text-green-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>
                                      {assignment.type}
                                    </span>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                  isGraded ? 'bg-green-500/20 text-green-400' :
                                  isSubmitted ? 'bg-blue-500/20 text-blue-400' :
                                  isOverdue ? 'bg-red-500/20 text-red-400' :
                                  'bg-[#FFD600]/20 text-[#FFD600]'
                                }`}>
                                  {isGraded ? 'Graded' :
                                   isSubmitted ? 'Submitted' :
                                   isOverdue ? 'Overdue' : 'Pending'}
                                </span>
                              </div>
                              
                              <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-[#a8a6a1]">Due Date:</span>
                                  <span className={isOverdue && !isSubmitted ? 'text-red-400' : 'text-[#FFD600]'}>
                                    {new Date(assignment.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-[#a8a6a1]">Points:</span>
                                  <span className="text-[#e8e6e1]">{assignment.totalPoints}</span>
                                </div>
                                {isSubmitted && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-[#a8a6a1]">Submitted:</span>
                                    <span className="text-green-400">{new Date(assignment.submission.submittedAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {isGraded && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-[#a8a6a1]">Grade:</span>
                                    <span className="text-green-400 font-bold">{assignment.submission.grade}/{assignment.totalPoints}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                {!isSubmitted && (
                                  <button 
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setIsSubmissionModalOpen(true);
                                    }}
                                    className="flex-1 btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Send className="w-4 h-4" />
                                    Submit
                                  </button>
                                )}
                                {isSubmitted && (
                                  <button 
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setSubmissionContent(assignment.submission.content);
                                      setIsSubmissionModalOpen(true);
                                    }}
                                    className="flex-1 btn-3d bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                                  >
                                    View Submission
                                  </button>
                                )}
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submission Modal */}
              <AnimatePresence>
                {isSubmissionModalOpen && selectedAssignment && (
                  <motion.div
                    key="submission-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsSubmissionModalOpen(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#0a0a0a] border border-[#FFD600]/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-[#e8e6e1]">{selectedAssignment.title}</h2>
                          <p className="text-[#a8a6a1] text-sm mt-1">{selectedAssignment.course?.title}</p>
                        </div>
                        <button
                          onClick={() => setIsSubmissionModalOpen(false)}
                          className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-[#a8a6a1]" />
                        </button>
                      </div>

                      <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
                        <p className="text-[#e8e6e1] text-sm mb-3"><strong>Instructions:</strong></p>
                        <p className="text-[#a8a6a1] text-sm mb-4">{selectedAssignment.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-[#a8a6a1]">Due Date:</span>
                            <p className="text-[#FFD600] font-semibold">{new Date(selectedAssignment.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-[#a8a6a1]">Points:</span>
                            <p className="text-[#e8e6e1] font-semibold">{selectedAssignment.totalPoints}</p>
                          </div>
                          <div>
                            <span className="text-[#a8a6a1]">Type:</span>
                            <p className="text-[#e8e6e1] font-semibold capitalize">{selectedAssignment.type}</p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleSubmitAssignment}>
                        <div className="mb-6">
                          <label className="block text-[#e8e6e1] font-semibold mb-3">Your Response *</label>
                          <textarea
                            value={submissionContent}
                            onChange={(e) => setSubmissionContent(e.target.value)}
                            placeholder="Enter your response, answer, or solution..."
                            disabled={submissionLoading || !!selectedAssignment.submission}
                            className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 border border-[#FFD600]/20 focus:outline-none focus:border-[#FFD600] focus:ring-2 focus:ring-[#FFD600]/20 min-h-40 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        {submissionError && (
                          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-red-400 font-semibold text-sm">Error</p>
                              <p className="text-red-300 text-sm">{submissionError}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          {!selectedAssignment.submission && (
                            <button
                              type="submit"
                              disabled={submissionLoading}
                              className="flex-1 btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <Send className="w-5 h-5" />
                              {submissionLoading ? 'Submitting...' : 'Submit Assignment'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIsSubmissionModalOpen(false);
                              setSubmissionContent('');
                              setSubmissionError('');
                            }}
                            className="flex-1 btn-3d bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-3 px-6 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                          >
                            {selectedAssignment.submission ? 'Close' : 'Cancel'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'classroom' && (
            <motion.div
              key="classroom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard>
                <div className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-[#FFD600]/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-[#e8e6e1] mb-3">Manage Your Classes</h3>
                  <p className="text-[#a8a6a1] mb-8">Join new classes, view your enrolled courses, and enter classrooms from the Classes page.</p>
                  <button 
                    onClick={() => onGoToClasses?.()}
                    className="btn-3d bg-[#FFD600] text-black font-semibold py-3 px-8 rounded-lg hover:bg-[#FFD600]/90 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Go to Classes
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <AiInsights role="student" data={{ courses, assignments, profile }} />
            </motion.div>
          )}

          {activeTab === 'ai-assistant' && (
            <motion.div
              key="ai-assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Chat Interface */}
                <div className="lg:col-span-2">
                  <ChatComponent
                    title="AI Study Assistant"
                    placeholder="Ask me anything about your studies..."
                    role="student"
                    externalMessage={aiAssistantMessage}
                    onMessageProcessed={() => setAiAssistantMessage(undefined)}
                  />
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Quick Actions</h4>
                      <div className="space-y-3">
                        {[
                          'Explain a concept',
                          'Solve a problem',
                          'Create study plan',
                          'Practice questions',
                          'Review notes'
                        ].map((action) => (
                          <button 
                            key={action} 
                            onClick={() => setAiAssistantMessage(action)}
                            className="w-full text-left p-3 bg-[#1a1a1a] text-[#e8e6e1] rounded-lg hover:bg-[#2a2a2a] transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Study Stats</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[#a8a6a1]">Questions Asked</span>
                          <span className="text-[#FFD600]">{behavior?.aiChatUsageCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a8a6a1]">Concepts Explained</span>
                          <span className="text-[#FFD600]">{Math.floor((behavior?.aiChatUsageCount || 0) * 0.4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a8a6a1]">Study Plans Created</span>
                          <span className="text-[#FFD600]">{Math.floor((behavior?.aiChatUsageCount || 0) * 0.1)}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Weekly Calendar */}
                <div className="lg:col-span-2">
                  <GlassCard>
                    <div className="p-6">
                      <h3 className="text-[#e8e6e1] font-semibold mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#FFD600]" />
                        Weekly Schedule
                      </h3>
                      
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                          <div key={day} className="text-center p-2">
                            <div className="text-[#a8a6a1] text-sm font-medium">{day}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }, (_, i) => {
                          const today = new Date();
                          const currentMonth = today.getMonth();
                          const currentYear = today.getFullYear();
                          const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
                          // Adjust firstDayOfMonth to start from Monday (0: Sun, 1: Mon...) -> (0: Mon, 6: Sun)
                          const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
                          
                          const dayNumber = i - startOffset + 1;
                          const dateObj = new Date(currentYear, currentMonth, dayNumber);
                          const isToday = dateObj.toDateString() === today.toDateString();
                          
                          const dayAssignments = assignments.filter(a => 
                            new Date(a.dueDate).toDateString() === dateObj.toDateString()
                          );
                          
                          const hasEvents = dayAssignments.length > 0;
                          
                          return (
                            <div
                              key={i}
                              className={`min-h-[80px] p-2 rounded-lg border ${
                                isToday 
                                  ? 'border-[#FFD600] bg-[#FFD600]/10' 
                                  : 'border-[#1a1a1a] bg-[#0a0a0a]'
                              }`}
                            >
                              <div className={`text-sm mb-1 ${isToday ? 'text-[#FFD600] font-semibold' : 'text-[#a8a6a1]'}`}>
                                {dayNumber > 0 && dayNumber <= new Date(currentYear, currentMonth + 1, 0).getDate() ? dayNumber : ''}
                              </div>
                              {hasEvents && (
                                <div className="space-y-1">
                                  {dayAssignments.map((a, idx) => (
                                    <div key={idx} className="w-full h-1 bg-red-500 rounded-full" title={a.title}></div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </GlassCard>
                </div>
                
                {/* Today's Schedule */}
                <div className="space-y-6">
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Today's Schedule</h4>
                      <div className="space-y-3">
                        {courses.length > 0 ? (
                          courses.map((course, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
                              <div className="w-3 h-3 rounded-full bg-[#FFD600]"></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[#e8e6e1] text-sm font-medium">{course.title}</span>
                                  <span className="text-[#a8a6a1] text-xs">{course.schedule?.startTime || 'TBD'}</span>
                                </div>
                                <span className="text-[#a8a6a1] text-xs">{course.schedule?.duration ? `${course.schedule.duration} min` : 'N/A'}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[#a8a6a1] text-sm italic">No classes scheduled for today.</p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                  
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Upcoming Deadlines</h4>
                      <div className="space-y-3">
                        {assignments.filter(a => !a.submission).length > 0 ? (
                          assignments.filter(a => !a.submission).slice(0, 5).map((assignment, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <div>
                                <div className="text-[#e8e6e1] text-sm font-medium">{assignment.title}</div>
                                <div className="text-[#a8a6a1] text-xs">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[#a8a6a1] text-sm italic">No upcoming deadlines.</p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai-schedule' && (
            <motion.div
              key="ai-schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <AiSchedule studentId={profile?._id || profile?.id} />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                  <GlassCard>
                    <div className="p-6">
                      {!isEditingProfile ? (
                        <>
                          <div className="flex items-start gap-6 mb-6">
                            <div className="w-20 h-20 rounded-full bg-[#FFD600] flex items-center justify-center">
                              <User className="w-10 h-10 text-black" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-[#e8e6e1] text-xl font-semibold mb-1">{profile?.name || 'Student'}</h3>
                              <p className="text-[#a8a6a1] mb-2">{profile?.academicInfo?.subject?.[0] || 'Student'}</p>
                              <p className="text-[#a8a6a1] text-sm">Grade: {profile?.academicInfo?.grade || 'N/A'}</p>
                              <p className="text-[#a8a6a1] text-sm">Email: {profile?.email || 'N/A'}</p>
                            </div>
                            <button 
                              onClick={() => setIsEditingProfile(true)}
                              className="btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                            >
                              Edit Profile
                            </button>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-[#e8e6e1] font-semibold mb-3">Contact Information</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-[#a8a6a1]">Email:</span>
                                  <span className="text-[#e8e6e1]">{profile?.email || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#a8a6a1]">Phone:</span>
                                  <span className="text-[#e8e6e1]">{profile?.profile?.phone || 'Not set'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#a8a6a1]">Address:</span>
                                  <span className="text-[#e8e6e1]">{profile?.profile?.address?.city || 'Not set'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-[#e8e6e1] font-semibold mb-3">Academic Information</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-[#a8a6a1]">Grade:</span>
                                  <span className="text-[#FFD600] font-semibold">{profile?.academicInfo?.grade || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#a8a6a1]">Department:</span>
                                  <span className="text-[#e8e6e1]">{profile?.academicInfo?.department || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#a8a6a1]">Status:</span>
                                  <span className="text-[#e8e6e1] capitalize">{profile?.status || 'active'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-[#e8e6e1] text-xl font-semibold">Edit Profile</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[#a8a6a1] text-sm mb-2">Full Name</label>
                              <input
                                type="text"
                                value={editedProfile?.name || ''}
                                onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                                className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                              />
                            </div>
                            <div>
                              <label className="block text-[#a8a6a1] text-sm mb-2">Phone</label>
                              <input
                                type="tel"
                                value={editedProfile?.profile?.phone || ''}
                                onChange={(e) => setEditedProfile({...editedProfile, profile: {...editedProfile?.profile, phone: e.target.value}})}
                                className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                              />
                            </div>
                            <div>
                              <label className="block text-[#a8a6a1] text-sm mb-2">City</label>
                              <input
                                type="text"
                                value={editedProfile?.profile?.address?.city || ''}
                                onChange={(e) => setEditedProfile({...editedProfile, profile: {...editedProfile?.profile, address: {...editedProfile?.profile?.address, city: e.target.value}}})}
                                className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                              />
                            </div>
                            <div>
                              <label className="block text-[#a8a6a1] text-sm mb-2">Bio</label>
                              <textarea
                                value={editedProfile?.profile?.bio || ''}
                                onChange={(e) => setEditedProfile({...editedProfile, profile: {...editedProfile?.profile, bio: e.target.value}})}
                                className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600] min-h-20"
                              />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[#a8a6a1] text-sm mb-2">Grade</label>
                                <input
                                  type="text"
                                  value={editedProfile?.academicInfo?.grade || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, academicInfo: {...editedProfile?.academicInfo, grade: e.target.value}})}
                                  className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                                />
                              </div>
                              <div>
                                <label className="block text-[#a8a6a1] text-sm mb-2">Department</label>
                                <input
                                  type="text"
                                  value={editedProfile?.academicInfo?.department || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, academicInfo: {...editedProfile?.academicInfo, department: e.target.value}})}
                                  className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                                />
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={handleSaveProfile}
                                className="btn-3d flex-1 bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setIsEditingProfile(false)}
                                className="btn-3d flex-1 bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                  
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Recent Achievements</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {(profile?.academicInfo?.achievements?.length > 0 ? profile.academicInfo.achievements : [
                          { title: 'Deans List', description: 'Fall 2025 Semester', date: 'Dec 2025', icon: 'Award' },
                          { title: 'Hackathon Winner', description: 'University Tech Challenge', date: 'Nov 2025', icon: 'Trophy' },
                          { title: 'Perfect Attendance', description: 'Computer Science Courses', date: 'Oct 2025', icon: 'Star' },
                          { title: 'Research Assistant', description: 'AI Lab Project', date: 'Sep 2025', icon: 'Brain' }
                        ]).map((achievement: any, index: number) => {
                          const iconMap: any = { Award, Trophy, Star, Brain };
                          const IconComponent = iconMap[achievement.icon] || Award;
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
                              <div className="p-2 rounded-lg bg-[#FFD600]/10">
                                <IconComponent className="w-5 h-5 text-[#FFD600]" />
                              </div>
                              <div>
                                <div className="text-[#e8e6e1] text-sm font-medium">{achievement.title}</div>
                                <div className="text-[#a8a6a1] text-xs">{achievement.description}</div>
                                <div className="text-[#a8a6a1] text-xs">{new Date(achievement.date).toLocaleDateString() === 'Invalid Date' ? achievement.date : new Date(achievement.date).toLocaleDateString()}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </GlassCard>
                </div>
                
                {/* Settings & Stats */}
                <div className="space-y-6">
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Account Settings</h4>
                      {isChangingPassword ? (
                        <form onSubmit={handleChangePassword} className="space-y-3">
                          <input
                            type="password"
                            placeholder="Current Password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                            required
                          />
                          <input
                            type="password"
                            placeholder="New Password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                            required
                          />
                          <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                            required
                          />
                          {passwordStatus && (
                            <p className={`text-sm ${passwordStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                              {passwordStatus.message}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button type="submit" className="btn-3d flex-1 bg-[#FFD600] text-black font-semibold py-2 rounded-lg">
                              Update
                            </button>
                            <button type="button" onClick={() => setIsChangingPassword(false)} className="btn-3d flex-1 bg-[#1a1a1a] text-[#e8e6e1] py-2 rounded-lg">
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-3">
                          {[
                            { label: 'Change Password', action: () => setIsChangingPassword(true) },
                            { label: 'Privacy Settings', action: () => alert('Privacy settings coming soon!') },
                            { label: 'Notification Preferences', action: () => alert('Notification preferences coming soon!') },
                            { label: 'Study Preferences', action: () => alert('Study preferences coming soon!') },
                            { label: 'Export Data', action: () => alert('Data export initiated. You will receive an email shortly.') }
                          ].map((setting) => (
                            <button 
                              key={setting.label} 
                              onClick={setting.action}
                              className="w-full text-left p-3 bg-[#1a1a1a] text-[#e8e6e1] rounded-lg hover:bg-[#2a2a2a] transition-colors"
                            >
                              {setting.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                  
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Academic Stats</h4>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-[#FFD600] text-2xl font-bold mb-1">{profile?.stats?.gpa || '0.0'}</div>
                          <div className="text-[#a8a6a1] text-sm">Current GPA</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Courses Enrolled:</span>
                            <span className="text-[#e8e6e1]">{courses.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Assignments Done:</span>
                            <span className="text-[#e8e6e1]">{assignments.filter(a => a.submission).length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Study Hours:</span>
                            <span className="text-[#e8e6e1]">{Math.round((behavior?.timeSpentOnMaterials || 0) / 60)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Achievements:</span>
                            <span className="text-[#FFD600]">{profile?.academicInfo?.achievements?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                  
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Quick Actions</h4>
                      <div className="space-y-3">
                        <button 
                          onClick={() => alert('Transcript download started...')}
                          className="w-full btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                        >
                          Download Transcript
                        </button>
                        <button 
                          onClick={() => setActiveTab('classroom')}
                          className="w-full btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                        >
                          View Course History
                        </button>
                        <button 
                          onClick={() => setActiveTab('schedule')}
                          className="w-full btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                        >
                          Academic Calendar
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
