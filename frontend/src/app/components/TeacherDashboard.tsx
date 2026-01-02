import { useState, useEffect } from 'react';
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
  BookOpen,
  Plus,
  Eye,
  X,
  Upload,
  Download,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { TabNavigation } from './TabNavigation';
import { ChartCard } from './ChartCard';
import { ChatComponent } from './ChatComponent';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { teacherAPI } from '../api';

interface TeacherDashboardProps {
  onLogout: () => void;
  onManageClass: (course: any) => void;
}

export function TeacherDashboard({ onLogout, onManageClass }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  
  // Create Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    classCode: '',
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '09:00',
      endTime: '10:30'
    }
  });

  // Create Assignment Modal State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100,
    type: 'homework'
  });

  // Class Code Display State
  const [createdClassCode, setCreatedClassCode] = useState<string | null>(null);
  const [createdClassName, setCreatedClassName] = useState<string>('');
  
  // Selected Assignment for Detail View
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignmentSubTab, setAssignmentSubTab] = useState<'submissions' | 'details' | 'analytics'>('submissions');
  const [assignmentFilter, setAssignmentFilter] = useState<'active' | 'past' | 'draft'>('active');
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);

  // Material Upload State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedCourseForMaterial, setSelectedCourseForMaterial] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    fileOrUrl: 'file' as 'file' | 'url',
    file: null as File | null,
    url: ''
  });
  const [materialLoading, setMaterialLoading] = useState(false);
  const [materialError, setMaterialError] = useState('');
  const [aiAssistantMessage, setAiAssistantMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await teacherAPI.getDashboard();
      setDashboardData(data);
      
      const teacherProfile = await teacherAPI.getProfile();
      setProfile(teacherProfile);
      setEditedProfile(teacherProfile);
      
      const teacherCourses = await teacherAPI.getCourses();
      setCourses(teacherCourses);
      
      const teacherAssignments = await teacherAPI.getAssignments();
      setAssignments(teacherAssignments.map((a: any) => ({ 
        ...a, 
        courseTitle: a.course?.title || 'Unknown Course' 
      })));
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdCourse = await teacherAPI.createCourse(newCourse);
      setIsCourseModalOpen(false);
      setCreatedClassCode(createdCourse.classCode);
      setCreatedClassName(newCourse.title);
      setNewCourse({
        title: '',
        description: '',
        subject: '',
        grade: '',
        classCode: '',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          startTime: '09:00',
          endTime: '10:30'
        }
      });
      fetchData();
    } catch (error: any) {
      console.error('Error creating course:', error);
      const errorMsg = error.message || 'Unknown error';
      if (errorMsg.includes('already in use')) {
        alert(`❌ ${errorMsg}`);
      } else {
        alert(`Failed to create class: ${errorMsg}`);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await teacherAPI.updateProfile({
        name: editedProfile.name,
        profile: editedProfile.profile,
        academicInfo: editedProfile.academicInfo
      });
      setProfile(updated.teacher);
      setIsEditingProfile(false);
      alert('✅ Profile updated successfully!');
    } catch (error: any) {
      alert(`❌ Error updating profile: ${error.message}`);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignmentError('');
    
    // Validation
    if (!newAssignment.courseId.trim()) {
      setAssignmentError('Please select a class');
      return;
    }
    
    if (!newAssignment.title.trim()) {
      setAssignmentError('Please enter an assignment title');
      return;
    }
    
    if (!newAssignment.description.trim()) {
      setAssignmentError('Please enter assignment instructions');
      return;
    }
    
    if (!newAssignment.dueDate) {
      setAssignmentError('Please select a due date');
      return;
    }

    if (newAssignment.totalPoints <= 0) {
      setAssignmentError('Points must be greater than 0');
      return;
    }
    
    setAssignmentLoading(true);
    try {
      const { courseId, ...assignmentData } = newAssignment;
      const dueDateObj = new Date(newAssignment.dueDate);
      dueDateObj.setHours(23, 59, 59);
      
      await teacherAPI.createAssignment(courseId, {
        ...assignmentData,
        dueDate: dueDateObj.toISOString()
      });
      
      setIsAssignmentModalOpen(false);
      setNewAssignment({
        courseId: '',
        title: '',
        description: '',
        dueDate: '',
        totalPoints: 100,
        type: 'homework'
      });
      setAssignmentError('');
      fetchData();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      setAssignmentError(error.message || 'Failed to create assignment. Please try again.');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setMaterialError('');

    if (!newMaterial.title.trim()) {
      setMaterialError('Please enter a title');
      return;
    }

    if (newMaterial.fileOrUrl === 'file' && !newMaterial.file) {
      setMaterialError('Please select a file');
      return;
    }

    if (newMaterial.fileOrUrl === 'url' && !newMaterial.url.trim()) {
      setMaterialError('Please enter a URL');
      return;
    }

    setMaterialLoading(true);
    try {
      const materialData: any = {
        title: newMaterial.title,
        description: newMaterial.description
      };

      if (newMaterial.fileOrUrl === 'file' && newMaterial.file) {
        materialData.file = newMaterial.file;
      } else if (newMaterial.fileOrUrl === 'url') {
        materialData.url = newMaterial.url;
      }

      await teacherAPI.uploadMaterial(selectedCourseForMaterial._id, materialData);

      setIsMaterialModalOpen(false);
      setNewMaterial({
        title: '',
        description: '',
        fileOrUrl: 'file',
        file: null,
        url: ''
      });
      setMaterialError('');
      fetchMaterials(selectedCourseForMaterial._id);
      alert('✅ Material uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading material:', error);
      setMaterialError(error.message || 'Failed to upload material');
    } finally {
      setMaterialLoading(false);
    }
  };

  const fetchMaterials = async (courseId: string) => {
    try {
      const mats = await teacherAPI.getMaterials(courseId);
      setMaterials(mats);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

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
  const submissionTrendsData = dashboardData?.submissionTrends || [];
  const participationData = dashboardData?.participationData || [];
  const assignmentStatusData = dashboardData?.assignmentStatusData || [];
  const engagementHeatmapData = dashboardData?.engagementHeatmapData || [];

  const weeklySchedule = [
    { day: 'Monday', date: 'Dec 30', classes: courses.filter(c => c.schedule?.days?.includes('Monday')).map(c => ({ 
      time: `${c.schedule.startTime} - ${c.schedule.endTime}`, 
      subject: c.title, 
      room: 'Online', 
      students: c.students?.length 
    }))},
    { day: 'Tuesday', date: 'Dec 31', classes: courses.filter(c => c.schedule?.days?.includes('Tuesday')).map(c => ({ 
      time: `${c.schedule.startTime} - ${c.schedule.endTime}`, 
      subject: c.title, 
      room: 'Online', 
      students: c.students?.length 
    }))},
    { day: 'Wednesday', date: 'Jan 1', classes: courses.filter(c => c.schedule?.days?.includes('Wednesday')).map(c => ({ 
      time: `${c.schedule.startTime} - ${c.schedule.endTime}`, 
      subject: c.title, 
      room: 'Online', 
      students: c.students?.length 
    }))},
    { day: 'Thursday', date: 'Jan 2', classes: courses.filter(c => c.schedule?.days?.includes('Thursday')).map(c => ({ 
      time: `${c.schedule.startTime} - ${c.schedule.endTime}`, 
      subject: c.title, 
      room: 'Online', 
      students: c.students?.length 
    }))},
    { day: 'Friday', date: 'Jan 3', classes: courses.filter(c => c.schedule?.days?.includes('Friday')).map(c => ({ 
      time: `${c.schedule.startTime} - ${c.schedule.endTime}`, 
      subject: c.title, 
      room: 'Online', 
      students: c.students?.length 
    }))},
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
                  { label: 'Total Students', value: dashboardData?.studentsCount?.toString() || '0', icon: Users },
                  { label: 'Active Classes', value: dashboardData?.coursesCount?.toString() || '0', icon: FileText },
                  { label: 'To Grade', value: dashboardData?.pendingAssignmentsCount?.toString() || '0', icon: CheckCircle },
                  { label: 'Performance', value: dashboardData?.performance || '0%', icon: TrendingUp },
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
                    {dashboardData?.todaysSchedule?.length > 0 ? (
                      dashboardData.todaysSchedule.map((item, idx) => (
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
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#a8a6a1] bg-[#1a1a1a] rounded-xl">
                        No classes scheduled for today
                      </div>
                    )}
                  </div>
                </ChartCard>

                <ChartCard title="Pending Reviews">
                  <div className="space-y-3">
                    {dashboardData?.pendingReviews?.length > 0 ? (
                      dashboardData.pendingReviews.map((item, idx) => (
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
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#a8a6a1] bg-[#1a1a1a] rounded-xl">
                        No pending reviews
                      </div>
                    )}
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
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#FFD600]">Your Classes</h2>
                <button 
                  onClick={() => setIsCourseModalOpen(true)}
                  className="btn-3d flex items-center gap-2 px-6 py-2 bg-[#FFD600] text-black rounded-lg font-bold hover:bg-[#FFD600]/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Class</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {courses.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-[#a8a6a1]">You haven't created any classes yet.</p>
                  </div>
                ) : courses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <GlassCard>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-[#e8e6e1] font-semibold mb-1">{course.title}</h3>
                            <p className="text-[#FFD600] text-sm font-bold">Code: {course.classCode}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-[#FFD600]/10">
                            <Users className="w-5 h-5 text-[#FFD600]" />
                          </div>
                        </div>

                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Students:</span>
                            <span className="text-[#e8e6e1]">{course.students?.length || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Subject:</span>
                            <span className="text-[#e8e6e1]">{course.subject}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#a8a6a1]">Schedule:</span>
                            <span className="text-[#e8e6e1]">{course.schedule?.startTime} - {course.schedule?.endTime}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedCourseForMaterial(course);
                              setIsMaterialModalOpen(true);
                              fetchMaterials(course._id);
                            }}
                            className="flex-1 btn-3d bg-[#FFD600] text-black py-2 rounded-lg hover:bg-[#FFD600]/90 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Materials
                          </button>
                          <button 
                            onClick={() => onManageClass(course)}
                            className="flex-1 btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                          >
                            Manage
                          </button>
                        </div>
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
              {!selectedAssignment ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <ChartCard title="Class Performance Overview">
                      <div className="space-y-4">
                        {courses.length === 0 ? (
                          <p className="text-[#a8a6a1] text-center py-4">No courses yet</p>
                        ) : courses.slice(0, 5).map((course, idx) => (
                          <div key={idx} className="p-4 bg-[#1a1a1a] rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[#e8e6e1] font-medium">{course.title}</span>
                              <span className="text-[#FFD600] font-bold">{course.grade || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-[#a8a6a1]">Students:</span>
                                <span className="text-[#e8e6e1] ml-2">{course.students?.length || 0}</span>
                              </div>
                              <div>
                                <span className="text-[#a8a6a1]">Subject:</span>
                                <span className="text-[#e8e6e1] ml-2">{course.subject}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ChartCard>

                    <ChartCard title="Quick Actions">
                      <div className="space-y-3">
                        {[
                          { action: 'Create New Assignment', icon: FileText, onClick: () => setIsAssignmentModalOpen(true) },
                          { action: 'View All Submissions', icon: CheckCircle, onClick: () => {
                            if (assignments.length > 0) setSelectedAssignment(assignments[0]);
                          }},
                          { action: 'Assignment Analytics', icon: BarChart3, onClick: () => setActiveTab('analytics') },
                          { action: 'Student Insights', icon: Users, onClick: () => setActiveTab('insights') },
                        ].map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <button 
                              key={idx} 
                              onClick={item.onClick}
                              className="w-full flex items-center gap-3 p-4 bg-[#1a1a1a] text-[#e8e6e1] rounded-xl hover:bg-[#2a2a2a] transition-colors"
                            >
                              <Icon className="w-5 h-5 text-[#FFD600]" />
                              <span>{item.action}</span>
                            </button>
                          );
                        })}
                      </div>
                    </ChartCard>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-[#FFD600]">Manage Assignments</h2>
                    <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-[#FFD600]/10">
                      {(['active', 'past', 'draft'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setAssignmentFilter(filter)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                            assignmentFilter === filter
                              ? 'bg-[#FFD600] text-black shadow-lg'
                              : 'text-[#a8a6a1] hover:text-[#e8e6e1]'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {assignments.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-[#a8a6a1]">No assignments found for this filter.</p>
                      </div>
                    ) : assignments.map((assignment, index) => (
                      <motion.div
                        key={assignment._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <GlassCard>
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-[#e8e6e1] font-semibold">{assignment.title}</h3>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    new Date(assignment.dueDate) > new Date() ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {new Date(assignment.dueDate) > new Date() ? 'Active' : 'Closed'}
                                  </span>
                                </div>
                                <p className="text-[#FFD600] text-xs font-medium mb-2">{assignment.courseTitle}</p>
                                <p className="text-[#a8a6a1] text-sm line-clamp-2">{assignment.description}</p>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-[#FFD600] font-bold mb-1">Due: {new Date(assignment.dueDate).toLocaleDateString()}</div>
                                <div className="text-[#a8a6a1] text-sm flex items-center justify-end gap-1">
                                  <Users className="w-3 h-3" />
                                  {assignment.submissions?.length || 0} Submissions
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <button 
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setAssignmentSubTab('submissions');
                                }}
                                className="btn-3d bg-[#FFD600] text-black font-bold py-2 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors text-sm"
                              >
                                View Submissions
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setAssignmentSubTab('details');
                                }}
                                className="btn-3d bg-[#1a1a1a] text-[#e8e6e1] py-2 px-6 rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm border border-[#FFD600]/10"
                              >
                                Edit Details
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Assignment Detail View */}
                  <div className="flex items-center gap-4 mb-6">
                    <button 
                      onClick={() => setSelectedAssignment(null)}
                      className="p-2 hover:bg-[#FFD600]/10 rounded-lg transition-colors text-[#FFD600]"
                    >
                      <Plus className="w-6 h-6 rotate-45" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-[#e8e6e1]">{selectedAssignment.title}</h2>
                      <p className="text-[#FFD600] text-sm">{selectedAssignment.courseTitle}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 p-1 bg-[#1a1a1a] rounded-xl border border-[#FFD600]/10 w-fit mb-8">
                    {(['submissions', 'details', 'analytics'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setAssignmentSubTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                          assignmentSubTab === tab
                            ? 'bg-[#FFD600] text-black shadow-lg'
                            : 'text-[#a8a6a1] hover:text-[#e8e6e1]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <motion.div
                    key={assignmentSubTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {assignmentSubTab === 'submissions' && (
                      <div className="space-y-4">
                        {(!selectedAssignment.submissions || selectedAssignment.submissions.length === 0) ? (
                          <GlassCard>
                            <div className="p-12 text-center">
                              <CheckCircle className="w-12 h-12 text-[#FFD600]/30 mx-auto mb-4" />
                              <p className="text-[#a8a6a1]">No submissions received yet.</p>
                            </div>
                          </GlassCard>
                        ) : (
                          selectedAssignment.submissions.map((submission: any, idx: number) => (
                            <GlassCard key={idx}>
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#FFD600]/20 flex items-center justify-center text-[#FFD600] font-bold">
                                      {submission.student?.name?.[0] || 'S'}
                                    </div>
                                    <div>
                                      <h4 className="text-[#e8e6e1] font-semibold">{submission.student?.name || 'Unknown Student'}</h4>
                                      <p className="text-[#a8a6a1] text-xs">Submitted on {new Date(submission.submittedAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    {submission.grade !== undefined ? (
                                      <div className="text-right">
                                        <div className="text-[#FFD600] font-bold">{submission.grade}/{selectedAssignment.totalPoints}</div>
                                        <div className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Graded</div>
                                      </div>
                                    ) : (
                                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">Pending</span>
                                    )}
                                  </div>
                                </div>

                                {submission.content && (
                                  <div className="mb-4 p-4 bg-[#1a1a1a] rounded-lg">
                                    <p className="text-[#a8a6a1] text-xs mb-2">Submission Content:</p>
                                    <p className="text-[#e8e6e1] text-sm line-clamp-3">{submission.content}</p>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setViewingSubmission(submission)}
                                    className="flex-1 btn-3d bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-2 px-4 rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm flex items-center justify-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Full
                                  </button>
                                  {submission.grade === undefined && (
                                    <button className="flex-1 btn-3d bg-[#FFD600] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors text-sm">
                                      Grade
                                    </button>
                                  )}
                                </div>
                              </div>
                            </GlassCard>
                          ))
                        )}
                      </div>
                    )}

                    {assignmentSubTab === 'details' && (
                      <GlassCard>
                        <div className="p-8 space-y-6">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h4 className="text-[#FFD600] font-bold text-sm uppercase tracking-widest">General Information</h4>
                              <div className="space-y-1">
                                <p className="text-[#a8a6a1] text-xs">Description</p>
                                <p className="text-[#e8e6e1]">{selectedAssignment.description}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[#a8a6a1] text-xs">Instructions</p>
                                <p className="text-[#e8e6e1]">{selectedAssignment.instructions || 'No specific instructions provided.'}</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-[#FFD600] font-bold text-sm uppercase tracking-widest">Settings & Deadline</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#FFD600]/10">
                                  <p className="text-[#a8a6a1] text-xs mb-1">Due Date</p>
                                  <p className="text-[#e8e6e1] font-bold">{new Date(selectedAssignment.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#FFD600]/10">
                                  <p className="text-[#a8a6a1] text-xs mb-1">Total Points</p>
                                  <p className="text-[#e8e6e1] font-bold">{selectedAssignment.totalPoints}</p>
                                </div>
                              </div>
                              <button className="w-full btn-3d bg-[#1a1a1a] text-[#FFD600] font-bold py-3 rounded-xl hover:bg-[#2a2a2a] transition-all border border-[#FFD600]/20 flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" />
                                Edit Assignment
                              </button>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    )}

                    {assignmentSubTab === 'analytics' && (
                      <div className="grid md:grid-cols-3 gap-6">
                        <ChartCard title="Submission Rate">
                          <div className="flex flex-col items-center justify-center h-full py-8">
                            <div className="relative w-32 h-32 mb-4">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[#1a1a1a]" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                  strokeDasharray={364.4}
                                  strokeDashoffset={364.4 * (1 - (selectedAssignment.submissions?.length || 0) / (courses.find(c => c.title === selectedAssignment.courseTitle)?.students?.length || 1))}
                                  className="text-[#FFD600]" 
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#e8e6e1]">
                                {Math.round(((selectedAssignment.submissions?.length || 0) / (courses.find(c => c.title === selectedAssignment.courseTitle)?.students?.length || 1)) * 100)}%
                              </div>
                            </div>
                            <p className="text-[#a8a6a1] text-sm text-center">
                              {selectedAssignment.submissions?.length || 0} of {courses.find(c => c.title === selectedAssignment.courseTitle)?.students?.length || 0} students submitted
                            </p>
                          </div>
                        </ChartCard>
                        <div className="md:col-span-2">
                          <ChartCard title="Grade Distribution">
                            <div className="h-[200px] flex items-center justify-center">
                              <p className="text-[#a8a6a1] italic">Insufficient data to show grade distribution</p>
                            </div>
                          </ChartCard>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
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
                    {dashboardData?.atRiskStudents?.length > 0 ? (
                      dashboardData.atRiskStudents.map((student, idx) => (
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
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#a8a6a1] bg-[#1a1a1a] rounded-xl">
                        No students at risk
                      </div>
                    )}
                  </div>
                </ChartCard>

                <ChartCard title="Top Performers">
                  <div className="space-y-3">
                    {dashboardData?.topPerformers?.length > 0 ? (
                      dashboardData.topPerformers.map((student, idx) => (
                        <div key={idx} className="p-3 bg-[#1a1a1a] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[#e8e6e1] font-medium">{student.name}</span>
                            <span className="text-green-400 text-sm">{student.improvement}</span>
                          </div>
                          <div className="text-[#FFD600] font-bold">{student.grade}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#a8a6a1] bg-[#1a1a1a] rounded-xl">
                        No performers data
                      </div>
                    )}
                  </div>
                </ChartCard>

                <ChartCard title="Subject Performance">
                  <div className="space-y-3">
                    {dashboardData?.subjectPerformance?.length > 0 ? (
                      dashboardData.subjectPerformance.map((subject, idx) => (
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
                      ))
                    ) : (
                      <div className="p-8 text-center text-[#a8a6a1] bg-[#1a1a1a] rounded-xl">
                        No subject data
                      </div>
                    )}
                  </div>
                </ChartCard>
              </div>

              <div className="mt-8">
                <AiInsights role="teacher" data={{ courses, assignments, dashboardData }} />
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
                      {weeklySchedule.map((daySchedule, dayIdx) => (
                        <div key={dayIdx} className="border border-[#FFD600]/20 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="text-[#FFD600] font-bold">{daySchedule.day}</div>
                            <div className="text-[#a8a6a1]">{daySchedule.date}</div>
                          </div>
                          <div className="space-y-3">
                            {daySchedule.classes.length > 0 ? (
                              daySchedule.classes.map((classItem, classIdx) => (
                                <div key={classIdx} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#FFD600]"></div>
                                    <div>
                                      <div className="text-[#e8e6e1] font-medium">{classItem.subject}</div>
                                      <div className="text-[#a8a6a1] text-sm">{classItem.time} • {classItem.room}</div>
                                    </div>
                                  </div>
                                  {classItem.students !== undefined && (
                                    <div className="flex items-center gap-1 text-[#a8a6a1] text-sm">
                                      <Users className="w-4 h-4" />
                                      {classItem.students}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-[#a8a6a1] text-sm italic">No classes scheduled</p>
                            )}
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
                      {weeklySchedule.find(d => d.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }))?.classes.map((classItem, idx) => (
                        <div key={idx} className="p-3 bg-[#1a1a1a] rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[#FFD600] font-bold">{classItem.time.split(' - ')[0]}</span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                              Upcoming
                            </span>
                          </div>
                          <div className="text-[#e8e6e1] font-medium mb-1">{classItem.subject}</div>
                          <div className="text-[#a8a6a1] text-sm">{classItem.room}</div>
                        </div>
                      )) || (
                        <p className="text-[#a8a6a1] text-sm italic">No classes today</p>
                      )}
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
                    externalMessage={aiAssistantMessage}
                    onMessageProcessed={() => setAiAssistantMessage(undefined)}
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
                          <button 
                            key={feature} 
                            onClick={() => setAiAssistantMessage(feature)}
                            className="w-full text-left p-3 bg-[#1a1a1a] text-[#e8e6e1] rounded-lg hover:bg-[#2a2a2a] transition-colors text-sm"
                          >
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
                          <span className="text-[#FFD600]">{Math.floor((dashboardData?.totalStudents || 0) * 0.4) + 2}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#a8a6a1]">Lesson Plans Created</span>
                          <span className="text-[#FFD600]">{courses.length + 2}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#a8a6a1]">Performance Analysis</span>
                          <span className="text-[#FFD600]">{dashboardData?.totalStudents || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#a8a6a1]">Study Materials</span>
                          <span className="text-[#FFD600]">{materials.length + 5}</span>
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
                      {!isEditingProfile ? (
                        <>
                          <h3 className="text-[#e8e6e1] font-semibold mb-6">Profile Information</h3>
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <p className="text-[#a8a6a1] text-sm mb-1">Full Name</p>
                              <p className="text-[#e8e6e1] font-medium">{profile?.name || 'Not set'}</p>
                            </div>
                            <div>
                              <p className="text-[#a8a6a1] text-sm mb-1">Email</p>
                              <p className="text-[#e8e6e1] font-medium">{profile?.email || 'Not set'}</p>
                            </div>
                            <div>
                              <p className="text-[#a8a6a1] text-sm mb-1">Department</p>
                              <p className="text-[#e8e6e1] font-medium">{profile?.academicInfo?.department || 'Not set'}</p>
                            </div>
                            <div>
                              <p className="text-[#a8a6a1] text-sm mb-1">Subjects</p>
                              <p className="text-[#e8e6e1] font-medium">{profile?.academicInfo?.subject?.join(', ') || 'Not set'}</p>
                            </div>
                            <div>
                              <p className="text-[#a8a6a1] text-sm mb-1">Phone</p>
                              <p className="text-[#e8e6e1] font-medium">{profile?.profile?.phone || 'Not set'}</p>
                            </div>
                            <div>
                              <p className="text-[#a8a6a1] text-sm mb-1">Status</p>
                              <p className="text-[#e8e6e1] font-medium capitalize">{profile?.status || 'active'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsEditingProfile(true)}
                            className="btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                          >
                            Edit Profile
                          </button>
                        </>
                      ) : (
                        <>
                          <h3 className="text-[#e8e6e1] font-semibold mb-6">Edit Profile</h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-[#a8a6a1] text-sm mb-2">Full Name</label>
                                <input
                                  type="text"
                                  value={editedProfile?.name || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                                  className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                                />
                              </div>
                              <div>
                                <label className="block text-[#a8a6a1] text-sm mb-2">Email</label>
                                <input
                                  type="email"
                                  value={editedProfile?.email || ''}
                                  disabled
                                  className="w-full bg-[#1a1a1a] text-[#a8a6a1] rounded-lg px-4 py-3 opacity-50 cursor-not-allowed"
                                />
                                <p className="text-[#a8a6a1] text-xs mt-1">Email cannot be changed</p>
                              </div>
                              <div>
                                <label className="block text-[#a8a6a1] text-sm mb-2">Department</label>
                                <input
                                  type="text"
                                  value={editedProfile?.academicInfo?.department || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, academicInfo: {...editedProfile?.academicInfo, department: e.target.value}})}
                                  className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                                />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-[#a8a6a1] text-sm mb-2">Phone</label>
                                <input
                                  type="tel"
                                  value={editedProfile?.profile?.phone || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, profile: {...editedProfile?.profile, phone: e.target.value}})}
                                  className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                                />
                              </div>
                              <div>
                                <label className="block text-[#a8a6a1] text-sm mb-2">Office Location</label>
                                <input
                                  type="text"
                                  value={editedProfile?.profile?.address?.street || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, profile: {...editedProfile?.profile, address: {...editedProfile?.profile?.address, street: e.target.value}}})}
                                  className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                                />
                              </div>
                              <div>
                                <label className="block text-[#a8a6a1] text-sm mb-2">Bio</label>
                                <textarea
                                  value={editedProfile?.profile?.bio || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, profile: {...editedProfile?.profile, bio: e.target.value}})}
                                  className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600] min-h-20"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 flex gap-3">
                            <button 
                              onClick={handleSaveProfile}
                              className="btn-3d flex-1 bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                            >
                              Save Changes
                            </button>
                            <button 
                              onClick={() => setIsEditingProfile(false)}
                              className="btn-3d flex-1 bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-3 px-6 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
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

        {/* Create Course Modal */}
        <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
          <DialogContent className="bg-[#0a0a0a] border-[#FFD600]/20 text-[#e8e6e1] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FFD600]">Create New Class</DialogTitle>
              <DialogDescription className="text-[#a8a6a1]">
                Set up a new learning environment for your students.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#a8a6a1]">Class Title</Label>
                <Input 
                  id="title"
                  placeholder="e.g. Advanced Physics 101"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-[#a8a6a1]">Subject</Label>
                <Input 
                  id="subject"
                  placeholder="e.g. Science"
                  value={newCourse.subject}
                  onChange={(e) => setNewCourse({...newCourse, subject: e.target.value})}
                  className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classCode" className="text-[#a8a6a1]">Class Code (Optional)</Label>
                <Input 
                  id="classCode"
                  placeholder="e.g. PHYS101 (leave empty for auto-generated)"
                  value={newCourse.classCode}
                  onChange={(e) => setNewCourse({...newCourse, classCode: e.target.value.toUpperCase()})}
                  className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50"
                  maxLength="6"
                />
                <p className="text-[#a8a6a1] text-xs">Leave blank for auto-generated code. Max 6 characters.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-[#a8a6a1]">Grade Level</Label>
                  <Input 
                    id="grade"
                    placeholder="e.g. 10th"
                    value={newCourse.grade}
                    onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})}
                    className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-[#a8a6a1]">Start Time</Label>
                  <Input 
                    id="startTime"
                    type="time"
                    value={newCourse.schedule.startTime}
                    onChange={(e) => setNewCourse({...newCourse, schedule: {...newCourse.schedule, startTime: e.target.value}})}
                    className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#a8a6a1]">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe your course goals..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50 min-h-[100px]"
                />
              </div>
              <DialogFooter className="pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 text-[#a8a6a1] hover:text-[#e8e6e1] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-3d px-6 py-2 bg-[#FFD600] text-black font-bold rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                >
                  Create Class
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Class Code Display Modal */}
        <Dialog open={!!createdClassCode} onOpenChange={(open) => !open && setCreatedClassCode(null)}>
          <DialogContent className="bg-[#0a0a0a] border-[#FFD600]/20 text-[#e8e6e1] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FFD600]">✨ Class Created!</DialogTitle>
              <DialogDescription className="text-[#a8a6a1]">
                Share this code with your students to join {createdClassName}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="bg-[#1a1a1a] border-2 border-[#FFD600] rounded-lg p-6 text-center">
                <p className="text-[#a8a6a1] text-sm mb-2">Class Code</p>
                <p className="text-[#FFD600] font-bold text-4xl tracking-widest mb-4">{createdClassCode}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdClassCode || '');
                    alert('Code copied to clipboard!');
                  }}
                  className="w-full bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                >
                  📋 Copy Code
                </button>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4">
                <p className="text-[#a8a6a1] text-sm mb-2">📌 How to Share:</p>
                <ul className="text-[#e8e6e1] text-sm space-y-1">
                  <li>✓ Share the code <strong>{createdClassCode}</strong> with students</li>
                  <li>✓ Students enter it in the "Join a New Class" section</li>
                  <li>✓ They'll be automatically added to your class</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setCreatedClassCode(null)}
                className="w-full btn-3d bg-[#FFD600] text-black font-bold py-2 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
              >
                Got it! Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Assignment Modal */}
        <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
          <DialogContent className="bg-[#0a0a0a] border-[#FFD600]/20 text-[#e8e6e1] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#FFD600]">Create New Assignment</DialogTitle>
              <DialogDescription className="text-[#a8a6a1]">
                Assign a new task to your students.
              </DialogDescription>
            </DialogHeader>
            {assignmentError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {assignmentError}
              </div>
            )}
            <form onSubmit={handleCreateAssignment} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="courseId" className="text-[#a8a6a1]">Select Class *</Label>
                <Select 
                  value={newAssignment.courseId} 
                  onValueChange={(value) => setNewAssignment({...newAssignment, courseId: value})}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#FFD600]/10 text-[#e8e6e1]">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#FFD600]/20 text-[#e8e6e1]">
                    {courses.map(course => (
                      <SelectItem key={course._id} value={course._id} className="focus:bg-[#FFD600]/10 focus:text-[#FFD600]">
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-title" className="text-[#a8a6a1]">Assignment Title *</Label>
                <Input 
                  id="a-title"
                  placeholder="e.g. Mid-term Research Paper"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-[#a8a6a1]">Due Date *</Label>
                  <Input 
                    id="dueDate"
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalPoints" className="text-[#a8a6a1]">Points</Label>
                  <Input 
                    id="totalPoints"
                    type="number"
                    value={newAssignment.totalPoints}
                    onChange={(e) => setNewAssignment({...newAssignment, totalPoints: parseInt(e.target.value)})}
                    className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-[#a8a6a1]">Assignment Type</Label>
                <Select 
                  value={newAssignment.type} 
                  onValueChange={(value) => setNewAssignment({...newAssignment, type: value})}
                >
                  <SelectTrigger className="bg-[#1a1a1a] border-[#FFD600]/10 text-[#e8e6e1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#FFD600]/20 text-[#e8e6e1]">
                    <SelectItem value="homework" className="focus:bg-[#FFD600]/10 focus:text-[#FFD600]">
                      Homework
                    </SelectItem>
                    <SelectItem value="quiz" className="focus:bg-[#FFD600]/10 focus:text-[#FFD600]">
                      Quiz
                    </SelectItem>
                    <SelectItem value="project" className="focus:bg-[#FFD600]/10 focus:text-[#FFD600]">
                      Project
                    </SelectItem>
                    <SelectItem value="exam" className="focus:bg-[#FFD600]/10 focus:text-[#FFD600]">
                      Exam
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-description" className="text-[#a8a6a1]">Instructions *</Label>
                <Textarea 
                  id="a-description"
                  placeholder="Provide details about the assignment..."
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="bg-[#1a1a1a] border-[#FFD600]/10 focus:border-[#FFD600]/50 min-h-[100px]"
                />
              </div>
              <DialogFooter className="pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  disabled={assignmentLoading}
                  className="px-4 py-2 text-[#a8a6a1] hover:text-[#e8e6e1] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={assignmentLoading}
                  className="btn-3d px-6 py-2 bg-[#FFD600] text-black font-bold rounded-lg hover:bg-[#FFD600]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignmentLoading ? 'Creating...' : 'Create Assignment'}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Submission View Modal */}
        <AnimatePresence>
          {viewingSubmission && (
            <motion.div
              key="submission-view-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setViewingSubmission(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0a0a0a] border border-[#FFD600]/20 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#e8e6e1]">Submission Details</h2>
                    <p className="text-[#a8a6a1] text-sm mt-1">From: {viewingSubmission.student?.name || 'Unknown Student'}</p>
                  </div>
                  <button
                    onClick={() => setViewingSubmission(null)}
                    className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[#a8a6a1]" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-[#a8a6a1]">Student:</span>
                    <p className="text-[#e8e6e1] font-semibold">{viewingSubmission.student?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-[#a8a6a1]">Submitted:</span>
                    <p className="text-[#FFD600] font-semibold">{new Date(viewingSubmission.submittedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[#a8a6a1]">Status:</span>
                    <p className={`font-semibold ${viewingSubmission.grade !== undefined ? 'text-green-400' : 'text-yellow-400'}`}>
                      {viewingSubmission.grade !== undefined ? 'Graded' : 'Pending Grading'}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-[#e8e6e1] font-semibold mb-3">Submission Content</h3>
                  <div className="p-6 bg-[#1a1a1a] rounded-lg border border-[#FFD600]/10 min-h-64 max-h-96 overflow-y-auto">
                    <p className="text-[#e8e6e1] whitespace-pre-wrap">{viewingSubmission.content || 'No content provided'}</p>
                  </div>
                </div>

                {viewingSubmission.grade !== undefined && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-green-400 font-semibold mb-2">Grade Received</p>
                        <p className="text-[#a8a6a1] text-sm">Feedback: {viewingSubmission.feedback || 'No feedback provided'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-2xl">{viewingSubmission.grade}</p>
                        <p className="text-[#a8a6a1] text-xs">{selectedAssignment?.totalPoints || 100} points</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setViewingSubmission(null)}
                    className="flex-1 btn-3d bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-3 px-6 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                  >
                    Close
                  </button>
                  {viewingSubmission.grade === undefined && (
                    <button
                      className="flex-1 btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                    >
                      Grade Submission
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Material Upload Modal */}
          <AnimatePresence>
            {isMaterialModalOpen && selectedCourseForMaterial && (
              <motion.div
                key="material-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setIsMaterialModalOpen(false)}
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
                      <h2 className="text-2xl font-bold text-[#e8e6e1]">Upload Materials</h2>
                      <p className="text-[#a8a6a1] text-sm mt-1">{selectedCourseForMaterial.title}</p>
                    </div>
                    <button
                      onClick={() => setIsMaterialModalOpen(false)}
                      className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-[#a8a6a1]" />
                    </button>
                  </div>

                  {materials.length > 0 && (
                    <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
                      <h3 className="text-[#e8e6e1] font-semibold mb-3">Existing Materials ({materials.length})</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {materials.map((material, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded">
                            <div className="flex items-center gap-2">
                              {material.type === 'file' ? (
                                <FileText className="w-4 h-4 text-[#FFD600]" />
                              ) : (
                                <Download className="w-4 h-4 text-blue-400" />
                              )}
                              <span className="text-[#e8e6e1] text-sm">{material.title}</span>
                            </div>
                            <span className="text-[#a8a6a1] text-xs">{material.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleUploadMaterial}>
                    <div className="mb-4">
                      <label className="block text-[#e8e6e1] font-semibold mb-2">Title *</label>
                      <input
                        type="text"
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                        placeholder="E.g., Chapter 1 PDF, Introduction Video"
                        className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/20 focus:outline-none focus:border-[#FFD600] focus:ring-2 focus:ring-[#FFD600]/20"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-[#e8e6e1] font-semibold mb-2">Description</label>
                      <textarea
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                        placeholder="Optional description about the material..."
                        className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/20 focus:outline-none focus:border-[#FFD600] focus:ring-2 focus:ring-[#FFD600]/20 min-h-20"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-[#e8e6e1] font-semibold mb-2">Upload Type *</label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setNewMaterial({...newMaterial, fileOrUrl: 'file'})}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                            newMaterial.fileOrUrl === 'file'
                              ? 'bg-[#FFD600] text-black'
                              : 'bg-[#1a1a1a] text-[#e8e6e1] hover:bg-[#2a2a2a]'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMaterial({...newMaterial, fileOrUrl: 'url'})}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                            newMaterial.fileOrUrl === 'url'
                              ? 'bg-[#FFD600] text-black'
                              : 'bg-[#1a1a1a] text-[#e8e6e1] hover:bg-[#2a2a2a]'
                          }`}
                        >
                          Link URL
                        </button>
                      </div>
                    </div>

                    {newMaterial.fileOrUrl === 'file' && (
                      <div className="mb-4">
                        <label className="block text-[#e8e6e1] font-semibold mb-2">Select File *</label>
                        <input
                          type="file"
                          onChange={(e) => setNewMaterial({...newMaterial, file: e.target.files?.[0] || null})}
                          className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/20 focus:outline-none focus:border-[#FFD600]"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.png,.zip"
                        />
                        {newMaterial.file && (
                          <p className="text-[#FFD600] text-sm mt-2">Selected: {newMaterial.file.name}</p>
                        )}
                      </div>
                    )}

                    {newMaterial.fileOrUrl === 'url' && (
                      <div className="mb-4">
                        <label className="block text-[#e8e6e1] font-semibold mb-2">URL *</label>
                        <input
                          type="url"
                          value={newMaterial.url}
                          onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                          placeholder="https://example.com/resource"
                          className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/20 focus:outline-none focus:border-[#FFD600] focus:ring-2 focus:ring-[#FFD600]/20"
                        />
                      </div>
                    )}

                    {materialError && (
                      <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 font-semibold text-sm">Error</p>
                          <p className="text-red-300 text-sm">{materialError}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={materialLoading}
                        className="flex-1 btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        {materialLoading ? 'Uploading...' : 'Upload Material'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMaterialModalOpen(false);
                          setNewMaterial({
                            title: '',
                            description: '',
                            fileOrUrl: 'file',
                            file: null,
                            url: ''
                          });
                          setMaterialError('');
                        }}
                        className="flex-1 btn-3d bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-3 px-6 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatePresence>
      </div>
    </div>
  );
}
