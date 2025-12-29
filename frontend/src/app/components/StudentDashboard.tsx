import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Bot, 
  FolderKanban, 
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
  BarChart3
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { TabNavigation } from './TabNavigation';
import { ChartCard } from './ChartCard';
import { ChatComponent } from './ChatComponent';
import { AiInsights } from './AiInsights';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentDashboardProps {
  onLogout: () => void;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classroom', label: 'Classroom', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'insights', label: 'AI Insights', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'progress', label: 'Progress & Well-Being', icon: TrendingUp },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Chart Data
  const studyConsistencyData = [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 3.8 },
    { day: 'Wed', hours: 5.2 },
    { day: 'Thu', hours: 4.0 },
    { day: 'Fri', hours: 4.8 },
    { day: 'Sat', hours: 2.5 },
    { day: 'Sun', hours: 3.2 },
  ];

  const assignmentProgressData = [
    { subject: 'Math', completed: 85 },
    { subject: 'Physics', completed: 72 },
    { subject: 'CS', completed: 95 },
    { subject: 'English', completed: 68 },
  ];

  const skillsData = [
    { skill: 'Problem Solving', value: 85 },
    { skill: 'Collaboration', value: 78 },
    { skill: 'Creativity', value: 82 },
    { skill: 'Critical Thinking', value: 88 },
    { skill: 'Communication', value: 75 },
  ];

  const moodTrendData = [
    { week: 'Week 1', mood: 7 },
    { week: 'Week 2', mood: 8 },
    { week: 'Week 3', mood: 6 },
    { week: 'Week 4', mood: 9 },
  ];

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
                  { label: 'Courses Enrolled', value: '8', icon: BookOpen },
                  { label: 'Hours This Week', value: '28', icon: Clock },
                  { label: 'Achievements', value: '12', icon: Award },
                  { label: 'Average Score', value: '92%', icon: TrendingUp },
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
                          <div>
                            <p className="text-[#a8a6a1] mb-1" style={{ fontSize: '0.875rem' }}>{stat.label}</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFD600' }}>
                              {stat.value}
                            </p>
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
              <ChartCard title="Today's Tasks" description="Your schedule for today">
                <div className="space-y-3">
                  {[
                    { task: 'Math Assignment Due', time: '2:00 PM', status: 'upcoming' },
                    { task: 'Physics Lab Report', time: '4:00 PM', status: 'in-progress' },
                    { task: 'Computer Science Quiz', time: '6:00 PM', status: 'upcoming' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'in-progress' ? 'bg-[#FFD600] animate-pulse' : 'bg-[#a8a6a1]'}`} />
                        <span className="text-[#e8e6e1]">{item.task}</span>
                      </div>
                      <span className="text-[#a8a6a1]" style={{ fontSize: '0.875rem' }}>{item.time}</span>
                    </div>
                  ))}
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
                  { label: 'Study Streak', value: '12 days', icon: Heart, color: '#FFD600' },
                  { label: 'Focus Time', value: '45 min avg', icon: Brain, color: '#FFD600' },
                  { label: 'Energy Level', value: 'Stable', icon: TrendingUp, color: '#FFD600' },
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

          {activeTab === 'classroom' && (
            <motion.div
              key="classroom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    title: 'Advanced Mathematics',
                    teacher: 'Dr. Sarah Johnson',
                    schedule: 'Mon, Wed 10:00 AM',
                    progress: 85,
                    students: 28,
                    nextClass: 'Today, 10:00 AM'
                  },
                  {
                    title: 'Physics Fundamentals',
                    teacher: 'Prof. Michael Chen',
                    schedule: 'Tue, Thu 2:00 PM',
                    progress: 72,
                    students: 32,
                    nextClass: 'Tomorrow, 2:00 PM'
                  },
                  {
                    title: 'Computer Science',
                    teacher: 'Ms. Emily Davis',
                    schedule: 'Mon, Wed, Fri 1:00 PM',
                    progress: 95,
                    students: 25,
                    nextClass: 'Friday, 1:00 PM'
                  },
                  {
                    title: 'English Literature',
                    teacher: 'Mr. James Wilson',
                    schedule: 'Tue, Thu 9:00 AM',
                    progress: 68,
                    students: 30,
                    nextClass: 'Tuesday, 9:00 AM'
                  },
                  {
                    title: 'Chemistry Lab',
                    teacher: 'Dr. Lisa Brown',
                    schedule: 'Wed, Fri 3:00 PM',
                    progress: 78,
                    students: 20,
                    nextClass: 'Wednesday, 3:00 PM'
                  },
                  {
                    title: 'History & Society',
                    teacher: 'Mr. Robert Taylor',
                    schedule: 'Mon, Thu 11:00 AM',
                    progress: 82,
                    students: 35,
                    nextClass: 'Monday, 11:00 AM'
                  }
                ].map((course, index) => (
                  <motion.div
                    key={course.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <GlassCard>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-[#e8e6e1] font-semibold mb-1">{course.title}</h3>
                            <p className="text-[#a8a6a1] text-sm">{course.teacher}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-[#FFD600] font-bold">{course.progress}%</div>
                            <div className="text-[#a8a6a1] text-xs">Progress</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Schedule:</span>
                            <span className="text-[#e8e6e1]">{course.schedule}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Students:</span>
                            <span className="text-[#e8e6e1]">{course.students}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Next Class:</span>
                            <span className="text-[#FFD600]">{course.nextClass}</span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-[#1a1a1a] rounded-full h-2 mb-4">
                          <div 
                            className="bg-[#FFD600] h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        
                        <button className="w-full btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors">
                          Join Class
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
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
                {[
                  {
                    title: 'Calculus Problem Set #5',
                    subject: 'Mathematics',
                    dueDate: 'Dec 28, 2025',
                    status: 'pending',
                    priority: 'high',
                    grade: null,
                    description: 'Complete problems 1-15 from chapter 7'
                  },
                  {
                    title: 'Physics Lab Report: Motion',
                    subject: 'Physics',
                    dueDate: 'Dec 30, 2025',
                    status: 'in-progress',
                    priority: 'medium',
                    grade: null,
                    description: 'Analyze projectile motion data and write conclusions'
                  },
                  {
                    title: 'Algorithm Implementation',
                    subject: 'Computer Science',
                    dueDate: 'Dec 26, 2025',
                    status: 'submitted',
                    priority: 'high',
                    grade: '95/100',
                    description: 'Implement sorting algorithms in Python'
                  },
                  {
                    title: 'Shakespeare Essay',
                    subject: 'English',
                    dueDate: 'Jan 2, 2026',
                    status: 'pending',
                    priority: 'low',
                    grade: null,
                    description: 'Compare themes in Romeo and Juliet'
                  },
                  {
                    title: 'Chemical Reactions Lab',
                    subject: 'Chemistry',
                    dueDate: 'Dec 29, 2025',
                    status: 'overdue',
                    priority: 'high',
                    grade: null,
                    description: 'Conduct experiments and record observations'
                  }
                ].map((assignment, index) => (
                  <motion.div
                    key={assignment.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <GlassCard>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-[#e8e6e1] font-semibold">{assignment.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assignment.status === 'submitted' ? 'bg-green-500/20 text-green-400' :
                                assignment.status === 'in-progress' ? 'bg-[#FFD600]/20 text-[#FFD600]' :
                                assignment.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {assignment.status === 'submitted' ? 'Submitted' :
                                 assignment.status === 'in-progress' ? 'In Progress' :
                                 assignment.status === 'overdue' ? 'Overdue' : 'Pending'}
                              </span>
                              {assignment.priority === 'high' && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                  High Priority
                                </span>
                              )}
                            </div>
                            <p className="text-[#a8a6a1] text-sm mb-2">{assignment.subject}</p>
                            <p className="text-[#a8a6a1] text-sm">{assignment.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-[#FFD600] font-semibold mb-1">Due: {assignment.dueDate}</div>
                            {assignment.grade && (
                              <div className="text-green-400 font-semibold">Grade: {assignment.grade}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <button className="btn-3d bg-[#FFD600] text-black font-semibold py-2 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors">
                            {assignment.status === 'submitted' ? 'View Submission' : 'Start Assignment'}
                          </button>
                          {assignment.status !== 'submitted' && (
                            <button className="btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 px-6 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                              Upload Files
                            </button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
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
                          <button key={action} className="w-full text-left p-3 bg-[#1a1a1a] text-[#e8e6e1] rounded-lg hover:bg-[#2a2a2a] transition-colors">
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
                          <span className="text-[#FFD600]">47</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a8a6a1]">Concepts Explained</span>
                          <span className="text-[#FFD600]">23</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a8a6a1]">Study Plans Created</span>
                          <span className="text-[#FFD600]">5</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
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
              <AiInsights 
                role="student" 
                data={{ 
                  grades: assignmentProgressData, 
                  skills: skillsData,
                  studyConsistency: studyConsistencyData 
                }} 
              />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {[
                  {
                    title: 'Smart Campus Navigation App',
                    description: 'Develop an app to help students navigate campus efficiently',
                    team: ['Alice Johnson', 'Bob Smith', 'Charlie Brown'],
                    deadline: 'Feb 15, 2026',
                    status: 'in-progress',
                    progress: 65,
                    technologies: ['React Native', 'Node.js', 'MongoDB']
                  },
                  {
                    title: 'AI Study Planner',
                    description: 'Create an AI-powered study schedule generator',
                    team: ['Diana Prince', 'Eve Wilson'],
                    deadline: 'Jan 30, 2026',
                    status: 'planning',
                    progress: 20,
                    technologies: ['Python', 'TensorFlow', 'React']
                  },
                  {
                    title: 'Virtual Chemistry Lab',
                    description: 'Build a virtual reality chemistry laboratory',
                    team: ['Frank Miller', 'Grace Lee', 'Henry Davis', 'Ivy Chen'],
                    deadline: 'Mar 10, 2026',
                    status: 'in-progress',
                    progress: 40,
                    technologies: ['Unity', 'C#', 'VR SDK']
                  },
                  {
                    title: 'Campus Sustainability Dashboard',
                    description: 'Monitor and visualize campus environmental impact',
                    team: ['Jack Taylor', 'Kate Wilson'],
                    deadline: 'Feb 28, 2026',
                    status: 'completed',
                    progress: 100,
                    technologies: ['React', 'D3.js', 'Node.js']
                  }
                ].map((project, index) => (
                  <motion.div
                    key={project.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <GlassCard>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-[#e8e6e1] font-semibold mb-2">{project.title}</h3>
                            <p className="text-[#a8a6a1] text-sm mb-3">{project.description}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.technologies.map((tech) => (
                                <span key={tech} className="px-2 py-1 bg-[#FFD600]/10 text-[#FFD600] text-xs rounded-full">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            project.status === 'in-progress' ? 'bg-[#FFD600]/20 text-[#FFD600]' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {project.status === 'completed' ? 'Completed' :
                             project.status === 'in-progress' ? 'In Progress' : 'Planning'}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Team:</span>
                            <span className="text-[#e8e6e1]">{project.team.length} members</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Deadline:</span>
                            <span className="text-[#FFD600]">{project.deadline}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Progress:</span>
                            <span className="text-[#e8e6e1]">{project.progress}%</span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-[#1a1a1a] rounded-full h-2 mb-4">
                          <div 
                            className="bg-[#FFD600] h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="flex-1 btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors">
                            View Project
                          </button>
                          <button className="btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                            <User className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
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
                          const day = i - 3; // Start from Monday
                          const isToday = day === 26; // December 26
                          const hasEvents = [10, 12, 14, 16, 18, 20, 26].includes(day);
                          
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
                                {day > 0 && day <= 31 ? day : ''}
                              </div>
                              {hasEvents && (
                                <div className="space-y-1">
                                  <div className="w-full h-1 bg-[#FFD600] rounded-full"></div>
                                  {day === 26 && <div className="w-3/4 h-1 bg-[#FFD600]/60 rounded-full"></div>}
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
                        {[
                          { time: '9:00 AM', subject: 'Mathematics', type: 'class', duration: '90 min' },
                          { time: '11:00 AM', subject: 'Physics Lab', type: 'lab', duration: '120 min' },
                          { time: '2:00 PM', subject: 'Study Session', type: 'study', duration: '60 min' },
                          { time: '4:00 PM', subject: 'Computer Science', type: 'class', duration: '90 min' },
                          { time: '6:00 PM', subject: 'Assignment Due', type: 'deadline', duration: 'Math Quiz' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
                            <div className={`w-3 h-3 rounded-full ${
                              item.type === 'class' ? 'bg-[#FFD600]' :
                              item.type === 'lab' ? 'bg-blue-500' :
                              item.type === 'study' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[#e8e6e1] text-sm font-medium">{item.subject}</span>
                                <span className="text-[#a8a6a1] text-xs">{item.time}</span>
                              </div>
                              <span className="text-[#a8a6a1] text-xs">{item.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                  
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Upcoming Events</h4>
                      <div className="space-y-3">
                        {[
                          { title: 'Mid-term Exams', date: 'Jan 15-20, 2026', type: 'exam' },
                          { title: 'Project Presentation', date: 'Jan 10, 2026', type: 'presentation' },
                          { title: 'Career Fair', date: 'Feb 5, 2026', type: 'event' },
                          { title: 'Spring Break', date: 'Mar 10-14, 2026', type: 'holiday' }
                        ].map((event, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
                            <div className={`w-2 h-2 rounded-full ${
                              event.type === 'exam' ? 'bg-red-500' :
                              event.type === 'presentation' ? 'bg-[#FFD600]' :
                              event.type === 'event' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <div>
                              <div className="text-[#e8e6e1] text-sm font-medium">{event.title}</div>
                              <div className="text-[#a8a6a1] text-xs">{event.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
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
                      <div className="flex items-start gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-[#FFD600] flex items-center justify-center">
                          <User className="w-10 h-10 text-black" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#e8e6e1] text-xl font-semibold mb-1">Alex Johnson</h3>
                          <p className="text-[#a8a6a1] mb-2">Computer Science Major</p>
                          <p className="text-[#a8a6a1] text-sm">Student ID: CS2024001</p>
                          <p className="text-[#a8a6a1] text-sm">Year: Junior (3rd Year)</p>
                        </div>
                        <button className="btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors">
                          Edit Profile
                        </button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-[#e8e6e1] font-semibold mb-3">Contact Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-[#a8a6a1]">Email:</span>
                              <span className="text-[#e8e6e1]">alex.johnson@university.edu</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a8a6a1]">Phone:</span>
                              <span className="text-[#e8e6e1]">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a8a6a1]">Address:</span>
                              <span className="text-[#e8e6e1]">Campus Dorm #204</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-[#e8e6e1] font-semibold mb-3">Academic Information</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-[#a8a6a1]">GPA:</span>
                              <span className="text-[#FFD600] font-semibold">3.8/4.0</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a8a6a1]">Credits:</span>
                              <span className="text-[#e8e6e1]">87/120</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#a8a6a1]">Major:</span>
                              <span className="text-[#e8e6e1]">Computer Science</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                  
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Recent Achievements</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { title: 'Deans List', description: 'Fall 2025 Semester', date: 'Dec 2025', icon: Award },
                          { title: 'Hackathon Winner', description: 'University Tech Challenge', date: 'Nov 2025', icon: Trophy },
                          { title: 'Perfect Attendance', description: 'Computer Science Courses', date: 'Oct 2025', icon: Star },
                          { title: 'Research Assistant', description: 'AI Lab Project', date: 'Sep 2025', icon: Brain }
                        ].map((achievement, index) => {
                          const IconComponent = achievement.icon;
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg">
                              <div className="p-2 rounded-lg bg-[#FFD600]/10">
                                <IconComponent className="w-5 h-5 text-[#FFD600]" />
                              </div>
                              <div>
                                <div className="text-[#e8e6e1] text-sm font-medium">{achievement.title}</div>
                                <div className="text-[#a8a6a1] text-xs">{achievement.description}</div>
                                <div className="text-[#a8a6a1] text-xs">{achievement.date}</div>
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
                      <div className="space-y-3">
                        {[
                          'Change Password',
                          'Privacy Settings',
                          'Notification Preferences',
                          'Study Preferences',
                          'Export Data'
                        ].map((setting) => (
                          <button key={setting} className="w-full text-left p-3 bg-[#1a1a1a] text-[#e8e6e1] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                            {setting}
                          </button>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                  
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Academic Stats</h4>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-[#FFD600] text-2xl font-bold mb-1">3.8</div>
                          <div className="text-[#a8a6a1] text-sm">Current GPA</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Courses Completed:</span>
                            <span className="text-[#e8e6e1]">24</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Assignments Done:</span>
                            <span className="text-[#e8e6e1]">156</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Study Hours:</span>
                            <span className="text-[#e8e6e1]">487</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Achievements:</span>
                            <span className="text-[#FFD600]">12</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                  
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Quick Actions</h4>
                      <div className="space-y-3">
                        <button className="w-full btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors">
                          Download Transcript
                        </button>
                        <button className="w-full btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                          View Course History
                        </button>
                        <button className="w-full btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors">
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
