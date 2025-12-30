import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, TrendingUp, BookOpen, Lightbulb } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ChartCard } from './ChartCard';

interface AiInsightsProps {
  role: 'student' | 'teacher';
  data?: any;
}

export function AiInsights({ role, data }: AiInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const generateInsight = async (type: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai-insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          context: data || { message: "Generate general educational insights" }
        })
      });

      if (!response.ok) throw new Error('Failed to generate insight');
      const result = await response.json();
      setInsight(result.insight);
    } catch (error) {
      console.error(error);
      setInsight("Sorry, I couldn't generate insights at this moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { 
            id: 'performance', 
            label: 'Performance Analysis', 
            icon: TrendingUp,
            description: role === 'student' ? 'Analyze your grades and progress' : 'Analyze class-wide performance'
          },
          { 
            id: 'learning-path', 
            label: 'Learning Roadmap', 
            icon: BookOpen,
            description: role === 'student' ? 'Get a personalized study plan' : 'Generate lesson roadmaps'
          },
          { 
            id: 'general', 
            label: 'Smart Tips', 
            icon: Lightbulb,
            description: 'AI-powered educational suggestions'
          }
        ].map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassCard enableParallax={false}>
              <button
                onClick={() => generateInsight(item.id)}
                disabled={loading}
                className="w-full text-left"
              >
                <div className="p-2 rounded-xl bg-[#FFD600]/10 w-fit mb-4">
                  <item.icon className="w-6 h-6 text-[#FFD600]" />
                </div>
                <h3 className="text-[#e8e6e1] font-semibold mb-2">{item.label}</h3>
                <p className="text-[#a8a6a1] text-sm">{item.description}</p>
              </button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <ChartCard 
        title="AI Generated Insights" 
        description={loading ? "Analyzing data with Gemini AI..." : "Select an analysis type above"}
      >
        <div className="min-h-[200px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD600]"></div>
            </div>
          ) : insight ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-invert max-w-none"
            >
              <div className="flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-xl border border-[#FFD600]/20">
                <Sparkles className="w-5 h-5 text-[#FFD600] shrink-0 mt-1" />
                <div className="text-[#e8e6e1] whitespace-pre-wrap leading-relaxed">
                  {insight}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#a8a6a1] space-y-4 py-12">
              <Brain className="w-16 h-16 opacity-20" />
              <p>Click an option above to generate personalized insights</p>
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
