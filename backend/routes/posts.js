const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('campaign').sort({ scheduledDate: 1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new post
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { content, scheduledDate, campaign } = req.body;
    
    const postData = {
      content,
      scheduledDate: new Date(scheduledDate),
    };

    // If a campaign was selected, add it to the post data
    if (campaign && campaign !== 'none') {
      postData.campaign = campaign;
    }

    // If an image was uploaded, add its path to the post data
    if (req.file) {
      // Store the relative path to access via API
      postData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const post = new Post(postData);
    const savedPost = await post.save();
    
    // Populate the campaign data before sending the response
    const populatedPost = await Post.findById(savedPost._id).populate('campaign');
    
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a specific post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a post (PATCH - partial update)
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const { content, scheduledDate } = req.body;
    
    const updateData = {};
    if (content) updateData.content = content;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    
    // If a new image was uploaded, update the image URL
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a post (PUT - full update)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const { content, scheduledDate, campaign } = req.body;
    
    // Update post data
    post.content = content;
    post.scheduledDate = new Date(scheduledDate);
    
    // Update campaign association
    if (campaign === 'none') {
      post.campaign = null;
    } else if (campaign) {
      post.campaign = campaign;
    }
    
    // Handle image update
    if (req.file) {
      // If post already has an image, delete the old one
      if (post.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', post.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set the new image URL
      post.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const updatedPost = await post.save();
    
    // Populate the campaign data before sending the response
    const populatedPost = await Post.findById(updatedPost._id).populate('campaign');
    
    res.json(populatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Delete the image file if it exists
    if (post.imageUrl) {
      const imagePath = path.join(__dirname, '..', post.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
