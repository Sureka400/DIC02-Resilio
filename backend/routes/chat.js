const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
<<<<<<< HEAD
const OpenAI = require('openai');
const axios = require('axios');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to call Hugging Face Inference API (Free alternative)
async function callHuggingFaceAPI(message, systemPrompt) {
  if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY.includes('replace_with_your')) {
    throw new Error('Hugging Face API key not configured');
  }

  // Use the new router endpoint and a supported free model
  const model = 'Qwen/Qwen2.5-7B-Instruct';
  
  const response = await axios.post('https://router.huggingface.co/v1/chat/completions', {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    max_tokens: 500,
    temperature: 0.7,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
    return response.data.choices[0].message.content.trim();
  }

  throw new Error('Unexpected response format from Hugging Face API');
}

// Helper function for demo mode (works without API keys)
async function callDemoAPI(message, role) {
  const demoResponses = {
    student: {
      'what is': 'Based on the question you asked, this is a fundamental concept in education. Let me break it down for you step by step.',
      'how do': 'Here\'s a helpful approach to solve this problem: 1) First, understand the core concept. 2) Break it down into smaller parts. 3) Practice with examples.',
      'explain': 'Sure! This is an important topic. The key points are: understanding the basics, practicing regularly, and asking questions when confused.',
      'default': 'That\'s a great question! To answer this properly, let me think about the key aspects: First, we need to understand the fundamentals. Then, we can explore how it applies in practice. Would you like me to explain any specific part in more detail?'
    },
    teacher: {
      'lesson': 'For effective lesson planning, consider: 1) Learning objectives, 2) Student engagement strategies, 3) Assessment methods, 4) Resource allocation.',
      'assessment': 'Assessment strategies: Use formative assessments to track progress, summative assessments to measure learning, and provide constructive feedback.',
      'student': 'Effective student management involves: clear expectations, positive reinforcement, consistent routines, and individualized attention.',
      'default': 'Great pedagogical question! Consider these approaches: 1) Align with learning objectives, 2) Engage diverse learners, 3) Use varied assessment methods, 4) Reflect and adapt.'
    }
  };

  const responses = demoResponses[role] || demoResponses.student;
  const lowerMessage = message.toLowerCase();
  
  for (const [key, response] of Object.entries(responses)) {
    if (key !== 'default' && lowerMessage.includes(key)) {
      return response;
    }
  }
  
  return responses.default;
}

=======
const { authenticate } = require('../middleware/auth');
const router = express.Router();

>>>>>>> 6d788d8537408203b3ed942a31960d7c4700437b
// Chat endpoint for students and teachers
router.post('/chat', async (req, res) => {
  try {
    const { message, role } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

<<<<<<< HEAD
    let systemPrompt = '';
    if (role === 'student') {
      systemPrompt = 'You are an AI study assistant helping students with their learning. Provide clear, helpful explanations and encourage understanding. Keep responses concise but informative.';
=======
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
>>>>>>> 6d788d8537408203b3ed942a31960d7c4700437b
    } else if (role === 'teacher') {
      systemPrompt = 'You are an AI teaching assistant helping teachers with lesson planning, student assessment, and educational strategies. Provide professional, educational guidance.';
    } else {
      systemPrompt = 'You are a helpful AI assistant for educational purposes.';
    }

<<<<<<< HEAD
    let aiResponse;

    try {
      aiResponse = await callHuggingFaceAPI(message, systemPrompt);
      console.log('✅ Hugging Face API request successful');
    } catch (hfError) {
      console.log('⚠️ Hugging Face API failed, trying OpenAI...');
      
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 1024,
        });
        aiResponse = completion.choices[0].message.content;
        console.log('✅ OpenAI API request successful');
      } catch (openaiError) {
        console.log('⚠️ OpenAI API failed, trying Gemini...');
        
        try {
          const prompt = `${systemPrompt}\n\nUser: ${message}`;
          const result = await geminiModel.generateContent(prompt);
          const response = await result.response;
          aiResponse = response.text();
          console.log('✅ Gemini API request successful');
        } catch (geminiError) {
          console.log('⚠️ All APIs failed, using demo mode...');
          aiResponse = await callDemoAPI(message, role);
        }
      }
    }
=======
    const prompt = `${systemPrompt}\n\nUser: ${message}\nAI:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
>>>>>>> 6d788d8537408203b3ed942a31960d7c4700437b

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
<<<<<<< HEAD
    
    if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate')) {
      return res.status(429).json({ 
        message: 'API rate limit exceeded. All providers are temporarily unavailable. Please try again in a few moments.',
        error: error.message 
      });
    }
    
    res.status(500).json({ message: 'Failed to get AI response', error: error.message });
=======
    res.status(500).json({ message: 'Failed to get AI response' });
>>>>>>> 6d788d8537408203b3ed942a31960d7c4700437b
  }
});

module.exports = router;