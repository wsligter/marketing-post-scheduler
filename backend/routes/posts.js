const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImage, deleteImage } = require('../utils/cloudinary-actions');
const { requireAuth } = require('../middleware/auth');

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
router.get('/', requireAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('campaign')
      .populate('assignedUser', 'firstName lastName email')
      .sort({ scheduledDate: 1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new post
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { content, scheduledDate, campaign, assignedUser } = req.body;
    
    const postData = {
      content,
      scheduledDate: new Date(scheduledDate),
    };

    // If a campaign was selected, add it to the post data
    if (campaign && campaign !== 'none') {
      postData.campaign = campaign;
    }

    // If a user was assigned, add it to the post data
    if (assignedUser && assignedUser !== 'none') {
      postData.assignedUser = assignedUser;
    }

    // If an image was uploaded, upload it to Cloudinary
    if (req.file) {
      try {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadImage(req.file.path);
        
        // Store the Cloudinary URL
        postData.imageUrl = cloudinaryResult.secure_url;
      } catch (uploadError) {
        return res.status(400).json({ message: uploadError.message });
      }
    }

    const post = new Post(postData);
    const savedPost = await post.save();
    
    // Populate the campaign and assignedUser data before sending the response
    const populatedPost = await Post.findById(savedPost._id)
      .populate('campaign')
      .populate('assignedUser', 'firstName lastName email');
    
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a specific post
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a post (PATCH - partial update)
router.patch('/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { content, scheduledDate } = req.body;
    
    const updateData = {};
    if (content) updateData.content = content;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    
    // If a new image was uploaded, upload it to Cloudinary
    if (req.file) {
      try {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadImage(req.file.path);
        
        // Store the Cloudinary URL
        updateData.imageUrl = cloudinaryResult.secure_url;
      } catch (uploadError) {
        return res.status(400).json({ message: uploadError.message });
      }
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
router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const { content, scheduledDate, campaign, assignedUser } = req.body;
    
    // Update post data
    post.content = content;
    post.scheduledDate = new Date(scheduledDate);
    
    // Update campaign association
    if (campaign === 'none') {
      post.campaign = null;
    } else if (campaign) {
      post.campaign = campaign;
    }

    // Update user assignment
    if (assignedUser === 'none') {
      post.assignedUser = null;
    } else if (assignedUser) {
      post.assignedUser = assignedUser;
    }
    
    // Handle image update or removal
    if (req.file) {
      try {
        // If there was a previous image in Cloudinary, delete it
        if (post.imageUrl && post.imageUrl.includes('cloudinary.com')) {
          await deleteImage(post.imageUrl);
        }
        
        // Upload new image to Cloudinary
        const cloudinaryResult = await uploadImage(req.file.path);
        
        // Set the new image URL
        post.imageUrl = cloudinaryResult.secure_url;
      } catch (uploadError) {
        return res.status(400).json({ message: uploadError.message });
      }
    } else if (req.body.removeImage === 'true') {
      // User wants to remove the image without adding a new one
      try {
        // Delete from Cloudinary if it's a Cloudinary URL
        if (post.imageUrl && post.imageUrl.includes('cloudinary.com')) {
          await deleteImage(post.imageUrl);
        }
        
        // Remove the image URL from the post
        post.imageUrl = null;
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
        // Continue with the update even if image deletion fails
      }
    }
    
    const updatedPost = await post.save();
    
    // Populate the campaign and assignedUser data before sending the response
    const populatedPost = await Post.findById(updatedPost._id)
      .populate('campaign')
      .populate('assignedUser', 'firstName lastName email');
    
    res.json(populatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a post
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Delete the image from Cloudinary if it exists
    if (post.imageUrl && post.imageUrl.includes('cloudinary.com')) {
      try {
        await deleteImage(post.imageUrl);
        console.log(`Deleted image from Cloudinary: ${post.imageUrl}`);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue with post deletion even if image deletion fails
      }
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
