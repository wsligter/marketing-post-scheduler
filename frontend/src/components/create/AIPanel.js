import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import AutoGrowTextarea from '../AutoGrowTextarea';
import '../../styles/auto-grow-textarea.css';
import '../../styles/create-new.css';

const AIPanel = ({ visible, onClose, onUseContent }) => {
  const [systemPrompts, setSystemPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [userInstructions, setUserInstructions] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [promptName, setPromptName] = useState('');

  useEffect(() => {
    if (visible) {
      fetchSystemPrompts();
    }
  }, [visible]);

  const fetchSystemPrompts = async () => {
    try {
      const response = await api.get('/api/system-prompts');
      setSystemPrompts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching system prompts:', err);
      setSystemPrompts([]);
    }
  };

  const handleGenerateContent = async () => {
    if (!userInstructions.trim()) return;

    setIsGenerating(true);
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
        body: JSON.stringify({ systemPrompt, userInstructions })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
      } else {
        const errorData = await response.json();
        console.error('AI generation failed:', errorData);
      }
    } catch (err) {
      console.error('Network error during content generation', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!promptName.trim() || !customSystemPrompt.trim()) return;
    try {
      await api.post('/api/system-prompts', { name: promptName, content: customSystemPrompt });
      setShowSavePrompt(false);
      setPromptName('');
      fetchSystemPrompts();
    } catch (err) {
      console.error('Error saving system prompt:', err);
    }
  };

  if (!visible) return null;

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <h3>AI Writing Assistant</h3>
        <button
          type="button"
          className="ai-close-btn"
          aria-label="Close"
          title="Close"
          onClick={onClose}
        >
          ×
        </button>
      </div>

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
        <label>OR <br /> Write a new System Prompt</label>
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
            onClick={() => onUseContent && onUseContent(generatedContent)}
          >
            Use This Content
          </button>
        </div>
      )}

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
  );
};

export default AIPanel;
