const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/generate', authenticate, async (req, res) => {
  try {
    const { context, type } = req.body; // type can be 'performance', 'learning-path', 'assessment'
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({ message: 'AI configuration error' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = '';
    if (type === 'performance') {
      prompt = `Analyze the following student performance data and provide 3 actionable insights: ${JSON.stringify(context)}`;
    } else if (type === 'learning-path') {
      prompt = `Based on these interests and grades, suggest a personalized learning path with 5 steps: ${JSON.stringify(context)}`;
    } else {
      prompt = `Provide educational insights based on this context: ${JSON.stringify(context)}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ insight: text });
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    res.status(500).json({ message: 'Failed to generate AI insights' });
  }
});

module.exports = router;
