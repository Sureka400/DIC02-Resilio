import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, FileText, MessageSquare, BarChart3, Copy, Check, Trash2, X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { courseAPI, teacherAPI } from '../api';

interface ClassroomManagementProps {
  course: any;
  onBack: () => void;
  onLogout: () => void;
}

export function ClassroomManagement({ course, onBack, onLogout }: ClassroomManagementProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    type: 'homework',
    dueDate: '',
    totalPoints: 100,
    instructions: ''
  });
  const [materialData, setMaterialData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    url: ''
  });

  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignmentSubTab, setAssignmentSubTab] = useState<'submissions' | 'settings'>('submissions');

  useEffect(() => {
    fetchClassroomData();
  }, [course._id]);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      setStudents(course.students || []);
      
      const classAssignments = await courseAPI.getAssignments(course._id);
      setAssignments(classAssignments || []);

      const classMaterials = await teacherAPI.getMaterials(course._id);
      setMaterials(classMaterials || []);
    } catch (error) {
      console.error('Error fetching classroom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(course.classCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAssignment = await teacherAPI.createAssignment(course._id, {
        ...assignmentData,
        status: 'published'
      });
      setAssignments([...assignments, newAssignment]);
      setShowAssignmentModal(false);
      setAssignmentData({
        title: '',
        description: '',
        type: 'homework',
        dueDate: '',
        totalPoints: 100,
        instructions: ''
      });
      alert('✅ Assignment created successfully!');
    } catch (error: any) {
      alert(`❌ Error creating assignment: ${error.message}`);
    }
  };

  const handleDeleteClass = async () => {
    try {
      await teacherAPI.deleteCourse(course._id);
      alert('✅ Class deleted successfully!');
      onBack();
    } catch (error: any) {
      alert(`❌ Error deleting class: ${error.message}`);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!materialData.file && !materialData.url) {
        alert('❌ Please select a file or provide a URL');
        return;
      }
      const newMaterial = await teacherAPI.uploadMaterial(course._id, materialData);
      setMaterials([newMaterial, ...materials]);
      setShowMaterialModal(false);
      setMaterialData({
        title: '',
        description: '',
        file: null,
        url: ''
      });
      alert('✅ Material uploaded successfully!');
    } catch (error: any) {
      alert(`❌ Error uploading material: ${error.message}`);
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
              <p className="text-[#a8a6a1] mt-1">Class Code: <span className="font-mono text-[#FFD600]">{course.classCode}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-3d bg-red-600/20 text-red-400 font-semibold py-2 px-6 rounded-lg hover:bg-red-600/30 transition-colors flex items-center gap-2"
              title="Delete this class"
            >
              <Trash2 className="w-4 h-4" />
              Delete Class
            </button>
            <button
              onClick={onLogout}
              className="btn-3d bg-red-600/20 text-red-400 font-semibold py-2 px-6 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'students', label: 'Students', icon: '👥' },
            { id: 'assignments', label: 'Assignments', icon: '📝' },
            { id: 'materials', label: 'Materials', icon: '📚' }
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
                  <h3 className="text-[#e8e6e1] font-semibold mb-4">Class Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8a6a1]">Subject:</span>
                      <span className="text-[#e8e6e1] font-medium">{course.subject}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8a6a1]">Grade Level:</span>
                      <span className="text-[#e8e6e1] font-medium">{course.grade}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8a6a1]">Schedule:</span>
                      <span className="text-[#e8e6e1] font-medium">
                        {course.schedule?.startTime} - {course.schedule?.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#a8a6a1]">Total Students:</span>
                      <span className="text-[#FFD600] font-bold text-xl">{course.students?.length || 0}</span>
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
            </div>

            <div className="space-y-6">
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-[#e8e6e1] font-semibold mb-4">Share Class Code</h3>
                  <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#FFD600]">{course.classCode}</span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 hover:bg-[#FFD600]/20 rounded-lg transition-colors"
                      title="Copy class code"
                    >
                      {copiedCode ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-[#FFD600]" />
                      )}
                    </button>
                  </div>
                  <p className="text-[#a8a6a1] text-sm">Share this code with students to let them join your class.</p>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="p-6">
                  <h3 className="text-[#e8e6e1] font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FFD600]/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#FFD600]" />
                      </div>
                      <div>
                        <p className="text-[#a8a6a1] text-sm">Enrolled</p>
                        <p className="text-[#e8e6e1] font-semibold">{course.students?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FFD600]/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#FFD600]" />
                      </div>
                      <div>
                        <p className="text-[#a8a6a1] text-sm">Assignments</p>
                        <p className="text-[#e8e6e1] font-semibold">{assignments.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard>
              <div className="p-6">
                <h3 className="text-[#e8e6e1] font-semibold mb-6">Enrolled Students ({students.length})</h3>
                {students.length === 0 ? (
                  <p className="text-[#a8a6a1] text-center py-8">No students enrolled yet.</p>
                ) : (
                  <div className="space-y-3">
                    {students.map((student: any, index) => (
                      <div
                        key={student._id || index}
                        className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FFD600]/20 flex items-center justify-center">
                            <span className="text-[#FFD600] font-semibold">
                              {(student.name || 'S')[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-[#e8e6e1] font-medium">{student.name || 'Unknown Student'}</p>
                            <p className="text-[#a8a6a1] text-sm">{student.email || 'No email'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'assignments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {!selectedAssignment ? (
              <GlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[#e8e6e1] font-semibold">Assignments</h3>
                    <button 
                      onClick={() => setShowAssignmentModal(true)}
                      className="btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                    >
                      + Create Assignment
                    </button>
                  </div>
                  {assignments.length === 0 ? (
                    <p className="text-[#a8a6a1] text-center py-8">No assignments yet. Create one to get started!</p>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((assignment: any) => (
                        <div
                          key={assignment._id}
                          onClick={() => setSelectedAssignment(assignment)}
                          className="p-4 bg-[#1a1a1a] rounded-lg flex items-center justify-between hover:bg-[#2a2a2a] transition-colors cursor-pointer border border-transparent hover:border-[#FFD600]/20"
                        >
                          <div className="flex-1">
                            <p className="text-[#e8e6e1] font-medium">{assignment.title}</p>
                            <p className="text-[#a8a6a1] text-sm mt-1">{assignment.description}</p>
                            <p className="text-[#a8a6a1] text-xs mt-2">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#FFD600]/20 text-[#FFD600] text-xs font-medium">
                            {assignment.submissions?.length || 0}/{students.length} Submitted
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedAssignment(null)}
                      className="p-2 hover:bg-[#FFD600]/10 rounded-lg transition-colors text-[#FFD600]"
                    >
                      <Plus className="w-6 h-6 rotate-45" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-[#e8e6e1]">{selectedAssignment.title}</h2>
                      <p className="text-[#a8a6a1] text-sm">Manage submissions and settings</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 p-1 bg-[#1a1a1a] rounded-xl border border-[#FFD600]/10 w-fit">
                  {(['submissions', 'settings'] as const).map((tab) => (
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
                            <Check className="w-12 h-12 text-[#FFD600]/30 mx-auto mb-4" />
                            <p className="text-[#a8a6a1]">No submissions received yet.</p>
                          </div>
                        </GlassCard>
                      ) : (
                        selectedAssignment.submissions.map((submission: any, idx: number) => (
                          <GlassCard key={idx}>
                            <div className="p-6 flex items-center justify-between">
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
                                  <button className="btn-3d bg-[#FFD600] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors text-xs">
                                    Grade Now
                                  </button>
                                )}
                                <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors text-[#a8a6a1]">
                                  <FileText className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </GlassCard>
                        ))
                      )}
                    </div>
                  )}

                  {assignmentSubTab === 'settings' && (
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
                </motion.div>
              </div>
            )}
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#e8e6e1] font-semibold">Class Materials</h3>
                  <button 
                    onClick={() => setShowMaterialModal(true)}
                    className="btn-3d bg-[#FFD600] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                  >
                    + Upload Material
                  </button>
                </div>
                {materials.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#a8a6a1]">No materials uploaded yet.</p>
                    <p className="text-[#a8a6a1] text-sm mt-2">Upload course materials, syllabus, or notes for your students.</p>
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
                          <p className="text-[#a8a6a1] text-sm mt-1">{material.description}</p>
                          <p className="text-[#a8a6a1] text-xs mt-2">
                            {material.type === 'url' ? 'Link' : `${material.fileName} • ${(material.fileSize / 1024).toFixed(2)} KB`} • {new Date(material.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <a 
                            href={material.fileUrl.startsWith('/') ? `http://localhost:3001${material.fileUrl}` : material.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-3d bg-[#FFD600]/10 text-[#FFD600] font-semibold py-2 px-4 rounded-lg hover:bg-[#FFD600]/20 transition-colors"
                          >
                            {material.type === 'url' ? 'Open Link' : 'Download'}
                          </a>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this material?')) {
                                try {
                                  await teacherAPI.deleteMaterial(material._id);
                                  setMaterials(materials.filter(m => m._id !== material._id));
                                } catch (error: any) {
                                  alert(`Error: ${error.message}`);
                                }
                              }
                            }}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
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

        {showMaterialModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1a1a1a] rounded-xl max-w-2xl w-full p-6 border border-[#FFD600]/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#FFD600]">Upload Material</h2>
                <button
                  onClick={() => setShowMaterialModal(false)}
                  className="p-2 hover:bg-[#FFD600]/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUploadMaterial} className="space-y-4">
                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Material Title</label>
                  <input
                    type="text"
                    value={materialData.title}
                    onChange={(e) => setMaterialData({...materialData, title: e.target.value})}
                    className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Description (Optional)</label>
                  <textarea
                    value={materialData.description}
                    onChange={(e) => setMaterialData({...materialData, description: e.target.value})}
                    className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none min-h-20"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Select File</label>
                  <input
                    type="file"
                    onChange={(e) => setMaterialData({...materialData, file: e.target.files?.[0] || null})}
                    className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none"
                    disabled={!!materialData.url}
                  />
                  {materialData.file && (
                    <p className="text-[#FFD600] text-xs mt-2">📎 {materialData.file.name} ({(materialData.file.size / 1024).toFixed(2)} KB)</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-[#FFD600]/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#1a1a1a] text-[#a8a6a1]">OR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Material URL</label>
                  <input
                    type="url"
                    value={materialData.url}
                    onChange={(e) => setMaterialData({...materialData, url: e.target.value})}
                    placeholder="https://example.com/document"
                    className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none"
                    disabled={!!materialData.file}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-3d bg-[#FFD600] text-black font-semibold py-3 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                  >
                    Upload Material
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMaterialModal(false)}
                    className="flex-1 btn-3d bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors border border-[#FFD600]/20"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAssignmentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1a1a1a] rounded-xl max-w-2xl w-full p-6 border border-[#FFD600]/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#FFD600]">Create New Assignment</h2>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="p-2 hover:bg-[#FFD600]/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Assignment Title</label>
                  <input
                    type="text"
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData({...assignmentData, title: e.target.value})}
                    className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Description</label>
                  <textarea
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({...assignmentData, description: e.target.value})}
                    className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none min-h-24"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Instructions</label>
                  <textarea
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData({...assignmentData, instructions: e.target.value})}
                    className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none min-h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#a8a6a1] text-sm mb-2">Type</label>
                    <select
                      value={assignmentData.type}
                      onChange={(e) => setAssignmentData({...assignmentData, type: e.target.value})}
                      className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none"
                    >
                      <option value="homework">Homework</option>
                      <option value="quiz">Quiz</option>
                      <option value="project">Project</option>
                      <option value="exam">Exam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a8a6a1] text-sm mb-2">Total Points</label>
                    <input
                      type="number"
                      value={assignmentData.totalPoints}
                      onChange={(e) => setAssignmentData({...assignmentData, totalPoints: parseInt(e.target.value)})}
                      className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={assignmentData.dueDate}
                    onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.target.value})}
                    className="w-full bg-[#0a0a0a] text-[#e8e6e1] rounded-lg px-4 py-2 border border-[#FFD600]/10 focus:border-[#FFD600] outline-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-3d bg-[#FFD600] text-black font-semibold py-3 rounded-lg hover:bg-[#FFD600]/90 transition-colors"
                  >
                    Create Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAssignmentModal(false)}
                    className="flex-1 btn-3d bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors border border-[#FFD600]/20"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1a1a1a] rounded-xl max-w-md w-full p-6 border border-red-500/20"
            >
              <h2 className="text-2xl font-bold text-red-400 mb-4">Delete Class?</h2>
              <p className="text-[#a8a6a1] mb-6">
                Are you sure you want to delete <span className="font-semibold text-[#e8e6e1]">{course.title}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteClass}
                  className="flex-1 btn-3d bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Class
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-3d bg-[#1a1a1a] text-[#e8e6e1] font-semibold py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors border border-[#FFD600]/20"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
