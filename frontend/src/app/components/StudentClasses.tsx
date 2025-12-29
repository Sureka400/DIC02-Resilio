import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, User, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { studentAPI, courseAPI } from '../api';

interface StudentClassesProps {
  onEnterClassroom: (course: any) => void;
  onBack: () => void;
  onLogout: () => void;
}

export function StudentClasses({ onEnterClassroom, onBack, onLogout }: StudentClassesProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classCode, setClassCode] = useState('');
  const [joinStatus, setJoinStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const enrolledCourses = await studentAPI.getCourses();
      setCourses(enrolledCourses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await courseAPI.join(classCode.toUpperCase());
      setJoinStatus({ type: 'success', message: '✅ Successfully joined class!' });
      setClassCode('');
      setShowJoinForm(false);
      fetchCourses();
      setTimeout(() => setJoinStatus(null), 3000);
    } catch (error: any) {
      setJoinStatus({ type: 'error', message: `❌ ${error.message}` });
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
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-[#FFD600]">My Classes</h1>
          </div>
          <button
            onClick={onLogout}
            className="btn-3d bg-red-600/20 text-red-400 font-semibold py-2 px-6 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Logout
          </button>
        </div>

        {joinStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              joinStatus.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {joinStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            {joinStatus.message}
          </motion.div>
        )}

        {!showJoinForm ? (
          <div className="mb-8">
            <button
              onClick={() => setShowJoinForm(true)}
              className="btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Join a New Class
            </button>
          </div>
        ) : (
          <GlassCard className="mb-8">
            <div className="p-6">
              <h3 className="text-[#e8e6e1] font-semibold mb-4">Join a New Class</h3>
              <form onSubmit={handleJoinClass} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter Class Code (e.g. ABC123)"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#1a1a1a] text-[#e8e6e1] px-4 py-3 rounded-lg border border-[#FFD600]/20 focus:border-[#FFD600] outline-none transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                >
                  Join Class
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="btn-3d bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-3 px-6 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                >
                  Cancel
                </button>
              </form>
            </div>
          </GlassCard>
        )}

        <h2 className="text-2xl font-bold text-[#e8e6e1] mb-6">Enrolled Classes ({courses.length})</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#a8a6a1]">Loading your classes...</p>
          </div>
        ) : courses.length === 0 ? (
          <GlassCard>
            <div className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-[#FFD600]/30 mx-auto mb-4" />
              <p className="text-[#a8a6a1] text-lg">You are not enrolled in any classes yet.</p>
              <p className="text-[#a8a6a1] text-sm mt-2">Use the button above to join a class with a class code from your instructor.</p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
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
                        <p className="text-[#a8a6a1] text-sm">Teacher: {course.teacher?.name || 'Unknown'}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#FFD600]/10">
                        <BookOpen className="w-5 h-5 text-[#FFD600]" />
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-[#a8a6a1] text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{course.schedule?.startTime} - {course.schedule?.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a8a6a1] text-sm">
                        <User className="w-4 h-4" />
                        <span>{course.students?.length || 0} Students</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onEnterClassroom(course)}
                      className="w-full btn-3d bg-[#FFD600] text-black font-semibold py-2 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                    >
                      Enter Classroom
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
