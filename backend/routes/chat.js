const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Chat endpoint for students and teachers
router.post('/chat', async (req, res) => {
  try {
    const { message, role } = req.body; // role can be 'student' or 'teacher'

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({ message: 'AI configuration error' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create system prompt based on role
    let systemPrompt = '';
    if (role === 'student') {
      systemPrompt = 'You are an AI study assistant helping students with their learning. Provide clear, helpful explanations and encourage understanding. If the user asks for code, ensure the code is well-formatted with correct indentation.';
    } else if (role === 'teacher') {
      systemPrompt = 'You are an AI teaching assistant helping teachers with lesson planning, student assessment, and educational strategies. Provide professional, educational guidance.';
    } else {
      systemPrompt = 'You are a helpful AI assistant for educational purposes.';
    }

    const prompt = `${systemPrompt}\n\nUser: ${message}\nAI:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ message: 'Failed to get AI response' });
  }
});

module.exports = router;