const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// POST /api/ai/generate-content - Generate content using OpenAI
router.post('/generate-content', requireAuth, async (req, res) => {
  try {
    const { systemPrompt, userInstructions } = req.body;

    if (!userInstructions || !userInstructions.trim()) {
      return res.status(400).json({ message: 'User instructions are required' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key not configured' });
    }

    // Import OpenAI (dynamic import to handle if package isn't installed)
    let OpenAI;
    try {
      OpenAI = require('openai');
    } catch (error) {
      console.error('OpenAI package not installed:', error);
      return res.status(500).json({ message: 'OpenAI integration not available' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Prepare messages for OpenAI
    const messages = [];
    
    // Add system prompt if provided
    if (systemPrompt && systemPrompt.trim()) {
      messages.push({
        role: 'system',
        content: systemPrompt.trim()
      });
    } else {
      // Default system prompt for marketing content
      messages.push({
        role: 'system',
        content: 'You are a helpful AI assistant that creates engaging marketing content. Focus on creating compelling, professional content that drives engagement and conversions.'
      });
    }

    // Add user instructions
    messages.push({
      role: 'user',
      content: userInstructions.trim()
    });

    // Make API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      return res.status(500).json({ message: 'Failed to generate content' });
    }

    res.json({ content: generatedContent });

  } catch (error) {
    console.error('Error generating content:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ message: 'OpenAI API quota exceeded' });
    } else if (error.code === 'invalid_api_key') {
      return res.status(401).json({ message: 'Invalid OpenAI API key' });
    } else if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
    }
    
    res.status(500).json({ message: 'Server error during content generation' });
  }
});

module.exports = router;
