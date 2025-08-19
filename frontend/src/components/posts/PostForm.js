import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import config from '../../config';
import { Modal } from '../common';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AutoGrowTextarea from '../AutoGrowTextarea';
import '../../styles/posts.css';
import '../../styles/auto-grow-textarea.css';

const PostForm = ({ onPostUpdated, editingPost, setEditingPost, onDeletePost }) => {
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState('none');
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [selectedUser, setSelectedUser] = useState('none');
  const [selectedReviewer, setSelectedReviewer] = useState('none');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false); // Flag to indicate image should be removed
  
  // Fetch campaigns, users, and scheduled posts when component mounts
  useEffect(() => {
    fetchCampaigns();
    fetchUsers();
    fetchScheduledPosts();
  }, []);
  
  // Effect to populate form when editingPost changes
  useEffect(() => {
    if (!editingPost) return;
    setContent(editingPost.content);
    setScheduledDate(new Date(editingPost.scheduledDate));

    // Set campaign if post has one
    if (editingPost.campaign) {
      setSelectedCampaign(editingPost.campaign._id);
    } else {
      setSelectedCampaign('none');
    }

    // Set assigned user if post has one
    if (editingPost.assignedUser) {
      setSelectedUser(editingPost.assignedUser._id);
    } else {
      setSelectedUser('none');
    }

    // Set reviewer if post has one
    if (editingPost.reviewer) {
      setSelectedReviewer(editingPost.reviewer._id);
    } else {
      setSelectedReviewer('none');
    }

    // Set image preview if post has an image
    if (editingPost.imageUrl) {
      if (editingPost.imageUrl.startsWith('http')) {
        createRemoteImageThumbnail(editingPost.imageUrl);
      } else {
        createRemoteImageThumbnail(`${config.apiUrl}${editingPost.imageUrl}`);
      }
    } else {
      setImagePreview(null);
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
      const response = await api.get('/api/campaigns');
      setCampaigns(response.data);
      setLoadingCampaigns(false);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
      setLoadingCampaigns(false);
    }
  };

  // Fetch users from API for assignment
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/api/users/for-assignment');
      setUsers(response.data);
      setLoadingUsers(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setLoadingUsers(false);
    }
  };

  // Fetch scheduled posts from API
  const fetchScheduledPosts = async () => {
    try {
      const response = await api.get('/api/posts?status=scheduled');
      setScheduledPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching scheduled posts:', err);
      setScheduledPosts([]);
    }
  };
  
  const resetForm = () => {
    setContent('');
    setScheduledDate(new Date());
    setImage(null);
    setImagePreview(null);
    setSelectedCampaign('none');
    setSelectedUser('none');
    setSelectedReviewer('none');
    setError(null);
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
      await api.delete(`/api/posts/${editingPost._id}`);
      
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
    
    // Validate form
    if (!content) {
      setError('Post content is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    console.log('Submitting post form...');
    console.log('Auth token:', localStorage.getItem('token'));
    
    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append('content', content);
      console.log('Post content:', content);
      
      // Set the time to the start of the day (midnight) since we only collect the date
      let dateToSubmit = new Date(scheduledDate);
      dateToSubmit.setHours(0, 0, 0, 0);
      console.log('Scheduled date:', dateToSubmit.toISOString());
      formData.append('scheduledDate', dateToSubmit.toISOString());
      
      // Add campaign if selected
      if (selectedCampaign && selectedCampaign !== 'none') {
        console.log('Selected campaign:', selectedCampaign);
        formData.append('campaign', selectedCampaign);
      } else {
        console.log('No campaign selected');
      }
      
      // Add assigned user if selected
      if (selectedUser && selectedUser !== 'none') {
        console.log('Selected user:', selectedUser);
        formData.append('assignedUser', selectedUser);
      } else {
        console.log('No user assigned');
      }
      
      // Add reviewer if selected
      if (selectedReviewer && selectedReviewer !== 'none') {
        console.log('Selected reviewer:', selectedReviewer);
        formData.append('reviewer', selectedReviewer);
      } else {
        console.log('No reviewer assigned');
      }
      
      if (image) {
        console.log('Image attached:', image.name, image.type, image.size);
        formData.append('image', image);
      } else {
        console.log('No image attached');
      }
      
      // If the removeImage flag is set, tell the server to remove the image
      if (removeImage) {
        console.log('Removing existing image');
        formData.append('removeImage', 'true');
      }
      
      // Update existing post (only mode supported)
      console.log('Updating existing post:', editingPost._id);
      const response = await api.put(`/api/posts/${editingPost._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Update post response:', response);
      if (onPostUpdated) onPostUpdated(response.data);
      setEditingPost(null);
      
      // Reset the form
      resetForm();
      setLoading(false);
    } catch (err) {
      setError('Failed to update post. Please try again.');
      console.error('Error updating post:', err);
      setLoading(false);
    }
  };

  return (
    <div className="post-form-container">
      <h2>Edit Item</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="content">Post Content:</label>
          <AutoGrowTextarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here..."
            minRows={4}
            maxRows={12}
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
                  // Mark image for removal on save
                  setRemoveImage(true);
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="campaign">Campaign:</label>
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
            <label htmlFor="assignedUser">Assignee:</label>
            <select
              id="assignedUser"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="user-select"
              disabled={loadingUsers}
            >
              <option value="none">-- No User Assigned --</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {loadingUsers && <span className="loading-text">Loading users...</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="reviewer">Reviewer:</label>
            <select
              id="reviewer"
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              className="user-select"
              disabled={loadingUsers}
            >
              <option value="none">-- No Reviewer --</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {loadingUsers && <span className="loading-text">Loading users...</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="scheduledDate">Publish Date:</label>
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
            {loading ? 'Updating...' : 'Update Post'}
          </button>
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
          <button 
            type="button" 
            className="delete-btn" 
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
          >
            Delete Post
          </button>
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
