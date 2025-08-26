import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import AutoGrowTextarea from '../AutoGrowTextarea';
import '../../styles/auto-grow-textarea.css';
import '../../styles/posts.css';

// Reusable form used by CreateNewPage and PostSchedulerPage
// Supports create and edit modes. In edit mode, pass `editingPost` and callbacks.
const CreateItemForm = ({
  onCreated,
  onUpdated,
  onCancelled,
  onDeleted,
  editingPost,
  registerSetContent,
  onRequestAIPanelToggle,
}) => {
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(new Date());

  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('none');
  const [selectedUser, setSelectedUser] = useState('none');
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [removeImage, setRemoveImage] = useState(false);

  // Expose setContent to parent so AI panel can inject text
  useEffect(() => {
    if (typeof registerSetContent === 'function') {
      registerSetContent((text) => setContent(text));
    }
  }, [registerSetContent]);

  useEffect(() => {
    fetchCampaigns();
    fetchUsers();
    fetchScheduledPosts();
  }, []);

  // Populate fields in edit mode; reset when exiting edit mode
  useEffect(() => {
    if (!editingPost) {
      // Exited edit mode -> clear all fields
      resetForm();
      return;
    }
    setContent(editingPost.content || '');
    setScheduledDate(editingPost.scheduledDate ? new Date(editingPost.scheduledDate) : new Date());
    setSelectedCampaign(editingPost.campaign?._id || 'none');
    setSelectedUser(editingPost.assignedUser?._id || 'none');
    if (editingPost.imageUrl) {
      setImagePreview(editingPost.imageUrl);
      setImage(null);
      setRemoveImage(false);
    } else {
      setImagePreview(null);
      setRemoveImage(false);
    }
  }, [editingPost]);

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const response = await api.get('/api/campaigns');
      setCampaigns(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/api/users/for-assignment');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchScheduledPosts = async () => {
    try {
      const response = await api.get('/api/posts?status=scheduled');
      setScheduledPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching scheduled posts:', err);
      setScheduledPosts([]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setContent('');
    setImage(null);
    setImagePreview(null);
    setScheduledDate(new Date());
    setSelectedCampaign('none');
    setSelectedUser('none');
    setRemoveImage(false);
    const fileInput = document.getElementById('create-item-image');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!content || !content.trim()) {
        showError('Post content is required');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('content', content);
      if (image) formData.append('image', image);

      const dateToSubmit = new Date(scheduledDate);
      dateToSubmit.setHours(0, 0, 0, 0);
      formData.append('scheduledDate', dateToSubmit.toISOString());
      formData.append('campaign', selectedCampaign === 'none' ? '' : selectedCampaign);
      formData.append('assignedUser', selectedUser === 'none' ? '' : selectedUser);
      // Reviewer is no longer set from this form
      if (editingPost && removeImage) {
        formData.append('removeImage', 'true');
      }

      let response;
      if (editingPost && editingPost._id) {
        response = await api.put(`/api/posts/${editingPost._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showSuccess('Post updated successfully!');
        if (typeof onUpdated === 'function') onUpdated(response.data);
      } else {
        response = await api.post('/api/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showSuccess('Post created successfully!');
        if (typeof onCreated === 'function') onCreated(response.data);
        resetForm();
      }
    } catch (err) {
      console.error('Error submitting post:', err);
      showError(err?.response?.data?.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingPost || !editingPost._id) return;
    try {
      setLoading(true);
      await api.delete(`/api/posts/${editingPost._id}`);
      showSuccess('Post deleted successfully!');
      if (typeof onDeleted === 'function') onDeleted(editingPost._id);
    } catch (err) {
      console.error('Error deleting post:', err);
      showError(err?.response?.data?.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form-container create-item-form">
      <h2 className="section-header">{editingPost ? 'Edit Item' : 'Create New Item'}</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="create-item-content">Post Content:</label>
          <AutoGrowTextarea
            id="create-item-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here..."
            minRows={4}
            maxRows={12}
            required
          />
          {onRequestAIPanelToggle && (
            <button
              type="button"
              className="help-write-btn"
              onClick={onRequestAIPanelToggle}
            >
              Help me write
            </button>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="create-item-image">Upload Image (optional):</label>
          <input
            type="file"
            id="create-item-image"
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
                  if (editingPost) setRemoveImage(true);
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="create-item-campaign">Campaign (optional):</label>
            <select
              id="create-item-campaign"
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
            <label htmlFor="create-item-assignedUser">Assignee (optional):</label>
            <select
              id="create-item-assignedUser"
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
        </div>

        <div className="form-group">
          <label htmlFor="create-item-scheduledDate">Publish Date:</label>
          <DatePicker
            id="create-item-scheduledDate"
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
              return (day === 0 || day === 6) ? 'react-datepicker__day--weekend' : undefined;
            }}
            key={scheduledPosts.length}
          />
        </div>

        <div className="form-buttons">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (editingPost ? 'Updating...' : 'Creating...') : (editingPost ? 'Update Item' : 'Create Item')}
          </button>
          {editingPost && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => typeof onCancelled === 'function' ? onCancelled() : null}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          {editingPost && (
            <button
              type="button"
              className="delete-btn"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Post
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateItemForm;
