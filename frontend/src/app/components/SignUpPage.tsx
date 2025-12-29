import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, ArrowLeft, Eye, EyeOff, GraduationCap, BookOpen, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { authAPI } from '../api';

interface SignUpPageProps {
  onSignUp: (role: 'student' | 'teacher' | 'admin') => void;
  onBack: () => void;
}

export function SignUpPage({ onSignUp, onBack }: SignUpPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.register(name, email, password, role);
      onSignUp(role);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <div className="gradient-overlay" />

      <div className="relative z-10 max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-[#a8a6a1] hover:text-[#FFD600] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard>
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#e8e6e1] mb-2">Create Account</h2>
                <p className="text-[#a8a6a1]">Join the Resolio community</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a8a6a1]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600] border border-[#FFD600]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a8a6a1]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600] border border-[#FFD600]/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a8a6a1]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-10 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#FFD600] border border-[#FFD600]/20"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a8a6a1] hover:text-[#FFD600] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'student', icon: GraduationCap, label: 'Student' },
                      { id: 'teacher', icon: BookOpen, label: 'Teacher' },
                      { id: 'admin', icon: Shield, label: 'Admin' }
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as any)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                          role === r.id
                            ? 'bg-[#FFD600]/10 border-[#FFD600] text-[#FFD600]'
                            : 'bg-[#1a1a1a] border-[#FFD600]/10 text-[#a8a6a1] hover:border-[#FFD600]/30'
                        }`}
                      >
                        <r.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFB800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
