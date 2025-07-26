import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import AutoGrowTextarea from '../components/AutoGrowTextarea';
import '../styles/create-new.css';
import '../styles/auto-grow-textarea.css';

const CreateNewPage = () => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  // Form state (similar to PostForm)
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('none');
  const [selectedUser, setSelectedUser] = useState('none');
  const [selectedReviewer, setSelectedReviewer] = useState('none');
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);

  // AI Assistant state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [systemPrompts, setSystemPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [userInstructions, setUserInstructions] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [promptName, setPromptName] = useState('');

  useEffect(() => {
    fetchCampaigns();
    fetchUsers();
    fetchSystemPrompts();
    fetchScheduledPosts();
  }, []);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchScheduledPosts = async () => {
    try {
      const response = await api.get('/api/posts');
      setScheduledPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching scheduled posts:', err);
      setScheduledPosts([]);
    }
  };

  const fetchSystemPrompts = async () => {
    try {
      const response = await api.get('/api/system-prompts');
      setSystemPrompts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching system prompts:', err);
      setSystemPrompts([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Clear any existing notifications (they auto-dismiss)

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }
      formData.append('scheduledDate', scheduledDate.toISOString());
      formData.append('campaign', selectedCampaign === 'none' ? '' : selectedCampaign);
      formData.append('assignedUser', selectedUser === 'none' ? '' : selectedUser);
      formData.append('reviewer', selectedReviewer === 'none' ? '' : selectedReviewer);

      await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showSuccess('Post created successfully!');
      setContent('');
      setImage(null);
      setImagePreview(null);
      setScheduledDate(new Date());
      setSelectedCampaign('none');
      setSelectedUser('none');
      setSelectedReviewer('none');
    } catch (err) {
      console.error('Error creating post:', err);
      showError(err?.response?.data?.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!userInstructions.trim()) {
      showError('Please enter instructions for content generation');
      return;
    }

    setIsGenerating(true);
    // Clear any existing notifications

    try {
      const systemPrompt = selectedPrompt ? 
        systemPrompts.find(p => p._id === selectedPrompt)?.content : 
        customSystemPrompt;

      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          systemPrompt,
          userInstructions
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to generate content');
      }
    } catch (err) {
      showError('Network error occurred during content generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!promptName.trim() || !customSystemPrompt.trim()) {
      showError('Please enter both prompt name and content');
      return;
    }

    try {
      await api.post('/api/system-prompts', {
        name: promptName,
        content: customSystemPrompt
      });

      showSuccess('Prompt saved successfully!');
      setShowSavePrompt(false);
      setPromptName('');
      fetchSystemPrompts(); // Refresh the list
    } catch (err) {
      console.error('Error saving system prompt:', err);
      showError(err.response?.data?.message || 'Network error occurred while saving prompt');
    }
  };

  const useGeneratedContent = () => {
    setContent(generatedContent);
    setGeneratedContent('');
    setShowAIPanel(false);
  };

  return (
    <div className="create-new-page">
      <div className="create-new-container">
        {/* Left side - Form */}
        <div className="form-section">
          <h2>Create New Item</h2>

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
              <button 
                type="button" 
                className="help-write-btn"
                onClick={() => setShowAIPanel(!showAIPanel)}
              >
                {showAIPanel ? 'Hide AI Assistant' : 'Help me write'}
              </button>
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
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="campaign">Campaign (optional):</label>
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
                <label htmlFor="assignedUser">Assignee (optional):</label>
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
                <label htmlFor="reviewer">Reviewer (optional):</label>
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

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Creating...' : 'Create Item'}
            </button>
          </form>
        </div>

        {/* Right side - AI Assistant Panel */}
        {showAIPanel && (
          <div className="ai-panel">
            <h3>AI Writing Assistant</h3>
            
            <div className="ai-form-group">
              <select
                value={selectedPrompt}
                onChange={(e) => {
                  setSelectedPrompt(e.target.value);
                  if (e.target.value) {
                    const prompt = systemPrompts.find(p => p._id === e.target.value);
                    setCustomSystemPrompt(prompt?.content || '');
                  }
                }}
              >
                <option value="">Saved prompts</option>
                {systemPrompts.map(prompt => (
                  <option key={prompt._id} value={prompt._id}>
                    {prompt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ai-form-group">
              <label>OR 
                <br />
                Write a new System Prompt</label>
              <AutoGrowTextarea
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
                placeholder="Enter your system prompt here..."
                minRows={4}
                maxRows={10}
              />
              <button 
                type="button" 
                className="save-prompt-btn"
                onClick={() => setShowSavePrompt(true)}
                disabled={!customSystemPrompt.trim()}
              >
                Save Prompt
              </button>
            </div>

            <div className="ai-form-group">
              <label>Specific Instructions</label>
              <AutoGrowTextarea
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder="Enter specific instructions for content generation..."
                minRows={3}
                maxRows={8}
              />
            </div>

            <button 
              type="button" 
              className="generate-btn"
              onClick={handleGenerateContent}
              disabled={isGenerating || !userInstructions.trim()}
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>

            {generatedContent && (
              <div className="generated-content">
                <h4>Generated Content:</h4>
                <div className="content-preview">{generatedContent}</div>
                <button 
                  type="button" 
                  className="use-content-btn"
                  onClick={useGeneratedContent}
                >
                  Use This Content
                </button>
              </div>
            )}

            {/* Save Prompt Modal */}
            {showSavePrompt && (
              <div className="modal-overlay">
                <div className="modal">
                  <h4>Save System Prompt</h4>
                  <input
                    type="text"
                    value={promptName}
                    onChange={(e) => setPromptName(e.target.value)}
                    placeholder="Enter prompt name..."
                  />
                  <div className="modal-buttons">
                    <button onClick={handleSavePrompt}>Save</button>
                    <button onClick={() => setShowSavePrompt(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNewPage;
