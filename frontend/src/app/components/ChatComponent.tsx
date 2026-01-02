import { useState, useEffect } from 'react';
import { Bot, User, Send } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { chatAPI } from '../api';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
}

interface ChatComponentProps {
  title: string;
  placeholder: string;
  role: 'student' | 'teacher';
  externalMessage?: string;
  onMessageProcessed?: () => void;
}

export function ChatComponent({ title, placeholder, role, externalMessage, onMessageProcessed }: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm your AI ${role === 'student' ? 'study' : 'teaching'} assistant. How can I help you ${role === 'student' ? 'with your learning' : 'with your teaching'} today?`,
      isAI: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (externalMessage && !isLoading) {
      processMessage(externalMessage);
      if (onMessageProcessed) {
        onMessageProcessed();
      }
    }
  }, [externalMessage]);

  const processMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      isAI: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // First, check if backend is reachable
      try {
        const healthCheck = await fetch('/api/health').catch(() => null);
        if (!healthCheck || !healthCheck.ok) {
          throw new Error('Backend server is unreachable via proxy. Please ensure backend is running on port 3001.');
        }
      } catch (e: any) {
        throw new Error('Backend server is unreachable via proxy. Please ensure backend is running on port 3001.');
      }

      const response = await chatAPI.sendMessage(text, role);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isAI: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      let errorText = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to send message')) {
          errorText = 'Unable to connect to the server. Please check your connection.';
        } else {
          errorText = `Error: ${error.message}`;
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isAI: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    processMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <GlassCard>
      <div className="p-6">
        <h3 className="text-[#e8e6e1] font-semibold mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#FFD600]" />
          {title}
        </h3>

        <div className="h-96 bg-[#1a1a1a] rounded-xl p-4 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.isAI ? '' : 'justify-end'}`}>
                {message.isAI && (
                  <div className="w-8 h-8 rounded-full bg-[#FFD600] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                )}
                <div className={`rounded-lg p-3 max-w-xs ${message.isAI ? 'bg-[#2a2a2a]' : 'bg-[#FFD600]'}`}>
                  <p className={`text-sm ${message.isAI ? 'text-[#e8e6e1]' : 'text-black'}`}>
                    {message.text}
                  </p>
                </div>
                {!message.isAI && (
                  <div className="w-8 h-8 rounded-full bg-[#FFD600] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFD600] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-black" />
                </div>
                <div className="bg-[#2a2a2a] rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#FFD600] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#FFD600] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#FFD600] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-[#1a1a1a] text-[#e8e6e1] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD600] disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="btn-3d bg-[#FFD600] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#FFD600]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </GlassCard>
  );
}