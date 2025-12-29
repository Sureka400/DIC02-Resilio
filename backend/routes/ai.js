const express = require('express');
const { authenticate, requireStudent } = require('../middleware/auth');
const StudentBehavior = require('../models/StudentBehavior');

const router = express.Router();

const HF_API_KEY = process.env.HF_API_KEY;

/**
 * @route GET /api/ai/insights/:studentId
 * @desc Get AI-generated supportive insights based on behavior
 * @access Private (Student only for privacy)
 */
router.get('/insights/:studentId', [authenticate, requireStudent], async (req, res) => {
  try {
    const { studentId } = req.params;

    // ETHICAL PRIVACY DECISION: Detailed AI messages are private to students.
    // Teachers only see the high-level engagement/risk levels via the profile endpoint.
    if (req.user.id !== studentId) {
      return res.status(403).json({ 
        message: 'Privacy policy: Detailed AI motivational insights are private to the student.' 
      });
    }

    const behavior = await StudentBehavior.findOne({ studentId });
    if (!behavior) {
      return res.status(404).json({ message: 'No behavior data found to generate insights.' });
    }

    // Construct a non-judgmental prompt
    const prompt = `Based on this student data: ${behavior.loginFrequency} logins per week, ${behavior.assignmentSubmission} submissions, ${behavior.timeSpentOnMaterials} minutes spent on materials, ${behavior.missedDeadlinesCount} missed deadlines. Generate a supportive, non-judgmental motivational message. 
    Rules:
    - Tone: Empathetic and encouraging
    - No mental health diagnosis
    - No medical claims
    - Focus on study habits and motivation only
    Output:`;

    // Hugging Face Inference API call
    // Using Mistral-7B-Instruct for better natural language generation than BART-CNN
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { 
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('HF API Error Details:', errorData);
      throw new Error('Hugging Face API request failed');
    }

    const result = await response.json();
    
    let insightMessage = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      // Clean up the response to remove the prompt part if the model repeats it
      insightMessage = result[0].generated_text.split('Output:').pop().trim();
    } else {
      insightMessage = "You're making progress! Remember that every small step counts towards your goals. Let's try to focus on one task today.";
    }

    res.json({ 
      studentId,
      insight: insightMessage,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ message: 'Failed to generate AI insights' });
  }
});

module.exports = router;
