import React, { useState, useEffect } from 'react';
import '../styles/create-new.css';

const CreateNewPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state (similar to PostForm)
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState('');

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
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchSystemPrompts = async () => {
    try {
      const response = await fetch('/api/system-prompts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSystemPrompts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching system prompts:', err);
      setSystemPrompts([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const postData = {
        content,
        imageUrl,
        scheduledDate,
        campaign: selectedCampaign || null,
        assignedUser: selectedUser || null,
        reviewer: selectedReviewer || null
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        setSuccess('Item created successfully!');
        // Reset form
        setContent('');
        setImageUrl('');
        setScheduledDate('');
        setSelectedCampaign('');
        setSelectedUser('');
        setSelectedReviewer('');
        setGeneratedContent('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create item');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!userInstructions.trim()) {
      setError('Please enter instructions for content generation');
      return;
    }

    setIsGenerating(true);
    setError('');

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
        setError(errorData.message || 'Failed to generate content');
      }
    } catch (err) {
      setError('Network error occurred during content generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!promptName.trim() || !customSystemPrompt.trim()) {
      setError('Please enter both prompt name and content');
      return;
    }

    try {
      const response = await fetch('/api/system-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: promptName,
          content: customSystemPrompt
        })
      });

      if (response.ok) {
        setSuccess('Prompt saved successfully!');
        setShowSavePrompt(false);
        setPromptName('');
        fetchSystemPrompts(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save prompt');
      }
    } catch (err) {
      setError('Network error occurred while saving prompt');
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
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-group">
              <label htmlFor="content">Content *</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your content here..."
                required
                rows={6}
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
              <label htmlFor="imageUrl">Image URL</label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="scheduledDate">Scheduled Date</label>
              <input
                type="datetime-local"
                id="scheduledDate"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="campaign">Campaign</label>
              <select
                id="campaign"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="">Select Campaign</option>
                {campaigns.map(campaign => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignedUser">Assign To</label>
              <select
                id="assignedUser"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reviewer">Reviewer</label>
              <select
                id="reviewer"
                value={selectedReviewer}
                onChange={(e) => setSelectedReviewer(e.target.value)}
              >
                <option value="">Select Reviewer</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
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
              <label>System Prompt</label>
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
                <option value="">Select existing prompt or create custom</option>
                {systemPrompts.map(prompt => (
                  <option key={prompt._id} value={prompt._id}>
                    {prompt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ai-form-group">
              <label>Custom System Prompt</label>
              <textarea
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
                placeholder="Enter your system prompt here..."
                rows={4}
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
              <textarea
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder="Enter specific instructions for content generation..."
                rows={3}
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
