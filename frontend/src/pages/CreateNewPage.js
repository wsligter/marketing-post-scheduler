import React, { useState } from 'react';
import '../styles/create-new.css';
import CreateItemForm from '../components/create/CreateItemForm';
import AIPanel from '../components/create/AIPanel';

const CreateNewPage = () => {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [setFormContent, setSetFormContent] = useState(null); // function to inject content into CreateItemForm

  return (
    <div className="create-new-page page-container">
      <div className="create-new-container">
        {/* Left side - Form */}
        <div className="form-section">
          <CreateItemForm 
            onCreated={() => {}}
            onRequestAIPanelToggle={() => setShowAIPanel((v) => !v)}
            registerSetContent={(fn) => setSetFormContent(() => fn)}
          />
        </div>

        {/* Right side - AI Assistant Panel */}
        <AIPanel 
          visible={showAIPanel}
          onClose={() => setShowAIPanel(false)}
          onUseContent={(text) => {
            if (setFormContent) setFormContent(text);
            setShowAIPanel(false);
          }}
        />
      </div>
    </div>
  );
};

export default CreateNewPage;
