import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Calendar, 
  Bot, 
  User,
  LogOut,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  BookOpen
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { TabNavigation } from './TabNavigation';
import { ChartCard } from './ChartCard';
import { ChatComponent } from './ChatComponent';
import { AiInsights } from './AiInsights';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TeacherDashboardProps {
  onLogout: () => void;
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'insights', label: 'Student Insights', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'ai-support', label: 'AI Support', icon: Bot },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Chart Data
  const submissionTrendsData = [
    { week: 'Week 1', submissions: 28, onTime: 25 },
    { week: 'Week 2', submissions: 30, onTime: 28 },
    { week: 'Week 3', submissions: 26, onTime: 22 },
    { week: 'Week 4', submissions: 32, onTime: 30 },
  ];

  const participationData = [
    { class: 'Math 101', active: 28, moderate: 4, low: 0 },
    { class: 'Physics', active: 20, moderate: 3, low: 1 },
    { class: 'CS 201', active: 25, moderate: 2, low: 1 },
  ];

  const assignmentStatusData = [
    { name: 'Completed', value: 68, color: '#FFD600' },
    { name: 'In Progress', value: 22, color: '#FFB800' },
    { name: 'Not Started', value: 10, color: '#a8a6a1' },
  ];

  const engagementHeatmapData = [
    { day: 'Mon', engagement: 85 },
    { day: 'Tue', engagement: 78 },
    { day: 'Wed', engagement: 92 },
    { day: 'Thu', engagement: 88 },
    { day: 'Fri', engagement: 75 },
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
              Teacher Portal
            </h1>
            <p className="text-[#a8a6a1]">Manage your classes and inspire students</p>
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
                  { label: 'Total Students', value: '84', icon: Users },
                  { label: 'Active Classes', value: '5', icon: FileText },
                  { label: 'Avg Engagement', value: '86%', icon: TrendingUp },
                  { label: 'Messages', value: '8', icon: MessageSquare },
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

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Submission Trends" description="Weekly assignment completion">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={submissionTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                      <XAxis dataKey="week" stroke="#a8a6a1" />
                      <YAxis stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="submissions" fill="#FFD600" radius={[8, 8, 0, 0]} animationDuration={1500} />
                      <Bar dataKey="onTime" fill="#FFB800" radius={[8, 8, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Class Participation Levels" description="Engagement breakdown by class">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={participationData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                      <XAxis type="number" stroke="#a8a6a1" />
                      <YAxis dataKey="class" type="category" stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="active" stackId="a" fill="#FFD600" radius={[0, 8, 8, 0]} animationDuration={1500} />
                      <Bar dataKey="moderate" stackId="a" fill="#FFB800" animationDuration={1500} />
                      <Bar dataKey="low" stackId="a" fill="#a8a6a1" radius={[0, 8, 8, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              {/* Quick Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <ChartCard title="Today's Schedule">
                  <div className="space-y-3">
                    {[
                      { class: 'Mathematics 101', time: '9:00 AM - 10:30 AM', students: 32 },
                      { class: 'Physics Advanced', time: '2:00 PM - 3:30 PM', students: 24 },
                      { class: 'Computer Science', time: '4:00 PM - 5:30 PM', students: 28 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl">
                        <div>
                          <p className="text-[#e8e6e1] mb-1">{item.class}</p>
                          <div className="flex items-center gap-3 text-[#a8a6a1]" style={{ fontSize: '0.875rem' }}>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {item.students}
                            </span>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-[#FFD600]" />
                      </div>
                    ))}
                  </div>
                </ChartCard>

                <ChartCard title="Pending Reviews">
                  <div className="space-y-3">
                    {[
                      { assignment: 'Math Quiz #3', submissions: 28, pending: 4 },
                      { assignment: 'Physics Lab Report', submissions: 20, pending: 4 },
                      { assignment: 'CS Project Phase 1', submissions: 24, pending: 4 },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#1a1a1a] rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[#e8e6e1]">{item.assignment}</p>
                          <span className="text-[#FFD600]" style={{ fontWeight: 600 }}>
                            {item.pending} pending
                          </span>
                        </div>
                        <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FFD600] to-[#FFB800] rounded-full"
                            style={{ width: `${(item.submissions / (item.submissions + item.pending)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Assignment Status Distribution" description="Overall completion rates">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={assignmentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {assignmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Weekly Engagement Heatmap" description="Student activity by day">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementHeatmapData}>
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
                      <Bar
                        dataKey="engagement"
                        fill="#FFD600"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <ChartCard title="Export Reports">
                <div className="grid md:grid-cols-3 gap-4">
                  {['Class Performance Report', 'Student Progress Summary', 'Engagement Analytics'].map((report, idx) => (
                    <button
                      key={idx}
                      className="btn-3d p-4 bg-[#1a1a1a] text-[#e8e6e1] rounded-xl hover:bg-[#2a2a2a] transition-colors text-center"
                    >
                      <FileText className="w-6 h-6 text-[#FFD600] mx-auto mb-2" />
                      <span style={{ fontSize: '0.875rem' }}>{report}</span>
                    </button>
                  ))}
                </div>
              </ChartCard>
            </motion.div>
          )}

          {activeTab === 'classes' && (
            <motion.div
              key="classes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    title: 'Mathematics 101',
                    code: 'MATH-101',
                    students: 32,
                    schedule: 'Mon, Wed 9:00 AM',
                    room: 'Room 204',
                    avgGrade: '85%',
                    nextClass: 'Today, 9:00 AM'
                  },
                  {
                    title: 'Physics Advanced',
                    code: 'PHYS-201',
                    students: 24,
                    schedule: 'Tue, Thu 2:00 PM',
                    room: 'Lab 301',
                    avgGrade: '78%',
                    nextClass: 'Tomorrow, 2:00 PM'
                  },
                  {
                    title: 'Computer Science',
                    code: 'CS-201',
                    students: 28,
                    schedule: 'Mon, Wed, Fri 1:00 PM',
                    room: 'Room 105',
                    avgGrade: '92%',
                    nextClass: 'Friday, 1:00 PM'
                  },
                  {
                    title: 'Chemistry Lab',
                    code: 'CHEM-101',
                    students: 20,
                    schedule: 'Wed, Fri 3:00 PM',
                    room: 'Lab 402',
                    avgGrade: '88%',
                    nextClass: 'Wednesday, 3:00 PM'
                  },
                  {
                    title: 'English Literature',
                    code: 'ENG-201',
                    students: 30,
                    schedule: 'Tue, Thu 11:00 AM',
                    room: 'Room 112',
                    avgGrade: '82%',
                    nextClass: 'Tuesday, 11:00 AM'
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
                            <p className="text-[#a8a6a1] text-sm">{course.code}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-[#FFD600] font-bold">{course.avgGrade}</div>
                            <div className="text-[#a8a6a1] text-xs">Avg Grade</div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Students:</span>
                            <span className="text-[#e8e6e1]">{course.students}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Schedule:</span>
                            <span className="text-[#e8e6e1]">{course.schedule}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Room:</span>
                            <span className="text-[#e8e6e1]">{course.room}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Next Class:</span>
                            <span className="text-[#FFD600]">{course.nextClass}</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button className="flex-1 btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors">
                            Start Class
                          </button>
                          <button className="btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                            <Users className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <ChartCard title="Class Performance Overview">
                  <div className="space-y-4">
                    {[
                      { subject: 'Mathematics 101', avgGrade: 85, attendance: 92, submissions: 88 },
                      { subject: 'Physics Advanced', avgGrade: 78, attendance: 88, submissions: 85 },
                      { subject: 'Computer Science', avgGrade: 92, attendance: 95, submissions: 90 },
                      { subject: 'Chemistry Lab', avgGrade: 88, attendance: 90, submissions: 87 },
                      { subject: 'English Literature', avgGrade: 82, attendance: 89, submissions: 84 }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-[#1a1a1a] rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[#e8e6e1] font-medium">{item.subject}</span>
                          <span className="text-[#FFD600] font-bold">{item.avgGrade}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-[#a8a6a1]">Attendance:</span>
                            <span className="text-[#e8e6e1] ml-2">{item.attendance}%</span>
                          </div>
                          <div>
                            <span className="text-[#a8a6a1]">Submissions:</span>
                            <span className="text-[#e8e6e1] ml-2">{item.submissions}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                <ChartCard title="Quick Actions">
                  <div className="space-y-3">
                    {[
                      { action: 'Create New Assignment', icon: FileText },
                      { action: 'Send Announcement', icon: MessageSquare },
                      { action: 'Grade Submissions', icon: CheckCircle },
                      { action: 'Schedule Office Hours', icon: Calendar },
                      { action: 'Export Class Report', icon: BarChart3 }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button key={idx} className="w-full flex items-center gap-3 p-4 bg-[#1a1a1a] text-[#e8e6e1] rounded-xl hover:bg-[#2a2a2a] transition-colors">
                          <Icon className="w-5 h-5 text-[#FFD600]" />
                          <span>{item.action}</span>
                        </button>
                      );
                    })}
                  </div>
                </ChartCard>
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
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Assignment Overview">
                  <div className="space-y-4">
                    {[
                      { title: 'Math Quiz #3', class: 'Mathematics 101', dueDate: 'Dec 28, 2025', submitted: 28, total: 32, avgGrade: '84%' },
                      { title: 'Physics Lab Report', class: 'Physics Advanced', dueDate: 'Dec 30, 2025', submitted: 20, total: 24, avgGrade: '78%' },
                      { title: 'Algorithm Implementation', class: 'Computer Science', dueDate: 'Dec 26, 2025', submitted: 24, total: 28, avgGrade: '91%' },
                      { title: 'Chemical Reactions Lab', class: 'Chemistry Lab', dueDate: 'Dec 29, 2025', submitted: 18, total: 20, avgGrade: '86%' },
                      { title: 'Shakespeare Essay', class: 'English Literature', dueDate: 'Jan 2, 2026', submitted: 25, total: 30, avgGrade: '82%' }
                    ].map((assignment, idx) => (
                      <div key={idx} className="p-4 bg-[#1a1a1a] rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-[#e8e6e1] font-medium">{assignment.title}</h4>
                            <p className="text-[#a8a6a1] text-sm">{assignment.class}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-[#FFD600] font-bold">{assignment.avgGrade}</div>
                            <div className="text-[#a8a6a1] text-xs">Avg Grade</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-[#a8a6a1]">Due: {assignment.dueDate}</span>
                          <span className="text-[#e8e6e1]">{assignment.submitted}/{assignment.total} submitted</span>
                        </div>
                        <div className="w-full bg-[#0a0a0a] rounded-full h-2">
                          <div
                            className="bg-[#FFD600] h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                <ChartCard title="Recent Submissions">
                  <div className="space-y-3">
                    {[
                      { student: 'Alice Johnson', assignment: 'Math Quiz #3', submitted: '2 hours ago', grade: '95/100' },
                      { student: 'Bob Smith', assignment: 'Physics Lab Report', submitted: '4 hours ago', grade: 'Pending' },
                      { student: 'Charlie Brown', assignment: 'Algorithm Implementation', submitted: '6 hours ago', grade: '88/100' },
                      { student: 'Diana Prince', assignment: 'Chemical Reactions Lab', submitted: '1 day ago', grade: '92/100' },
                      { student: 'Eve Wilson', assignment: 'Shakespeare Essay', submitted: '2 days ago', grade: 'Pending' }
                    ].map((submission, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FFD600] flex items-center justify-center">
                              <span className="text-black text-xs font-bold">
                                {submission.student.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-[#e8e6e1] text-sm font-medium">{submission.student}</p>
                              <p className="text-[#a8a6a1] text-xs">{submission.assignment}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#FFD600] text-sm font-medium">{submission.grade}</p>
                          <p className="text-[#a8a6a1] text-xs">{submission.submitted}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>

              <ChartCard title="Assignment Management">
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { action: 'Create Assignment', icon: FileText, color: '#FFD600' },
                    { action: 'Grade Submissions', icon: CheckCircle, color: '#FFD600' },
                    { action: 'Send Reminders', icon: MessageSquare, color: '#FFD600' },
                    { action: 'View Analytics', icon: BarChart3, color: '#FFD600' }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button key={idx} className="btn-3d p-6 bg-[#1a1a1a] text-[#e8e6e1] rounded-xl hover:bg-[#2a2a2a] transition-colors text-center">
                        <Icon className="w-8 h-8 text-[#FFD600] mx-auto mb-3" />
                        <span style={{ fontSize: '0.875rem' }}>{item.action}</span>
                      </button>
                    );
                  })}
                </div>
              </ChartCard>
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
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Student Performance Distribution" description="Grade distribution across all classes">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { range: '90-100', count: 28 },
                      { range: '80-89', count: 35 },
                      { range: '70-79', count: 18 },
                      { range: '60-69', count: 8 },
                      { range: 'Below 60', count: 3 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                      <XAxis dataKey="range" stroke="#a8a6a1" />
                      <YAxis stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Bar dataKey="count" fill="#FFD600" radius={[8, 8, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Learning Patterns" description="Study habits and engagement trends">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { week: 'Week 1', engagement: 75, studyHours: 12 },
                      { week: 'Week 2', engagement: 82, studyHours: 15 },
                      { week: 'Week 3', engagement: 78, studyHours: 13 },
                      { week: 'Week 4', engagement: 88, studyHours: 16 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 214, 0, 0.1)" />
                      <XAxis dataKey="week" stroke="#a8a6a1" />
                      <YAxis yAxisId="left" stroke="#a8a6a1" />
                      <YAxis yAxisId="right" orientation="right" stroke="#a8a6a1" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 20, 20, 0.95)',
                          border: '1px solid rgba(255, 214, 0, 0.2)',
                          borderRadius: '12px',
                          color: '#e8e6e1',
                        }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="engagement" stroke="#FFD600" strokeWidth={3} dot={{ fill: '#FFD600', r: 6 }} animationDuration={1500} />
                      <Line yAxisId="right" type="monotone" dataKey="studyHours" stroke="#FFB800" strokeWidth={3} dot={{ fill: '#FFB800', r: 6 }} animationDuration={1500} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <ChartCard title="At-Risk Students">
                  <div className="space-y-3">
                    {[
                      { name: 'John Doe', grade: '65%', attendance: '72%', risk: 'High' },
                      { name: 'Jane Smith', grade: '68%', attendance: '78%', risk: 'Medium' },
                      { name: 'Mike Johnson', grade: '62%', attendance: '69%', risk: 'High' }
                    ].map((student, idx) => (
                      <div key={idx} className="p-3 bg-[#1a1a1a] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#e8e6e1] font-medium">{student.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.risk === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {student.risk} Risk
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-[#a8a6a1]">Grade:</span>
                            <span className="text-[#e8e6e1] ml-1">{student.grade}</span>
                          </div>
                          <div>
                            <span className="text-[#a8a6a1]">Attendance:</span>
                            <span className="text-[#e8e6e1] ml-1">{student.attendance}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                <ChartCard title="Top Performers">
                  <div className="space-y-3">
                    {[
                      { name: 'Alice Johnson', grade: '98%', improvement: '+5%' },
                      { name: 'Charlie Brown', grade: '96%', improvement: '+3%' },
                      { name: 'Diana Prince', grade: '95%', improvement: '+7%' }
                    ].map((student, idx) => (
                      <div key={idx} className="p-3 bg-[#1a1a1a] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#e8e6e1] font-medium">{student.name}</span>
                          <span className="text-green-400 text-sm">{student.improvement}</span>
                        </div>
                        <div className="text-[#FFD600] font-bold">{student.grade}</div>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                <ChartCard title="Subject Performance">
                  <div className="space-y-3">
                    {[
                      { subject: 'Mathematics', avgGrade: 85, trend: 'up' },
                      { subject: 'Physics', avgGrade: 78, trend: 'stable' },
                      { subject: 'Computer Science', avgGrade: 92, trend: 'up' },
                      { subject: 'Chemistry', avgGrade: 88, trend: 'up' },
                      { subject: 'English', avgGrade: 82, trend: 'down' }
                    ].map((subject, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                        <span className="text-[#e8e6e1]">{subject.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#FFD600] font-bold">{subject.avgGrade}%</span>
                          <TrendingUp className={`w-4 h-4 ${
                            subject.trend === 'up' ? 'text-green-400' : 
                            subject.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
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
                {/* Calendar View */}
                <div className="lg:col-span-2">
                  <ChartCard title="Weekly Schedule">
                    <div className="space-y-4">
                      {[
                        { day: 'Monday', date: 'Dec 30', classes: [
                          { time: '9:00 AM - 10:30 AM', subject: 'Mathematics 101', room: 'Room 204', students: 32 },
                          { time: '1:00 PM - 2:30 PM', subject: 'Computer Science', room: 'Room 105', students: 28 },
                          { time: '4:00 PM - 5:30 PM', subject: 'Office Hours', room: 'Room 204', students: null }
                        ]},
                        { day: 'Tuesday', date: 'Dec 31', classes: [
                          { time: '11:00 AM - 12:30 PM', subject: 'English Literature', room: 'Room 112', students: 30 },
                          { time: '2:00 PM - 3:30 PM', subject: 'Physics Advanced', room: 'Lab 301', students: 24 }
                        ]},
                        { day: 'Wednesday', date: 'Jan 1', classes: [
                          { time: '9:00 AM - 10:30 AM', subject: 'Mathematics 101', room: 'Room 204', students: 32 },
                          { time: '3:00 PM - 4:30 PM', subject: 'Chemistry Lab', room: 'Lab 402', students: 20 }
                        ]},
                        { day: 'Thursday', date: 'Jan 2', classes: [
                          { time: '11:00 AM - 12:30 PM', subject: 'English Literature', room: 'Room 112', students: 30 },
                          { time: '2:00 PM - 3:30 PM', subject: 'Physics Advanced', room: 'Lab 301', students: 24 }
                        ]},
                        { day: 'Friday', date: 'Jan 3', classes: [
                          { time: '1:00 PM - 2:30 PM', subject: 'Computer Science', room: 'Room 105', students: 28 },
                          { time: '3:00 PM - 4:30 PM', subject: 'Chemistry Lab', room: 'Lab 402', students: 20 }
                        ]}
                      ].map((daySchedule, dayIdx) => (
                        <div key={dayIdx} className="border border-[#FFD600]/20 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="text-[#FFD600] font-bold">{daySchedule.day}</div>
                            <div className="text-[#a8a6a1]">{daySchedule.date}</div>
                          </div>
                          <div className="space-y-3">
                            {daySchedule.classes.map((classItem, classIdx) => (
                              <div key={classIdx} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-[#FFD600]"></div>
                                  <div>
                                    <div className="text-[#e8e6e1] font-medium">{classItem.subject}</div>
                                    <div className="text-[#a8a6a1] text-sm">{classItem.time} • {classItem.room}</div>
                                  </div>
                                </div>
                                {classItem.students && (
                                  <div className="flex items-center gap-1 text-[#a8a6a1] text-sm">
                                    <Users className="w-4 h-4" />
                                    {classItem.students}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <ChartCard title="Today's Classes">
                    <div className="space-y-3">
                      {[
                        { time: '9:00 AM', subject: 'Mathematics 101', room: 'Room 204', status: 'upcoming' },
                        { time: '1:00 PM', subject: 'Computer Science', room: 'Room 105', status: 'upcoming' },
                        { time: '4:00 PM', subject: 'Office Hours', room: 'Room 204', status: 'upcoming' }
                      ].map((classItem, idx) => (
                        <div key={idx} className="p-3 bg-[#1a1a1a] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[#FFD600] font-bold">{classItem.time}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              classItem.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                              classItem.status === 'in-progress' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {classItem.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                            </span>
                          </div>
                          <div className="text-[#e8e6e1] font-medium mb-1">{classItem.subject}</div>
                          <div className="text-[#a8a6a1] text-sm">{classItem.room}</div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>

                  <ChartCard title="Quick Actions">
                    <div className="space-y-3">
                      {[
                        { action: 'Add Event', icon: Calendar },
                        { action: 'Set Reminder', icon: Clock },
                        { action: 'Cancel Class', icon: MessageSquare },
                        { action: 'Reschedule', icon: Calendar }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button key={idx} className="w-full flex items-center gap-3 p-3 bg-[#1a1a1a] text-[#e8e6e1] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                            <Icon className="w-4 h-4 text-[#FFD600]" />
                            <span className="text-sm">{item.action}</span>
                          </button>
                        );
                      })}
                    </div>
                  </ChartCard>

                  <ChartCard title="Schedule Stats">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#a8a6a1]">Classes This Week</span>
                        <span className="text-[#FFD600]">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a8a6a1]">Office Hours</span>
                        <span className="text-[#FFD600]">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#a8a6a1]">Total Hours</span>
                        <span className="text-[#FFD600]">18.5</span>
                      </div>
                    </div>
                  </ChartCard>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai-support' && (
            <motion.div
              key="ai-support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid lg:grid-cols-3 gap-6">
                {/* AI Chat Interface */}
                <div className="lg:col-span-2">
                  <ChatComponent
                    title="AI Teaching Assistant"
                    placeholder="Ask me anything about teaching, lesson planning, or student assessment..."
                    role="teacher"
                  />
                </div>

                {/* Quick Actions & Features */}
                <div className="space-y-6">
                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">AI Features</h4>
                      <div className="space-y-3">
                        {[
                          'Generate Quiz Questions',
                          'Create Lesson Plans',
                          'Analyze Student Performance',
                          'Suggest Teaching Strategies',
                          'Grade Assignments',
                          'Create Study Materials'
                        ].map((feature) => (
                          <button key={feature} className="w-full text-left p-3 bg-[#1a1a1a] text-[#e8e6e1] rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm">
                            {feature}
                          </button>
                        ))}
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Recent AI Activities</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#a8a6a1]">Quizzes Generated</span>
                          <span className="text-[#FFD600]">12</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#a8a6a1]">Lesson Plans Created</span>
                          <span className="text-[#FFD600]">8</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#a8a6a1]">Performance Analysis</span>
                          <span className="text-[#FFD600]">15</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#a8a6a1]">Study Materials</span>
                          <span className="text-[#FFD600]">23</span>
                        </div>
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
                      <h3 className="text-[#e8e6e1] font-semibold mb-6">Profile Information</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[#a8a6a1] text-sm mb-2">Full Name</label>
                            <input
                              type="text"
                              defaultValue="Dr. Sarah Johnson"
                              className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                            />
                          </div>
                          <div>
                            <label className="block text-[#a8a6a1] text-sm mb-2">Email</label>
                            <input
                              type="email"
                              defaultValue="sarah.johnson@university.edu"
                              className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                            />
                          </div>
                          <div>
                            <label className="block text-[#a8a6a1] text-sm mb-2">Department</label>
                            <input
                              type="text"
                              defaultValue="Mathematics & Computer Science"
                              className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[#a8a6a1] text-sm mb-2">Employee ID</label>
                            <input
                              type="text"
                              defaultValue="PROF-2023-045"
                              className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                            />
                          </div>
                          <div>
                            <label className="block text-[#a8a6a1] text-sm mb-2">Phone</label>
                            <input
                              type="tel"
                              defaultValue="+1 (555) 123-4567"
                              className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                            />
                          </div>
                          <div>
                            <label className="block text-[#a8a6a1] text-sm mb-2">Office Location</label>
                            <input
                              type="text"
                              defaultValue="Science Building, Room 204"
                              className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button className="btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="p-6">
                      <h3 className="text-[#e8e6e1] font-semibold mb-6">Teaching Statistics</h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        {[
                          { label: 'Years Teaching', value: '8', icon: Calendar },
                          { label: 'Classes Taught', value: '24', icon: BookOpen },
                          { label: 'Students Taught', value: '450+', icon: Users },
                          { label: 'Avg Rating', value: '4.8/5', icon: TrendingUp }
                        ].map((stat, index) => {
                          const Icon = stat.icon;
                          return (
                            <div key={stat.label} className="text-center p-4 bg-[#1a1a1a] rounded-xl">
                              <Icon className="w-8 h-8 text-[#FFD600] mx-auto mb-2" />
                              <div className="text-[#FFD600] font-bold text-xl mb-1">{stat.value}</div>
                              <div className="text-[#a8a6a1] text-sm">{stat.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <GlassCard>
                    <div className="p-6 text-center">
                      <div className="w-24 h-24 rounded-full bg-[#FFD600] mx-auto mb-4 flex items-center justify-center">
                        <User className="w-12 h-12 text-black" />
                      </div>
                      <h4 className="text-[#e8e6e1] font-semibold mb-1">Dr. Sarah Johnson</h4>
                      <p className="text-[#a8a6a1] text-sm mb-4">Professor of Mathematics</p>
                      <button className="btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm">
                        Change Photo
                      </button>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Current Classes</h4>
                      <div className="space-y-3">
                        {[
                          { code: 'MATH-101', name: 'Mathematics 101', students: 32 },
                          { code: 'PHYS-201', name: 'Physics Advanced', students: 24 },
                          { code: 'CS-201', name: 'Computer Science', students: 28 },
                          { code: 'CHEM-101', name: 'Chemistry Lab', students: 20 },
                          { code: 'ENG-201', name: 'English Literature', students: 30 }
                        ].map((course, idx) => (
                          <div key={idx} className="p-3 bg-[#1a1a1a] rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[#FFD600] font-medium text-sm">{course.code}</span>
                              <span className="text-[#a8a6a1] text-xs">{course.students} students</span>
                            </div>
                            <div className="text-[#e8e6e1] text-sm">{course.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="p-6">
                      <h4 className="text-[#e8e6e1] font-semibold mb-4">Account Settings</h4>
                      <div className="space-y-3">
                        {[
                          'Change Password',
                          'Notification Preferences',
                          'Privacy Settings',
                          'Export Data'
                        ].map((setting) => (
                          <button key={setting} className="w-full text-left p-3 bg-[#1a1a1a] text-[#e8e6e1] rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm">
                            {setting}
                          </button>
                        ))}
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
