const express = require('express');
const OpenAI = require('openai');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat endpoint for students and teachers
router.post('/chat', async (req, res) => {
  try {
    const { message, role } = req.body; // role can be 'student' or 'teacher'

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Create system prompt based on role
    let systemPrompt = '';
    if (role === 'student') {
      systemPrompt = 'You are an AI study assistant helping students with their learning. Provide clear, helpful explanations and encourage understanding.';
    } else if (role === 'teacher') {
      systemPrompt = 'You are an AI teaching assistant helping teachers with lesson planning, student assessment, and educational strategies. Provide professional, educational guidance.';
    } else {
      systemPrompt = 'You are a helpful AI assistant for educational purposes.';
    }

    // Check if API key is set
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('Using mock AI response (API key not set)');
      let mockResponse = '';
      const lowerMsg = message.toLowerCase();
      
      if (role === 'student') {
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
          mockResponse = "Hello! I'm your AI study assistant. I can help you with your homework, explain difficult concepts, or help you plan your study schedule. What would you like to learn about today?";
        } else if (lowerMsg.includes('math') || lowerMsg.includes('solve')) {
          mockResponse = `That sounds like an interesting math problem! Math is all about patterns and logic. While I'm in demo mode, I can't solve complex equations, but remember to always check your work and understand the "why" behind each step. You asked: "${message}".`;
        } else if (lowerMsg.includes('explain') || lowerMsg.includes('what is')) {
          if (lowerMsg.includes('ai') || lowerMsg.includes('artificial intelligence')) {
            mockResponse = "Artificial Intelligence (AI) is the simulation of human intelligence by machines, especially computer systems. It involves learning (acquiring information and rules), reasoning (using rules to reach conclusions), and self-correction. Modern AI, like what I use, is often based on Large Language Models that process vast amounts of text to understand and generate human-like conversation.";
          } else {
            mockResponse = `That's a great question! Explaining "${message}" would involve looking at its core principles and how it relates to other concepts in your syllabus. In a full production environment, I would provide a detailed breakdown here.`;
          }
        } else if (lowerMsg.includes('study plan') || lowerMsg.includes('schedule')) {
          mockResponse = "A good study plan is essential for success! I recommend focusing on your most difficult subjects when you have the most energy. Try using the Pomodoro technique: 25 minutes of focus followed by a 5-minute break.";
        } else {
          mockResponse = `I've noted your question about "${message}". As your AI study assistant, I'm here to help you understand complex topics and stay organized. (Note: To enable real-time dynamic AI responses, please configure a valid OpenAI API key in the backend .env file).`;
        }
      } else if (role === 'teacher') {
        if (lowerMsg.includes('lesson plan') || lowerMsg.includes('teaching')) {
          mockResponse = "Creating an engaging lesson plan is key! I recommend starting with clear learning objectives and including interactive activities to keep students engaged. I can help you generate specific plans once the AI key is configured.";
        } else if (lowerMsg.includes('quiz') || lowerMsg.includes('question')) {
          mockResponse = "I can help you generate varied quiz questions, from multiple choice to short answers. This helps assess different levels of student understanding. Please enable the AI key to generate a full quiz.";
        } else {
          mockResponse = `I've analyzed your inquiry: "${message}". As your AI teaching assistant, I can help you with lesson planning, student assessment, and educational strategies. (Note: To enable real AI responses, please configure a valid OpenAI API key in the backend .env file).`;
        }
      } else {
        mockResponse = `I received your message: "${message}". I'm currently in demo mode. Please set a valid OpenAI API key in the backend .env file to enable full AI capabilities!`;
      }
      return res.status(200).json({ response: mockResponse });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Chat Error:', error);
    
    // Fallback response for any error
    const fallbackResponse = "I'm sorry, I'm having trouble connecting to my AI service right now. This usually happens if the API key is invalid or there's a network issue. Please check the backend console for more details.";
    res.status(500).json({ 
      response: fallbackResponse,
      error: error.message 
    });
  }
});

module.exports = router;