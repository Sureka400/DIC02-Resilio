import { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Eye, EyeOff, ArrowLeft, Mail, Lock, User, BookOpen, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { authAPI } from '../api';

interface SignupPageProps {
  onSignupSuccess: (role: 'student' | 'teacher' | 'admin') => void;
  onBack: () => void;
}

export function SignupPage({ onSignupSuccess, onBack }: SignupPageProps) {
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
      await authAPI.register({ name, email, password, role });
      setIsLoading(false);
      onSignupSuccess(role);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <div className="gradient-overlay" />

      <div className="relative z-10 max-w-md mx-auto w-full">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-[#a8a6a1] hover:text-[#FFD600] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard>
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#FFD600]/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-[#FFD600]" />
                </div>
                <h2 className="text-2xl font-bold text-[#e8e6e1] mb-2">Create Account</h2>
                <p className="text-[#a8a6a1]">Join our innovation platform</p>
                {error && <p className="text-red-400 mt-4 text-sm bg-red-400/10 p-2 rounded">{error}</p>}
              </div>

              {/* Signup Form */}
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
                      placeholder="you@example.com"
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
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'student', icon: GraduationCap },
                      { id: 'teacher', icon: BookOpen },
                      { id: 'admin', icon: Shield },
                    ].map((r) => {
                      const Icon = r.icon;
                      const isActive = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id as any)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-[#FFD600]/10 border-[#FFD600] text-[#FFD600]'
                              : 'bg-[#1a1a1a] border-[#FFD600]/20 text-[#a8a6a1] hover:border-[#FFD600]/50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs capitalize">{r.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFB800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
