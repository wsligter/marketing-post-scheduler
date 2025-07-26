const express = require('express');
const router = express.Router();
const SystemPrompt = require('../models/SystemPrompt');
const { requireAuth } = require('../middleware/auth');

// GET /api/system-prompts - Get all system prompts for the authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    const prompts = await SystemPrompt.find({ 
      $or: [
        { createdBy: req.user._id },
        { isPublic: true }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching system prompts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/system-prompts - Create a new system prompt
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, content, isPublic = false } = req.body;

    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }

    // Check if a prompt with this name already exists for this user
    const existingPrompt = await SystemPrompt.findOne({
      name,
      createdBy: req.user._id
    });

    if (existingPrompt) {
      return res.status(400).json({ message: 'A prompt with this name already exists' });
    }

    const prompt = new SystemPrompt({
      name,
      content,
      isPublic,
      createdBy: req.user._id
    });

    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    console.error('Error creating system prompt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/system-prompts/:id - Update a system prompt
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, content, isPublic } = req.body;
    
    const prompt = await SystemPrompt.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!prompt) {
      return res.status(404).json({ message: 'System prompt not found' });
    }

    if (name) prompt.name = name;
    if (content) prompt.content = content;
    if (typeof isPublic === 'boolean') prompt.isPublic = isPublic;

    await prompt.save();
    res.json(prompt);
  } catch (error) {
    console.error('Error updating system prompt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/system-prompts/:id - Delete a system prompt
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const prompt = await SystemPrompt.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!prompt) {
      return res.status(404).json({ message: 'System prompt not found' });
    }

    await SystemPrompt.findByIdAndDelete(req.params.id);
    res.json({ message: 'System prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting system prompt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
