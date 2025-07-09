import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from '../common';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PostForm = ({ onPostCreated, onPostUpdated, editingPost, setEditingPost, onDeletePost }) => {
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('none');
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false); // Flag to indicate image should be removed
  
  // Fetch campaigns and scheduled posts when component mounts
  useEffect(() => {
    fetchCampaigns();
    fetchScheduledPosts();
  }, []);
  
  // Effect to populate form when editingPost changes
  useEffect(() => {
    if (editingPost) {
      setContent(editingPost.content);
      setScheduledDate(new Date(editingPost.scheduledDate));
      setIsEditing(true);
      
      // Set campaign if post has one
      if (editingPost.campaign) {
        setSelectedCampaign(editingPost.campaign._id);
      } else {
        setSelectedCampaign('none');
      }
      
      // Set image preview if post has an image
      if (editingPost.imageUrl) {
        // For Cloudinary URLs, we can use them directly
        // For local URLs, we need to prepend the API URL
        if (editingPost.imageUrl.startsWith('http')) {
          // Create thumbnail from remote image
          createRemoteImageThumbnail(editingPost.imageUrl);
        } else {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
          createRemoteImageThumbnail(`${apiUrl}${editingPost.imageUrl}`);
        }
      } else {
        setImagePreview(null);
      }
    } else {
      resetForm();
    }
  }, [editingPost]);
  
  // Create a thumbnail from a remote image URL
  const createRemoteImageThumbnail = (imageUrl) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS issues
    img.onload = () => {
      // Create a canvas element to resize the image
      const canvas = document.createElement('canvas');
      
      // Set max dimensions for the thumbnail
      const MAX_WIDTH = 300;
      const MAX_HEIGHT = 200;
      
      // Calculate the new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }
      
      // Resize the image
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      try {
        ctx.drawImage(img, 0, 0, width, height);
        // Get the data URL of the resized image
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        // Set the preview URL
        setImagePreview(thumbnailUrl);
      } catch (error) {
        console.error('Error creating thumbnail:', error);
        // Fallback to original URL if thumbnail creation fails
        setImagePreview(imageUrl);
      }
    };
    img.onerror = () => {
      console.error('Error loading image for thumbnail');
      setImagePreview(imageUrl); // Fallback to original URL
    };
    img.src = imageUrl;
  };
  
  // Fetch campaigns from API
  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/campaigns`);
      setCampaigns(response.data);
      setLoadingCampaigns(false);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setLoadingCampaigns(false);
    }
  };

  // Fetch scheduled posts from API
  const fetchScheduledPosts = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/posts`);
      setScheduledPosts(response.data);
    } catch (err) {
      console.error('Error fetching scheduled posts:', err);
    }
  };
  
  const resetForm = () => {
    setContent('');
    setScheduledDate(new Date());
    setImage(null);
    setImagePreview(null);
    setIsEditing(false);
    setError(null);
    setSelectedCampaign('none');
    setRemoveImage(false);
    
    // Reset the file input element by clearing its value
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Create a thumbnail from the selected image
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImage(selectedFile);
      
      // Store the original file in memory for upload
      createImageThumbnail(selectedFile);
    }
  };
  
  // Function to create a thumbnail from an image file
  const createImageThumbnail = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas element to resize the image
        const canvas = document.createElement('canvas');
        
        // Set max dimensions for the thumbnail
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 200;
        
        // Calculate the new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        
        // Resize the image
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the data URL of the resized image
        const thumbnailUrl = canvas.toDataURL(file.type);
        
        // Set the preview URL
        setImagePreview(thumbnailUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!editingPost) return;
    
    try {
      setDeleteLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      await axios.delete(`${apiUrl}/api/posts/${editingPost._id}`);
      
      if (onDeletePost) {
        onDeletePost(editingPost._id);
      }
      
      setShowDeleteModal(false);
      setEditingPost(null);
      resetForm();
    } catch (err) {
      setError('Error deleting post. Please try again.');
      console.error('Error deleting post:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create a FormData object to send the post data including the image
      const formData = new FormData();
      formData.append('content', content);
      
      // Set the time to the start of the day (midnight) since we only collect the date
      let dateToSubmit = new Date(scheduledDate);
      dateToSubmit.setHours(0, 0, 0, 0);
      
      formData.append('scheduledDate', dateToSubmit.toISOString());
      
      // Add campaign if selected
      if (selectedCampaign && selectedCampaign !== 'none') {
        formData.append('campaign', selectedCampaign);
      }
      
      if (image) {
        formData.append('image', image);
      }
      
      // If editing and the removeImage flag is set, tell the server to remove the image
      if (isEditing && removeImage) {
        formData.append('removeImage', 'true');
      }
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      let response;
      
      if (isEditing) {
        // Update existing post
        response = await axios.put(`${apiUrl}/api/posts/${editingPost._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Notify parent component that post was updated
        if (onPostUpdated) {
          onPostUpdated(response.data);
        }
        
        // Clear editing state
        setEditingPost(null);
      } else {
        // Create new post
        response = await axios.post(`${apiUrl}/api/posts`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Notify parent component that post was created
        if (onPostCreated) {
          onPostCreated(response.data);
        }
      }
      
      // Reset the form
      resetForm();
      setLoading(false);
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'add'} post. Please try again.`);
      console.error(`Error ${isEditing ? 'updating' : 'adding'} post:`, err);
      setLoading(false);
    }
  };

  return (
    <div className="post-form-container">
      <h2>{isEditing ? 'Edit' : 'Add'} Social Media Post</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="content">Post Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here..."
            rows={4}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Upload Image (optional):</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  // Set flag to remove image if we're editing an existing post
                  if (isEditing) {
                    setRemoveImage(true);
                  }
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="campaign">Select Campaign (optional):</label>
          <select
            id="campaign"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="campaign-select"
            disabled={loadingCampaigns}
          >
            <option value="none">-- No Campaign --</option>
            {campaigns.map(campaign => (
              <option key={campaign._id} value={campaign._id}>
                {campaign.name}
              </option>
            ))}
          </select>
          {loadingCampaigns && <span className="loading-text">Loading campaigns...</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="scheduledDate">Date:</label>
          <DatePicker
            id="scheduledDate"
            selected={scheduledDate}
            onChange={date => setScheduledDate(date)}
            dateFormat="MMMM d, yyyy"
            minDate={new Date()}
            className="date-picker"
            highlightDates={
              scheduledPosts.map(post => new Date(post.scheduledDate))
            }
            dayClassName={date => {
              const day = date.getDay();
              // Apply weekend class for Saturday (6) and Sunday (0)
              return (day === 0 || day === 6) ? 'react-datepicker__day--weekend' : undefined;
            }}
            // Make sure the component re-renders when scheduledPosts changes
            key={scheduledPosts.length}
          />
        </div>
        
        <div className="form-buttons">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Post' : 'Add Post')}
          </button>
          
          {isEditing && (
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => {
                setEditingPost(null);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          {isEditing && (
            <button 
              type="button" 
              className="delete-btn" 
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
            >
              Delete Post
            </button>
          )}
        </div>
      </form>
      
      {showDeleteModal && (
        <Modal 
          title="Confirm Delete"
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="delete-confirmation">
            <p>Do you really want to delete this post?</p>
            <p>This action cannot be undone.</p>
            
            <div className="modal-buttons">
              <button 
                className="cancel-btn" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="delete-btn" 
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete Post'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PostForm;
