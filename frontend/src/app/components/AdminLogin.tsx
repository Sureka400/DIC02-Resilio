import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { authAPI } from '../api';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
  onSignup: () => void;
}

export function AdminLogin({ onLogin, onBack, onSignup }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.login({ email, password });
      setIsLoading(false);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
          Back to Role Selection
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
                <div className="w-16 h-16 rounded-full bg-[#FF3333]/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#FF3333]" />
                </div>
                <h2 className="text-2xl font-bold text-[#e8e6e1] mb-2">Administrator Login</h2>
                <p className="text-[#a8a6a1]">Access system administration</p>
                {error && <p className="text-red-400 mt-4 text-sm bg-red-400/10 p-2 rounded">{error}</p>}
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#a8a6a1] text-sm mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a8a6a1]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@university.edu"
                      className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF3333] border border-[#FF3333]/20"
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
                      placeholder="Enter your password"
                      className="w-full bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-10 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#FF3333] border border-[#FF3333]/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a8a6a1] hover:text-[#FF3333] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[#a8a6a1]">
                    <input type="checkbox" className="rounded border-[#FF3333]/20 bg-[#1a1a1a]" />
                    Remember me
                  </label>
                  <a href="#" className="text-[#FF3333] hover:text-[#FF5555] transition-colors">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-3d bg-[#FF3333] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#FF5555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-[#a8a6a1]">
                  Don't have an account?{' '}
                  <button
                    onClick={onSignup}
                    className="text-[#FF3333] font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
                <p className="text-[#a8a6a1] text-sm mb-2">Demo Credentials:</p>
                <p className="text-[#FF3333] text-xs">Email: admin@university.edu</p>
                <p className="text-[#FF3333] text-xs">Password: admin123</p>
              </div>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-[#FF3333]/10 border border-[#FF3333]/20 rounded-lg">
                <p className="text-[#FF3333] text-xs text-center">
                  🔒 Administrator access requires elevated security clearance
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}