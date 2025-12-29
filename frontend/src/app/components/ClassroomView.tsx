import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Calendar, User, Bell, BookOpen, CheckCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { courseAPI } from '../api';

interface ClassroomViewProps {
  course: any;
  onBack: () => void;
  onLogout: () => void;
}

export function ClassroomView({ course, onBack, onLogout }: ClassroomViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassroomData();
  }, [course._id]);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      const classAssignments = await courseAPI.getAssignments(course._id);
      setAssignments(classAssignments || []);

      const classMaterials = await courseAPI.getMaterials(course._id);
      setMaterials(classMaterials || []);
    } catch (error) {
      console.error('Error fetching classroom data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0f0f0f] text-[#e8e6e1]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#FFD600]/10 rounded-lg transition-colors"
              title="Back to dashboard"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#FFD600]">{course.title}</h1>
              <p className="text-[#a8a6a1] mt-1">with {course.teacher?.name || 'Your Teacher'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="btn-3d bg-red-600/20 text-red-400 font-semibold py-2 px-6 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'assignments', label: 'Assignments', icon: '📝' },
            { id: 'materials', label: 'Materials', icon: '📚' },
            { id: 'announcements', label: 'Announcements', icon: '📢' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#FFD600] text-black'
                  : 'bg-[#1a1a1a] text-[#e8e6e1] hover:bg-[#2a2a2a]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-[#e8e6e1] font-semibold mb-4">Course Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[#a8a6a1] text-sm mb-1">Subject</p>
                        <p className="text-[#e8e6e1] font-medium">{course.subject}</p>
                      </div>
                      <div>
                        <p className="text-[#a8a6a1] text-sm mb-1">Grade Level</p>
                        <p className="text-[#e8e6e1] font-medium">{course.grade}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-4 bg-[#1a1a1a] rounded-lg">
                      <Calendar className="w-5 h-5 text-[#FFD600]" />
                      <div>
                        <p className="text-[#a8a6a1] text-sm">Schedule</p>
                        <p className="text-[#e8e6e1]">{course.schedule?.startTime} - {course.schedule?.endTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6">
                  <h3 className="text-[#e8e6e1] font-semibold mb-4">Description</h3>
                  <p className="text-[#a8a6a1] leading-relaxed">{course.description}</p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#e8e6e1] font-semibold">Upcoming Assignments</h3>
                    <span className="text-[#FFD600] font-bold">{assignments.filter((a: any) => new Date(a.dueDate) > new Date()).length}</span>
                  </div>
                  {assignments.filter((a: any) => new Date(a.dueDate) > new Date()).length === 0 ? (
                    <p className="text-[#a8a6a1] text-center py-6">No upcoming assignments.</p>
                  ) : (
                    <div className="space-y-3">
                      {assignments
                        .filter((a: any) => new Date(a.dueDate) > new Date())
                        .slice(0, 3)
                        .map((assignment: any) => (
                          <div key={assignment._id} className="p-3 bg-[#1a1a1a] rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-[#e8e6e1] font-medium">{assignment.title}</p>
                                <p className="text-[#a8a6a1] text-xs mt-1">
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="text-[#FFD600] text-sm font-semibold">
                                {assignment.totalPoints || 100}pts
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-[#e8e6e1] font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#FFD600]" />
                    Instructor
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FFD600]/20 flex items-center justify-center">
                      <span className="text-[#FFD600] font-semibold">
                        {(course.teacher?.name || 'T')[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-[#e8e6e1] font-medium">{course.teacher?.name || 'Unknown Teacher'}</p>
                      <p className="text-[#a8a6a1] text-sm">{course.teacher?.email || 'teacher@example.com'}</p>
                    </div>
                  </div>
                  <button className="w-full mt-4 btn-3d bg-[#FFD600]/10 text-[#FFD600] font-semibold py-2 rounded-lg hover:bg-[#FFD600]/20 transition-colors">
                    Send Message
                  </button>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6">
                  <h3 className="text-[#e8e6e1] font-semibold mb-4">Class Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#FFD600]" />
                        <span className="text-[#a8a6a1] text-sm">Assignments</span>
                      </div>
                      <span className="text-[#e8e6e1] font-semibold">{assignments.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-[#a8a6a1] text-sm">Completed</span>
                      </div>
                      <span className="text-green-400 font-semibold">
                        {assignments.filter((a: any) => a.submission).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#FFD600]/30"></span>
                        <span className="text-[#a8a6a1] text-sm">Pending</span>
                      </div>
                      <span className="text-[#FFD600] font-semibold">
                        {assignments.filter((a: any) => !a.submission).length}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'assignments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard>
              <div className="p-6">
                <h3 className="text-[#e8e6e1] font-semibold mb-6">All Assignments</h3>
                {assignments.length === 0 ? (
                  <p className="text-[#a8a6a1] text-center py-8">No assignments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment: any) => (
                      <div
                        key={assignment._id}
                        className="p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-[#e8e6e1] font-medium">{assignment.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assignment.submission
                                  ? 'bg-green-500/20 text-green-400'
                                  : new Date(assignment.dueDate) < new Date()
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-[#FFD600]/20 text-[#FFD600]'
                              }`}>
                                {assignment.submission
                                  ? 'Submitted'
                                  : new Date(assignment.dueDate) < new Date()
                                  ? 'Overdue'
                                  : 'Pending'}
                              </span>
                            </div>
                            <p className="text-[#a8a6a1] text-sm mb-2">{assignment.description}</p>
                            <div className="flex items-center gap-4 text-xs text-[#a8a6a1]">
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              <span>Points: {assignment.totalPoints || 100}</span>
                            </div>
                          </div>
                          <button className="btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors ml-4">
                            {assignment.submission ? 'View' : 'Start'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'materials' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard>
              <div className="p-6">
                <h3 className="text-[#e8e6e1] font-semibold mb-6">Class Materials</h3>
                {materials.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-[#FFD600]/30 mx-auto mb-3" />
                    <p className="text-[#a8a6a1]">No materials available yet.</p>
                    <p className="text-[#a8a6a1] text-sm mt-2">Your instructor will share course materials here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((material: any) => (
                      <div
                        key={material._id}
                        className="p-4 bg-[#1a1a1a] rounded-lg flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-[#e8e6e1] font-medium">{material.title}</p>
                          {material.description && (
                            <p className="text-[#a8a6a1] text-sm mt-1">{material.description}</p>
                          )}
                          <p className="text-[#a8a6a1] text-xs mt-2">
                            {material.type === 'url' ? 'Link' : `${material.fileName} • ${(material.fileSize / 1024).toFixed(2)} KB`} • {new Date(material.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <a 
                          href={material.fileUrl.startsWith('/') ? `http://localhost:3001${material.fileUrl}` : material.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-3d bg-[#FFD600]/10 text-[#FFD600] font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/20 transition-colors ml-4"
                        >
                          {material.type === 'url' ? 'Open Link' : 'Download'}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'announcements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard>
              <div className="p-6">
                <h3 className="text-[#e8e6e1] font-semibold mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#FFD600]" />
                  Announcements
                </h3>
                <div className="text-center py-12">
                  <p className="text-[#a8a6a1]">No announcements yet.</p>
                  <p className="text-[#a8a6a1] text-sm mt-2">Announcements from your instructor will appear here.</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
