const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');

// Get all campaigns
router.get('/', requireAuth, async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new campaign
router.post('/', requireAuth, async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    const newCampaign = await campaign.save();
    res.status(201).json(newCampaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a specific campaign
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a campaign
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, status } = req.body;
    
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
    if (name) campaign.name = name;
    if (status) campaign.status = status;
    
    const updatedCampaign = await campaign.save();
    res.json(updatedCampaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a campaign
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
    // Update all posts that were linked to this campaign
    await Post.updateMany(
      { campaign: req.params.id },
      { $set: { campaign: null } }
    );
    
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
