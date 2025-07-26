const express = require('express');
const router = express.Router();
const CompanyInfo = require('../models/CompanyInfo');
const { requireAuth } = require('../middleware/auth');

// GET /api/company-info - Get company information (accessible to all authenticated users)
router.get('/', requireAuth, async (req, res) => {
  try {
    let companyInfo = await CompanyInfo.findOne().populate('updatedBy', 'name email');
    
    // If no company info exists, create a default one
    if (!companyInfo) {
      companyInfo = new CompanyInfo({
        name: '',
        location: '',
        vision: '',
        mission: '',
        toneOfVoice: '',
        updatedBy: req.user._id
      });
      await companyInfo.save();
      await companyInfo.populate('updatedBy', 'name email');
    }
    
    res.json(companyInfo);
  } catch (error) {
    console.error('Error fetching company info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/company-info - Update company information (accessible to all authenticated users)
router.put('/', requireAuth, async (req, res) => {
  try {
    const { name, location, vision, mission, toneOfVoice } = req.body;
    
    // Find existing company info or create new one
    let companyInfo = await CompanyInfo.findOne();
    
    if (companyInfo) {
      // Update existing
      companyInfo.name = name || '';
      companyInfo.location = location || '';
      companyInfo.vision = vision || '';
      companyInfo.mission = mission || '';
      companyInfo.toneOfVoice = toneOfVoice || '';
      companyInfo.updatedBy = req.user._id;
    } else {
      // Create new
      companyInfo = new CompanyInfo({
        name: name || '',
        location: location || '',
        vision: vision || '',
        mission: mission || '',
        toneOfVoice: toneOfVoice || '',
        updatedBy: req.user._id
      });
    }
    
    await companyInfo.save();
    await companyInfo.populate('updatedBy', 'name email');
    
    res.json(companyInfo);
  } catch (error) {
    console.error('Error updating company info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
