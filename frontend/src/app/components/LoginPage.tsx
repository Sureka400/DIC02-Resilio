import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';

type Role = 'student' | 'teacher' | 'admin' | null;

interface LoginPageProps {
  onRoleSelect: (role: Role) => void;
  onSignup: () => void;
}

export function LoginPage({ onRoleSelect, onSignup }: LoginPageProps) {
  const roles = [
    {
      id: 'student' as Role,
      title: 'Student',
      description: 'Access your courses, assignments, and track your progress',
      icon: GraduationCap,
      color: '#FFD600',
    },
    {
      id: 'teacher' as Role,
      title: 'Teacher',
      description: 'Manage classes, create content, and engage with students',
      icon: BookOpen,
      color: '#FFD600',
    },
    {
      id: 'admin' as Role,
      title: 'Administrator',
      description: 'Oversee platform operations and manage system settings',
      icon: Shield,
      color: '#FF3333',
    },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <div className="gradient-overlay" />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="mb-4" style={{ fontSize: '3rem', fontWeight: 700, color: '#FFD600' }}>
            Select Your Role
          </h1>
          <p className="text-[#a8a6a1]" style={{ fontSize: '1.125rem' }}>
            Choose your access level to continue
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isAdmin = role.id === 'admin';

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <button
                  onClick={() => onRoleSelect(role.id)}
                  className="w-full h-full text-left focus:outline-none group"
                >
                  <GlassCard className="h-full relative overflow-hidden">
                    <div className="relative z-10">
                      <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl ${isAdmin ? 'bg-[#FF3333]/10' : 'bg-[#FFD600]/10'}`}>
                        <Icon className="w-8 h-8" style={{ color: role.color }} />
                      </div>

                      <h3 className="mb-3" style={{ fontSize: '1.75rem', fontWeight: 600, color: role.color }}>
                        {role.title}
                      </h3>

                      <p className="text-[#a8a6a1] mb-6" style={{ lineHeight: 1.6 }}>
                        {role.description}
                      </p>

                      <div className="flex items-center gap-2" style={{ color: role.color }}>
                        <span style={{ fontWeight: 600 }}>Enter</span>
                        <motion.svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="group-hover:translate-x-2 transition-transform"
                        >
                          <path
                            d="M4 10h12m0 0l-4-4m4 4l-4 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      </div>
                    </div>

                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at center, ${role.color}10 0%, transparent 70%)`,
                      }}
                    />
                  </GlassCard>
                </button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-[#a8a6a1]">
            Don't have an account?{' '}
            <button
              onClick={onSignup}
              className="text-[#FFD600] font-semibold hover:underline"
            >
              Sign up for the first time
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
