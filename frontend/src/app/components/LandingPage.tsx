import { motion } from 'motion/react';
import { Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignup: () => void;
}

export function LandingPage({ onGetStarted, onSignup }: LandingPageProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <div className="gradient-overlay" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <Sparkles className="w-20 h-20 text-[#FFD600] animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-[#FFD600] opacity-30" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6"
            style={{
              fontSize: '4.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFD600 0%, #FFF8DC 50%, #FFD600 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Innovation Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl text-[#a8a6a1] max-w-2xl mx-auto mb-12"
            style={{ lineHeight: 1.6 }}
          >
            Experience the future of intelligent learning. Powerful, refined, and built for those who dare to lead.
          </motion.p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              onClick={onGetStarted}
              className="btn-3d group inline-flex items-center gap-3 px-10 py-5 bg-[#FFD600] text-[#0a0a0a] rounded-2xl overflow-hidden relative w-full sm:w-auto"
              style={{ fontSize: '1.125rem', fontWeight: 600 }}
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD600] to-[#FFB800] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              onClick={onSignup}
              className="btn-3d group inline-flex items-center gap-3 px-10 py-5 bg-[#1a1a1a] text-[#FFD600] border border-[#FFD600]/20 rounded-2xl overflow-hidden relative w-full sm:w-auto"
              style={{ fontSize: '1.125rem', fontWeight: 600 }}
            >
              <span className="relative z-10">Sign Up</span>
              <div className="absolute inset-0 bg-[#FFD600]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <GlassCard className="h-full">
              <div className="relative">
                <div className="mb-6 inline-block">
                  <Zap className="w-12 h-12 text-[#FFD600]" />
                  <div className="absolute inset-0 blur-lg bg-[#FFD600] opacity-20" />
                </div>
                <h3 className="mb-4 text-[#FFD600]" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  Lightning Fast
                </h3>
                <p className="text-[#a8a6a1]" style={{ lineHeight: 1.7 }}>
                  Experience seamless performance with cutting-edge technology designed for speed and efficiency.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <GlassCard className="h-full">
              <div className="relative">
                <div className="mb-6 inline-block">
                  <Shield className="w-12 h-12 text-[#FFD600]" />
                  <div className="absolute inset-0 blur-lg bg-[#FFD600] opacity-20" />
                </div>
                <h3 className="mb-4 text-[#FFD600]" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  Secure by Design
                </h3>
                <p className="text-[#a8a6a1]" style={{ lineHeight: 1.7 }}>
                  Your data is protected with enterprise-grade security, ensuring peace of mind at every step.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <GlassCard className="h-full">
              <div className="relative">
                <div className="mb-6 inline-block">
                  <Sparkles className="w-12 h-12 text-[#FFD600]" />
                  <div className="absolute inset-0 blur-lg bg-[#FFD600] opacity-20" />
                </div>
                <h3 className="mb-4 text-[#FFD600]" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  Intuitive Experience
                </h3>
                <p className="text-[#a8a6a1]" style={{ lineHeight: 1.7 }}>
                  Navigate with confidence through an interface that anticipates your needs and adapts to your workflow.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
